const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Você", message);
  input.value = "";

  try {
    const res = await fetch(
      "https://4f33-194-210-88-117.ngrok-free.app/webhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      }
    );

    const data = await res.json();
    const respostas = data.fulfillment_response?.messages || [];
    respostas.forEach((msg) => {
      appendMessage("Garfield", msg.text.text[0]);
    });
  } catch (err) {
    appendMessage("Garfield", "Erro ao falar com o assistente.");
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = "message";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
