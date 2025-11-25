import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, saveCustomers, Customer } from '@/lib/storage';

// Helper function to send email (placeholder - implement with your email provider)
async function sendMagicLinkEmail(email: string, name: string, magicLink: string): Promise<boolean> {
  try {
    // TODO: Implement with Resend, SendGrid, or other email provider
    console.log(`📧 Sending magic link email to ${email} for ${name}: ${magicLink}`);
    // For now, just log it
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

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

// ADMIN: Vytvoření magic linku
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, adminPassword } = await request.json();

    // Jednoduchá admin autentizace (v produkci použij lepší řešení)
    if (adminPassword !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné admin heslo' }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Jméno je povinné' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Vyplňte alespoň email nebo telefon' }, { status: 400 });
    }

    const customers = await getCustomers();

    // Vytvoření hezkého ID ze jména
    // "Jan Novák" -> "jan-novak"
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Odstranit diakritiku
      .replace(/[^a-z0-9]+/g, '-')      // Nahradit mezery a spec. znaky pomlčkou
      .replace(/^-+|-+$/g, '');         // Odstranit pomlčky na začátku/konci

    // Přidat náhodné číslo pokud už existuje
    let token = slug;
    let counter = 1;
    while (customers[token]) {
      token = `${slug}-${counter}`;
      counter++;
    }

    // Uložení zákazníka (bez expirace - platí navždy)
    const customer: Customer = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      token,
      createdAt: new Date().toISOString(),
    };

    customers[token] = customer;
    await saveCustomers(customers);

    // Magic link URL - hezčí formát
    const magicLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/u/${token}`;

    // Send magic link via available channels
    let emailSent = false;
    let smsSent = false;

    if (email) {
      emailSent = await sendMagicLinkEmail(email, name, magicLink);
    }

    if (phone) {
      smsSent = await sendMagicLinkSMS(phone, name, magicLink);
    }

    console.log('Vytvořen trvalý magic link pro:', name, email || phone);

    return NextResponse.json({
      success: true,
      message: 'Magic link vytvořen',
      magicLink,
      customer,
      emailSent,
      smsSent,
    });
  } catch (error) {
    console.error('Chyba při generování magic link:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    console.error('Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Chyba při vytváření magic link',
        details: error instanceof Error ? error.message : String(error),
        // V development módu ukázat více detailů
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}

// Ověření tokenu
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token chybí' }, { status: 400 });
  }

  const customers = await getCustomers();
  const customer = customers[token];

  if (!customer) {
    return NextResponse.json({ error: 'Neplatný token' }, { status: 401 });
  }

  // Token je trvalý - žádná expirace
  return NextResponse.json({
    valid: true,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  });
}
