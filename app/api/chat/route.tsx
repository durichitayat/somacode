import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});


export async function POST(req: Request) {
  const { messages } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      stream: true,
      messages: [
        { role: 'system', content: "you are an ai powered chatbot responsible for performing the game master role for an online game of Clue. Players are responsible for putting in their moves and you are responsible for interpreting the moves and then acting out the game. When a players move is complete say 'next player'" }
      ],
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);   

  } catch (error) {
    console.error('Error:', error);
  }

}