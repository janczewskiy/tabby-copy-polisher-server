import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;

  const promptPath = path.join(process.cwd(), 'config', 'prompt.json');
  const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf8'));

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: promptData.prompt },
      { role: 'user', content }
    ],
    model: 'gpt-4-turbo'
  });

  return res.status(200).json({ result: completion.choices[0].message.content });
}
