export default async function handler(req, res) {
  console.log("🟡 Incoming request to /api/analyze");

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("🟡 Preflight (OPTIONS) request");
    return res.status(200).end();
  }

  const { image, token } = req.body;

  console.log("🔍 Request method:", req.method);
  console.log("🧪 Token received:", token);
  console.log("🖼️ Image size (base64 length):", image?.length);

  if (!image) {
    console.log("❌ No image in request body");
    return res.status(400).json({ error: "No image provided" });
  }

  if (token !== process.env.AUTH_TOKEN && token !== "tabby_secret") {
    console.log("❌ Unauthorized: invalid token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const SYSTEM_PROMPT = `You are a senior UX writer and language specialist working with the Tabby team. Use the official Tabby style guide strictly. Follow approved terminology, tone, and formatting rules only. Output a markdown table with suggestions for interface copy improvements. Do not guess or assume — only act if supported by the guide.`;

  try {
    console.log("🚀 Sending image to OpenAI API...");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
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
                image_url: { url: `data:image/png;base64,${image}` },
              },
              {
                type: "text",
                text: "Analyze this screen and return a table with suggestions based on the style guide.",
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    const result = await openaiRes.json();
    const content = result.choices?.[0]?.message?.content;

    console.log("✅ OpenAI responded successfully");
    res.status(200).json({ result: content || "No output." });
  } catch (err) {
    console.error("🔥 Error during OpenAI call:", err);
    res.status(500).json({ error: "Failed to process image." });
  }
}
