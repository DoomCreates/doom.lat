import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface VisionResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      message: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Vision API Error:', errorText);
      return NextResponse.json(
        { error: 'Vision API request failed' },
        { status: visionResponse.status }
      );
    }

    const data: VisionResponse = await visionResponse.json();

    if (data.responses[0].error) {
      return NextResponse.json(
        { error: data.responses[0].error.message },
        { status: 400 }
      );
    }

    const text = data.responses[0].fullTextAnnotation?.text || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
