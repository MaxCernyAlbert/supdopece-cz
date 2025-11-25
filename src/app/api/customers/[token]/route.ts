import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, saveCustomers } from '@/lib/storage';

// Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { password, name, email, phone } = await request.json();

    // Admin authentication
    if (password !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné admin heslo' }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Jméno je povinné' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Vyplňte alespoň email nebo telefon' }, { status: 400 });
    }

    const customers = await getCustomers();

    if (!customers[token]) {
      return NextResponse.json({ error: 'Zákazník nenalezen' }, { status: 404 });
    }

    // Update customer
    customers[token] = {
      ...customers[token],
      name,
      email: email || undefined,
      phone: phone || undefined,
    };

    await saveCustomers(customers);

    return NextResponse.json({
      success: true,
      customer: customers[token],
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání zákazníka' },
      { status: 500 }
    );
  }
}

// Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const password = request.nextUrl.searchParams.get('password');

    // Admin authentication
    if (password !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné admin heslo' }, { status: 401 });
    }

    const customers = await getCustomers();

    if (!customers[token]) {
      return NextResponse.json({ error: 'Zákazník nenalezen' }, { status: 404 });
    }

    delete customers[token];
    await saveCustomers(customers);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání zákazníka' },
      { status: 500 }
    );
  }
}
