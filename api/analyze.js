export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*'); // 👈 ключевая строка

  const { image, token } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const AUTH_TOKEN = process.env.AUTH_TOKEN || "tabby_secret";

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
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
          { role: "system", content: "You are a UX writer using the Tabby style guide..." },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${image}` }
              },
              {
                type: "text",
                text: "Analyze this screen and return suggestions."
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    res.json({ result: content || "No output." });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process image." });
  }
}
