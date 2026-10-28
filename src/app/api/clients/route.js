import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function GET() {
  try {
    const clients = await db.client.findMany();
    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, websiteUrl, businessType, city, state, phone, email } = body;

    if (!name || !websiteUrl) {
      return NextResponse.json({ success: false, error: 'Name and website URL are required' }, { status: 400 });
    }

    const client = await db.client.create({
      data: {
        name,
        websiteUrl,
        businessType: businessType || 'Dental Clinic',
        city: city || 'Pune',
        state: state || 'Maharashtra',
        country: 'India',
        phone,
        email
      }
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
