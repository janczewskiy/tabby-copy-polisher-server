export default async function handler(req, res) {
  const { image, token } = req.body;
  const AUTH_TOKEN = "tabby_secret";
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          { role: "system", content: "You are a senior UX writer for Tabby. Use Tabby style guide. Output a markdown table of copy suggestions." },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${image}` }
              },
              {
                type: "text",
                text: "Review the screen and suggest copy improvements in table format."
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    const result = await openaiRes.json();
    console.log("🔍 GPT-4 response:", JSON.stringify(result, null, 2));

    const content = result.choices?.[0]?.message?.content;
    res.status(200).json({ result: content || "No output." });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: "Failed to process." });
  }
}