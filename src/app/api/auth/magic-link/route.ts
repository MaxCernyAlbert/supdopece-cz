import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, saveCustomers, Customer } from '@/lib/storage';

// ADMIN: Vytvoření magic linku
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, adminPassword } = await request.json();

    // Jednoduchá admin autentizace (v produkci použij lepší řešení)
    if (adminPassword !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné admin heslo' }, { status: 401 });
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Jméno a email jsou povinné' }, { status: 400 });
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
      email,
      phone: phone || undefined,
      token,
      createdAt: new Date().toISOString(),
    };

    customers[token] = customer;
    await saveCustomers(customers);

    // Magic link URL - hezčí formát
    const magicLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/u/${token}`;

    console.log('Vytvořen trvalý magic link pro:', name, email);

    return NextResponse.json({
      success: true,
      message: 'Magic link vytvořen',
      magicLink,
      customer,
    });
  } catch (error) {
    console.error('Chyba při generování magic link:', error);
    return NextResponse.json(
      { error: 'Chyba při vytváření magic link' },
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
  });
}
