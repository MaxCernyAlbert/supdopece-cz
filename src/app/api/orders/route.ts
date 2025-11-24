import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
  note?: string;
  paymentMethod: 'online' | 'cash' | 'card_on_pickup';
  status: 'new' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

// Načíst objednávky
async function loadOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Uložit objednávky
async function saveOrders(orders: Order[]) {
  try {
    await fs.mkdir(path.dirname(ORDERS_FILE), { recursive: true });
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Chyba při ukládání objednávek:', error);
  }
}

// Vytvořit novou objednávku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const order: Order = {
      id: `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      items: body.items.map((item: any) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalPrice: body.totalPrice,
      pickupDate: body.pickupDate,
      pickupTime: body.pickupTime,
      note: body.note,
      paymentMethod: body.paymentMethod,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const orders = await loadOrders();
    orders.unshift(order); // Přidat na začátek (nejnovější první)
    await saveOrders(orders);

    console.log('🎉 NOVÁ OBJEDNÁVKA:', {
      id: order.id,
      zákazník: order.customerName,
      email: order.customerEmail,
      celkem: order.totalPrice + ' Kč',
      vyzvednutí: `${order.pickupDate} v ${order.pickupTime}`,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Chyba při vytváření objednávky:', error);
    return NextResponse.json(
      { error: 'Chyba při vytváření objednávky' },
      { status: 500 }
    );
  }
}

// Získat všechny objednávky (pro admin)
export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.nextUrl.searchParams.get('password');

    // Jednoduchá autentizace
    if (adminPassword !== 'admin123') {
      return NextResponse.json({ error: 'Neplatné heslo' }, { status: 401 });
    }

    const orders = await loadOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Chyba při načítání objednávek:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání objednávek' },
      { status: 500 }
    );
  }
}
