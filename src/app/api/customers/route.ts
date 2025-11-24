import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TOKENS_FILE = path.join(process.cwd(), 'data', 'magic-tokens.json');

interface Customer {
  name: string;
  email: string;
  phone?: string;
  token: string;
  createdAt: string;
}

// Načíst zákazníky
async function loadCustomers(): Promise<Customer[]> {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    const tokens = JSON.parse(data);
    const customers: Customer[] = [];

    for (const [token, customer] of Object.entries(tokens)) {
      customers.push(customer as Customer);
    }

    // Seřadit podle data vytvoření (nejnovější první)
    customers.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return customers;
  } catch {
    return [];
  }
}

// Získat všechny zákazníky (pro admin)
export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.nextUrl.searchParams.get('password');

    // Jednoduchá autentizace
    if (adminPassword !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné heslo' }, { status: 401 });
    }

    const customers = await loadCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Chyba při načítání zákazníků:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání zákazníků' },
      { status: 500 }
    );
  }
}
