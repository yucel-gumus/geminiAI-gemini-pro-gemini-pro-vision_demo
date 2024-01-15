const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json({ limit: "5000mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "5000mb",
    parameterLimit: 900000,
  })
);

const generationConfig = {
  stopSequences: [],
  maxOutputTokens: 2048,
  temperature: 0.2,
  topP: 0.95,
  topK: 1,
};

const generationConfig2 = {
  stopSequences: [],
  maxOutputTokens: 2048,
  temperature: 0.9,
  topP: 1,
  topK: 16,
};

app.post("/generateContent", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'prompt' in the request body." });
    }
    const genAI = new GoogleGenerativeAI(
      "Your GEmini Api Key"
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig,
    });
    const chat = model.startChat({});

    let chatHistory = [];
    async function sendMessages(messages, role) {
      for (const message of messages) {
        const result = await chat.sendMessageStream(message);
        const text = [];
        for await (const item of result.stream) {
          const chunkText = item.text();
          text.push(chunkText);
        }
        chatHistory.push({ role, text: text.join("") });
      }
    }
    await sendMessages([prompt], "user");
    await sendMessages(req.body.past_messages, "assistant");
    const result = await chat.sendMessageStream(prompt);
    let cevap = "";
    for await (const item of result.stream) {
      const chunkText = item.text();
      cevap += chunkText;
    }
    chatHistory.push({ role: "assistant", text: cevap });

    res.json({ chatHistory });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/generateImage", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const imageParts = [req.body.imageParts];
    const genAI = new GoogleGenerativeAI(
      "Your GEmini Api Key"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
      generationConfig2,
    });

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server başlatıldı http://localhost:${port}`);
});
