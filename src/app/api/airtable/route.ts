import { NextRequest, NextResponse } from 'next/server';

// Server-side Airtable configuration (NOT exposed to client)
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = 'VB';

export async function POST(request: NextRequest) {
  try {
    // Validate that environment variables are set
    if (!apiKey || !baseId) {
      console.error('Missing Airtable credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse the request body
    const formData = await request.json();

    // Prepare the data for Airtable
    const airtableData = {
      fields: formData
    };

    // Submit to Airtable
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', errorText);
      return NextResponse.json(
        { error: `Airtable API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error submitting to Airtable:', error);
    return NextResponse.json(
      { error: 'Failed to submit to Airtable' },
      { status: 500 }
    );
  }
}
