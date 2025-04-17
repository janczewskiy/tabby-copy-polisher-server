import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "tabby_secret";

// ✅ ручная обработка preflight-запросов
app.options("/analyze", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).end();
});

app.post("/analyze", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ разрешаем CORS вручную

  const image = req.body.image;
  const token = req.body.token;

  if (token !== AUTH_TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `You are a senior UX writer and language specialist working with the Tabby team. Use the official Tabby style guide strictly. Follow approved terminology, tone, and formatting rules only. Output a markdown table with suggestions for interface copy improvements. Do not guess or assume — only act if supported by the guide.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${image}` }
              },
              {
                type: "text",
                text: "Analyze this screen and return a table with suggestions based on the style guide."
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    res.send(content || "No output.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to process image.");
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
