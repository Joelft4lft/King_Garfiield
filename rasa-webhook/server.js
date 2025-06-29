const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const RASA_URL =
  "https://king-garfiield-3-ids0.onrender.com/webhooks/rest/webhook";
const TRANSLATE_API_URL = "https://api.mymemory.translated.net/get";

// Cache de traduções para evitar chamadas repetidas
const translationCache = {};

// Gera uma chave única para o cache
function generateCacheKey(q, source, target) {
  return `${q}-${source}-${target}`;
}

// Função para dividir um texto em partes de até 500 caracteres
function splitText(text, maxLength = 500) {
  const parts = [];
  let i = 0;
  while (i < text.length) {
    parts.push(text.slice(i, i + maxLength));
    i += maxLength;
  }
  return parts;
}

// Função para traduzir texto usando MyMemory API com cache, divisão e rate limit
async function traduzirTexto(text, sourceLang, targetLang) {
  const cacheKey = generateCacheKey(text, sourceLang, targetLang);
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  const parts = splitText(text);

  try {
    const responses = [];

    for (const part of parts) {
      const response = await axios.get(TRANSLATE_API_URL, {
        params: {
          q: part,
          langpair: `${sourceLang}|${targetLang}`,
          de: "garfieldhouse22@gmail.com", // Substitua por seu email real
        },
      });

      responses.push(response);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Aguarda 1.1 segundos
    }

    const translatedText = responses
      .map((r) => r.data.responseData.translatedText)
      .join(" ");

    translationCache[cacheKey] = translatedText;
    return translatedText;
  } catch (error) {
    console.error("Erro ao traduzir:", error.message);
    return text; // fallback para texto original
  }
}

// Função para traduzir vários textos de botões de uma vez (usando separador)
async function traduzirBotoes(buttons, sourceLang, targetLang) {
  const textos = buttons.map((btn) => btn.title);
  const textoConcat = textos.join(" ||| ");
  const traducaoConcat = await traduzirTexto(
    textoConcat,
    sourceLang,
    targetLang
  );
  const textosTraduzidos = traducaoConcat.split(" ||| ");
  return textosTraduzidos;
}

// Endpoint para tradução manual (se precisar)
app.post("/translate", async (req, res) => {
  const { q, source, target } = req.body;

  if (!q || !source || !target) {
    return res.status(400).json({
      error: "Parâmetros q, source e target são obrigatórios",
    });
  }

  const translatedText = await traduzirTexto(q, source, target);
  res.json({ translatedText });
});

// Webhook principal para Dialogflow CX
app.post("/webhook", async (req, res) => {
  console.log(
    "Corpo recebido do Dialogflow CX:",
    JSON.stringify(req.body, null, 2)
  );

  let userText = req.body.text || "";
  let userLang = req.body.languageCode || "pt";

  if (!userText) {
    return res.json({
      fulfillment_response: {
        messages: [
          {
            text: { text: ["Desculpe, não consegui entender sua mensagem."] },
          },
        ],
      },
    });
  }

  try {
    // Traduz para PT se usuário não for pt
    if (userLang !== "pt") {
      userText = await traduzirTexto(userText, userLang, "pt");
      console.log(`Texto traduzido para PT: ${userText}`);
    }

    // Envia para o Rasa
    const rasaRes = await axios.post(RASA_URL, {
      sender: "dialogflow-cx-user",
      message: userText,
    });

    const messages = rasaRes.data;
    console.log("Resposta do Rasa:", JSON.stringify(messages, null, 2));

    if (!messages || messages.length === 0) {
      return res.json({
        fulfillment_response: {
          messages: [
            {
              text: { text: ["Desculpe, não entendi."] },
            },
          ],
        },
      });
    }

    // Traduz as mensagens e os títulos dos botões de uma vez só
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].text && userLang !== "pt") {
        messages[i].text = await traduzirTexto(
          messages[i].text,
          "pt",
          userLang
        );
      }

      if (
        messages[i].buttons &&
        messages[i].buttons.length > 0 &&
        userLang !== "pt"
      ) {
        const titulosTraduzidos = await traduzirBotoes(
          messages[i].buttons,
          "pt",
          userLang
        );
        messages[i].buttons = messages[i].buttons.map((btn, idx) => ({
          ...btn,
          title: titulosTraduzidos[idx] || btn.title,
        }));
      }
    }

    // Mapeia para formato Dialogflow CX
    const responseMessages = messages.map((msg) => {
      if (msg.buttons && msg.buttons.length > 0) {
        return {
          payload: {
            richContent: [
              [
                {
                  type: "description",
                  text: msg.text || "",
                },
                ...msg.buttons.map((btn) => ({
                  type: "button",
                  icon: {
                    type: "chevron_right",
                    color: "#FF9800",
                  },
                  text: btn.title,
                  event: {
                    name: btn.payload,
                    languageCode: userLang,
                  },
                  link: "",
                  accessibilityText: btn.title,
                })),
              ],
            ],
          },
        };
      } else {
        return {
          text: {
            text: [msg.text || ""],
          },
        };
      }
    });

    console.log(
      "Resposta que será enviada ao Dialogflow CX:",
      JSON.stringify(responseMessages, null, 2)
    );

    return res.json({
      fulfillment_response: {
        messages: responseMessages,
      },
    });
  } catch (error) {
    console.error("Erro ao consultar o Rasa:", error.message);
    return res.json({
      fulfillment_response: {
        messages: [
          {
            text: { text: ["Ocorreu um erro ao falar com o assistente."] },
          },
        ],
      },
    });
  }
});

// Endpoint para o Google Assistant fulfillment
app.post("/fulfillment", async (req, res) => {
  const userMessage = req.body.intent?.params?.any?.resolved ?? "Olá";
  const userLang = req.body.locale || "pt";

  try {
    const textoParaRasa =
      userLang !== "pt"
        ? await traduzirTexto(userMessage, userLang, "pt")
        : userMessage;

    const respostaRasa = await axios.post(RASA_URL, {
      sender: "usuario_assistant",
      message: textoParaRasa,
    });

    const respostaTexto =
      respostaRasa.data[0]?.text || "Desculpe, não entendi.";

    const respostaFinal =
      userLang !== "pt"
        ? await traduzirTexto(respostaTexto, "pt", userLang)
        : respostaTexto;

    res.json({
      prompt: {
        override: true,
        firstSimple: {
          speech: respostaFinal,
          text: respostaFinal,
        },
      },
    });
  } catch (error) {
    console.error("Erro no fulfillment:", error.message);
    res.json({
      prompt: {
        override: true,
        firstSimple: {
          speech: "Ocorreu um erro ao contactar o assistente.",
          text: "Ocorreu um erro ao contactar o assistente.",
        },
      },
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
