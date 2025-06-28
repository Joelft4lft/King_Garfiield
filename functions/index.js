const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  try {
    // Texto enviado pelo usuário via Dialogflow CX (Google Assistant/Nest Hub)
    const userMessage = req.body.text || "Olá";

    // Identificador da sessão para diferenciar usuários
    const senderId = req.body.sessionInfo?.session || "default_sender";

    // Enviar mensagem para o Rasa
    const response = await axios.post(
        "https://8e63-148-63-225-0.ngrok-free.app/webhooks/rest/webhook",
        {
          sender: senderId,
          message: userMessage,
        },
    );

    // Pegar a resposta do Rasa (primeiro texto retornado)
    const rasaReply = response.data[0]?.text || "Desculpe, não entendi.";

    // Montar a resposta para o Dialogflow CX / Google Assistant (Nest Hub)
    const fulfillmentResponse = {
      fulfillment_response: {
        messages: [
          {
            text: {
              // Pode enviar vários textos, aqui só um
              text: [rasaReply],
            },
          },
        ],
      },
    };

    // Responder Dialogflow CX
    res.json(fulfillmentResponse);
  } catch (error) {
    console.error("Erro no webhook:", error);

    // Resposta de erro para Google Nest Hub/Dialogflow CX
    res.json({
      fulfillment_response: {
        messages: [
          {
            text: {
              text: ["Desculpe, ocorreu um erro no servidor."],
            },
          },
        ],
      },
    });
  }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
