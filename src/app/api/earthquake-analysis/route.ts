import Replicate from 'replicate';
import { StreamingTextResponse } from 'ai';
import { Earthquake } from '@/lib/types';

// Create a new Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
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

    // Use Llama 2 model for analysis
    const response = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      {
        input: {
          prompt,
          system_prompt: "You are a helpful seismologist explaining earthquakes to the general public in clear, simple terms.",
          max_new_tokens: 300,
          temperature: 0.7,
          top_p: 0.9,
          stream: true,
        },
      }
    );

    // Convert the response to a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        if (!response || !Array.isArray(response)) {
          controller.close();
          return;
        }

        for (const chunk of response) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    // Return the streaming response
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error analyzing earthquake:', error);
    return new Response('Error analyzing earthquake data', { status: 500 });
  }
} 