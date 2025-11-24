import { NextRequest, NextResponse } from 'next/server';
import { getCustomers } from '@/lib/storage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Získat všechny zákazníky (pro admin)
export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.nextUrl.searchParams.get('password');

    // Jednoduchá autentizace
    if (adminPassword !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné heslo' }, { status: 401 });
    }

    const customersMap = await getCustomers();

    // Převést na pole a seřadit podle data vytvoření (nejnovější první)
    const customers = Object.values(customersMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Chyba při načítání zákazníků:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání zákazníků' },
      { status: 500 }
    );
  }
}
