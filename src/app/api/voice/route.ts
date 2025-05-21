import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { companion_name, personality, user_id } = await request.json();

    if (!companion_name || !personality) {
      return NextResponse.json(
        { error: 'Missing required fields: companion_name or personality' },
        { status: 400 }
      );
    }

    // Call backend API to initiate voice call
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/voice/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companion_name,
        personality,
        user_id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to initiate voice call' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error initiating voice call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
