//
//import { NextApiRequest, NextApiResponse } from 'next';
//import { Configuration, OpenAIApi } from 'openai';
//import { prompt } from '../../config/prompt';

//const configuration = new Configuration({
  //apiKey: process.env.OPENAI_API_KEY,
//});

//const openai = new OpenAIApi(configuration);

//export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //if (req.method !== 'POST') {
    //return res.status(405).json({ error: 'Method Not Allowed' });
  //}

  //const { content } = req.body;

  //if (!content || typeof content !== 'string') {
    //return res.status(400).json({ error: 'Invalid content provided' });
  //}

  //try {
    //const completion = await openai.createChatCompletion({
      //model: 'gpt-4', // или временно: 'gpt-3.5-turbo'
      //messages: [
        //{ role: 'system', content: prompt },
        //{ role: 'user', content }
      //]
    //});

    //const result = completion.data.choices[0]?.message?.content ?? '';

    //return res.status(200).json({ result });
  //} catch (error: any) {
    //console.error('🔥 OpenAI API Error:', error);

    //return res.status(500).json({
      //error: 'OpenAI API error',
      //details: error?.response?.data || error.message || 'Unknown error'
    //});
  //}
//}
//

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content provided' });
  }

  return res.status(200).json({
    result: `✅ Received text: "${content}"`
  });
}
