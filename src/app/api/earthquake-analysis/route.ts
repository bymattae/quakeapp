import { Anthropic } from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import { Earthquake } from '@/lib/types';

// Create a new Anthropic client with the API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { earthquake } = await req.json() as { earthquake: Earthquake };
    
    const prompt = `Analyze this earthquake data and provide a brief, clear explanation for the general public:
    - Magnitude: ${earthquake.magnitude}
    - Location: ${earthquake.location}
    - Depth: ${earthquake.depth}km
    - Time: ${earthquake.time}

    Please explain:
    1. What this means for people in the area
    2. Basic context about why it happened
    3. Whether it's an aftershock (if you can determine this)
    4. Safety recommendations if needed

    Keep the response concise and use simple language.`;

    const response = await anthropic.messages.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      stream: true,
    });

    // Convert the response to a stream
    const stream = AnthropicStream(response);
    
    // Return the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error analyzing earthquake:', error);
    return new Response('Error analyzing earthquake data', { status: 500 });
  }
} 