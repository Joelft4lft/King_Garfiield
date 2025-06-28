const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;
const AGENT_ID = process.env.AGENT_ID;
const SESSION_ID = process.env.SESSION_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.use(express.json());

app.post("/detectIntent", async (req, res) => {
  const userText = req.body.text;
  if (!userText) {
    return res.status(400).json({ error: "Texto é obrigatório." });
  }

  const url = `https://${LOCATION}-dialogflow.googleapis.com/v3/projects/${PROJECT_ID}/locations/${LOCATION}/agents/${AGENT_ID}/sessions/${SESSION_ID}:detectIntent`;

  const body = {
    queryInput: {
      text: {
        text: userText,
      },
      languageCode: "pt-BR",
    },
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Retorna só o conteúdo útil para o frontend
    const messages = response.data.queryResult.responseMessages;

    res.json({ messages });
  } catch (error) {
    console.error("Erro Dialogflow CX:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao consultar o Dialogflow CX." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
