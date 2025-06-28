const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/translate", async (req, res) => {
  const { q, source, target } = req.body;

  const cacheKey = generateCacheKey(q, source, target);
  if (translationCache[cacheKey]) {
    return res.json({ translatedText: translationCache[cacheKey] });
  }

  const parts = splitText(q);

  try {
    const translationPromises = parts.map((part) =>
      axios.get(TRANSLATE_API_URL, {
        params: {
          q: part,
          langpair: `${source}|${target}`,
        },
      })
    );

    const responses = await Promise.all(translationPromises);
    const translatedText = responses
      .map((r) => r.data.responseData.translatedText)
      .join(" ");

    translationCache[cacheKey] = translatedText;

    res.json({ translatedText });
  } catch (error) {
    console.error("Erro ao traduzir:", error.message);
    res.status(500).json({ error: "Erro ao traduzir" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Endpoint para o Google Assistant → envia mensagens para o Rasa, traduz antes e depois
app.post("/fulfillment", async (req, res) => {
  const userMessage = req.body.intent?.params?.any?.resolved ?? "Olá";
  const userLang = "pt"; // ou detectar pelo Assistant, se necessário

  try {
    // Traduz para PT se necessário (assumimos entrada já em PT por enquanto)
    const textoTraduzido = userMessage; // opcionalmente: await traduzirTexto(userMessage, userLang, "pt");

    // Envia para o Rasa
    const respostaRasa = await axios.post(
      "http://localhost:5005/webhooks/rest/webhook",
      {
        sender: "usuario_assistant",
        message: textoTraduzido,
      }
    );

    const respostaTexto =
      respostaRasa.data[0]?.text || "Desculpe, não entendi.";

    // Traduz de volta (opcionalmente)
    const respostaFinal = respostaTexto; // ou await traduzirTexto(respostaTexto, "pt", userLang);

    // Resposta para o Google Assistant
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
