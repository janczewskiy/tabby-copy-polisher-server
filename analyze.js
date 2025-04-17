export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { image, token } = req.body;

  if (token !== process.env.AUTH_TOKEN && token !== "tabby_secret") {
    return res.status(401).send("Unauthorized");
  }

  const SYSTEM_PROMPT = \`You are a senior UX writer and language specialist working with the Tabby team. Use the official Tabby style guide strictly. Follow approved terminology, tone, and formatting rules only. Output a markdown table with suggestions for interface copy improvements. Do not guess or assume — only act if supported by the guide.\`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
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
                image_url: { url: \`data:image/png;base64,\${image}\` }
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
    res.status(200).send(content || "No output.");
  } catch (err) {
    console.error("GPT error:", err);
    res.status(500).send("Failed to process image.");
  }
}