import { NextRequest, NextResponse } from 'next/server';
import { getCustomers } from '@/lib/storage';

// Helper function to send SMS (placeholder - implement with your SMS provider)
async function sendMagicLinkSMS(phone: string, name: string, magicLink: string): Promise<boolean> {
  try {
    // TODO: Implement with Twilio, MessageBird, or other SMS provider
    console.log(`📱 Sending magic link SMS to ${phone} for ${name}: ${magicLink}`);
    // For now, just log it
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();

    // Admin authentication
    if (password !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné admin heslo' }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token je povinný' }, { status: 400 });
    }

    const customers = await getCustomers();
    const customer = customers[token];

    if (!customer) {
      return NextResponse.json({ error: 'Zákazník nenalezen' }, { status: 404 });
    }

    if (!customer.phone) {
      return NextResponse.json({ error: 'Zákazník nemá vyplněný telefon' }, { status: 400 });
    }

    // Generate magic link
    const magicLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/u/${token}`;

    // Send SMS
    const smsSent = await sendMagicLinkSMS(customer.phone, customer.name, magicLink);

    if (!smsSent) {
      return NextResponse.json({ error: 'Nepodařilo se odeslat SMS' }, { status: 500 });
    }

    console.log(`Magic link odeslán na ${customer.phone} pro ${customer.name}`);

    return NextResponse.json({
      success: true,
      message: 'Magic link odeslán',
      phone: customer.phone,
    });
  } catch (error) {
    console.error('Chyba při odesílání magic link:', error);
    return NextResponse.json(
      { error: 'Chyba při odesílání magic link' },
      { status: 500 }
    );
  }
}
