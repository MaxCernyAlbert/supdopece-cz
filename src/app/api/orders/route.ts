import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrders } from '@/lib/storage';
import crypto from 'crypto';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
  note?: string;
  paymentMethod: 'online' | 'cash' | 'card_on_pickup';
  status: 'new' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

// Vytvořit novou objednávku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const order: OrderData = {
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

    // Načíst existující objednávky
    const orders = await getOrders();

    // Přidat novou objednávku
    orders[order.id] = order as any;

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

    const ordersMap = await getOrders();

    // Převést na pole a seřadit podle data vytvoření (nejnovější první)
    const orders = Object.values(ordersMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Chyba při načítání objednávek:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání objednávek' },
      { status: 500 }
    );
  }
}
