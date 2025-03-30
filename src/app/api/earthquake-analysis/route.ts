import { NextResponse } from 'next/server';
import { Earthquake, EarthquakeAnalysis } from '@/lib/types';

export async function POST(request: Request) {
  let earthquake: Earthquake | null = null;
  
  try {
    const { earthquake: earthquakeData } = await request.json();
    earthquake = earthquakeData;

    if (!earthquake) {
      return NextResponse.json(
        { error: 'Earthquake data is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const prompt = `Analyze this earthquake event and provide a structured response:
Location: ${earthquake.location}
Magnitude: ${earthquake.magnitude}
Depth: ${earthquake.depth} km
Time: ${new Date(earthquake.time).toLocaleString()}

Please provide the following information in a structured format:
1. How did this earthquake occur? (geological explanation)
2. What areas were affected?
3. Detailed information about the earthquake's characteristics and potential impact
4. Analysis of impact on specific countries [Thailand, India]
5. Analysis of impact on specific cities [Bangkok, Manila]
6. List of major cities affected by this earthquake, including their impact level (High/Medium/Low)

Format the response in JSON with these fields:
{
  "cause": "explanation of how it occurred",
  "affectedAreas": "general areas affected",
  "details": "detailed characteristics",
  "affectedCountries": [{"name": "country name", "impact": "impact description"}],
  "affectedCities": [
    {
      "name": "city name",
      "impact": "High/Medium/Low",
      "distance": "distance from epicenter in km"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a seismologist and geological expert. Analyze the earthquake data and provide detailed, accurate information in the requested JSON format. Focus on scientific accuracy and practical impact assessment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to generate analysis: ${response.statusText}`);
    }

    const result = await response.json();
    const analysis = result.choices[0].message.content;

    if (!analysis) {
      throw new Error('No analysis returned from API');
    }

    // Parse the response to ensure it's in the correct format
    let parsedAnalysis: EarthquakeAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (error) {
      console.error('Error parsing analysis:', error);
      // Fallback structured format if parsing fails
      parsedAnalysis = {
        cause: "This earthquake occurred due to tectonic plate movements in the region.",
        affectedAreas: "The earthquake affected the surrounding areas with varying intensities.",
        details: `A magnitude ${earthquake.magnitude} earthquake occurred at a depth of ${earthquake.depth} km.`,
        affectedCountries: [],
        affectedCities: []
      };
    }

    return NextResponse.json({ analysis: parsedAnalysis });
  } catch (error) {
    console.error('Error analyzing earthquake:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze earthquake', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: earthquake ? {
          cause: "This earthquake occurred due to tectonic plate movements in the region.",
          affectedAreas: "The earthquake affected the surrounding areas with varying intensities.",
          details: `A magnitude ${earthquake.magnitude} earthquake occurred at a depth of ${earthquake.depth} km.`,
          affectedCountries: [],
          affectedCities: []
        } : null
      },
      { status: 500 }
    );
  }
} 