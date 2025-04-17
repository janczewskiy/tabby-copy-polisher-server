export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content provided' });
  }

  return res.status(200).json({
    result: `✅ Got: "${content}"`
  });
}
