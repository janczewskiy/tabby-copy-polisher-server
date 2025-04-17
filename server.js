
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "tabby_secret";

const SYSTEM_PROMPT = `You are a senior UX writer and language specialist working with the Tabby team. Use the official Tabby style guide strictly. Follow approved terminology, tone, and formatting rules only. Output a markdown table with suggestions for interface copy improvements. Do not guess or assume — only act if supported by the guide.`;

app.post("/analyze", async (req, res) => {
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
          { role: "system", content: SYSTEM_PROMPT },
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
