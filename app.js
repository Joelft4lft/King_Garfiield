const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  try {
    const userMessage = req.body.queryResult.queryText; // texto do usuário via Google Assistant
    const senderId = req.body.originalDetectIntentRequest.payload.user.userId;

    // Envia mensagem para Rasa
    const response = await axios.post(
      "https://4f33-194-210-88-117.ngrok-free.app/webhooks/rest/webhook",
      {
        sender: senderId,
        message: userMessage,
      }
    );

    // Pega resposta do Rasa (primeira resposta de texto)
    const rasaReply = response.data[0]?.text || "Desculpe, não entendi.";

    // Responde para Dialogflow / Google Assistant
    res.json({
      fulfillmentText: rasaReply,
    });
  } catch (error) {
    console.error(error);
    res.json({
      fulfillmentText: "Desculpe, ocorreu um erro.",
    });
  }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
