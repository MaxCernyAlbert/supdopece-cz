import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, getSMSCodes, saveSMSCodes, Customer, SMSCode } from '@/lib/storage';

// Najít zákazníka podle telefonu
async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const customers = await getCustomers();

  for (const customer of Object.values(customers)) {
    if (customer.phone === phone) {
      return customer;
    }
  }

  return null;
}

// Generovat 6místný kód
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Poslat SMS (demo mód nebo skutečná SMS)
async function sendSMS(phone: string, code: string): Promise<boolean> {
  // DEMO MÓD - jen vypíše do konzole
  console.log('📱 SMS pro', phone, ':', code);

  // PRO PRODUKCI - odkomentuj a použij SMS bránu:

  /*
  // TWILIO (mezinárodní)
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  await client.messages.create({
    body: `Váš přihlašovací kód: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
  */

  /*
  // SMSBRANA.CZ (české SMS)
  const response = await fetch('https://api.smsbrana.cz/smsconnect/http.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'send_sms',
      login: process.env.SMSBRANA_LOGIN!,
      password: process.env.SMSBRANA_PASSWORD!,
      number: phone,
      message: `Váš přihlašovací kód: ${code}`,
    }),
  });
  */

  return true;
}

// Send SMS with code
export async function POST(request: NextRequest) {
  try {
    const { phone, name, email } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Telefon je povinný' }, { status: 400 });
    }

    // Normalize phone: remove spaces, add +420 if not present
    let normalizedPhone = phone.replace(/\s+/g, '');

    // Add +420 prefix if not present (and not international number)
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+420' + normalizedPhone;
    }

    // Remove +420 for storage (we store without prefix)
    const phoneForStorage = normalizedPhone.replace(/^\+420/, '');

    // Find or create customer
    let customer = await findCustomerByPhone(phoneForStorage);

    if (!customer) {
      // Auto-create customer on first SMS login
      const {getCustomers, saveCustomers} = await import('@/lib/storage');
      const customers = await getCustomers();

      const tempName = name || `User ${phoneForStorage}`;
      const tempEmail = email || `${phoneForStorage}@temp.supdopece.cz`;

      customer = {
        name: tempName,
        email: tempEmail,
        phone: phoneForStorage,
        token: `phone-${phoneForStorage}`,
        createdAt: new Date().toISOString(),
      };

      customers[customer.token] = customer;
      await saveCustomers(customers);

      console.log('[SMS] Auto-created customer:', tempName, phoneForStorage);
    }

    // Generovat 6místný kód
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minut

    // Uložit kód
    const smsCodes = await getSMSCodes();
    smsCodes[normalizedPhone] = {
      phone: normalizedPhone,
      code,
      customerName: customer.name,
      customerEmail: customer.email,
      expiresAt,
    };
    await saveSMSCodes(smsCodes);

    // Poslat SMS
    await sendSMS(normalizedPhone, code);

    return NextResponse.json({
      success: true,
      message: 'SMS s kódem odeslána',
      // Pro demo účely vrátíme kód
      demoCode: code,
    });
  } catch (error) {
    console.error('Chyba při odesílání SMS:', error);
    return NextResponse.json(
      { error: 'Chyba při odesílání SMS' },
      { status: 500 }
    );
  }
}

// Verify SMS code
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    const code = request.nextUrl.searchParams.get('code');

    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefon a kód jsou povinné' }, { status: 400 });
    }

    // Normalize phone: add +420 if not present, then remove for storage
    let normalizedPhone = phone.replace(/\s+/g, '');
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+420' + normalizedPhone;
    }
    const phoneForStorage = normalizedPhone.replace(/^\+420/, '');

    // Load SMS codes
    const smsCodes = await getSMSCodes();
    const smsData = smsCodes[phoneForStorage];

    if (!smsData) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 401 });
    }

    // Check expiration
    if (Date.now() > smsData.expiresAt) {
      delete smsCodes[phoneForStorage];
      await saveSMSCodes(smsCodes);
      return NextResponse.json({ error: 'Kód vypršel' }, { status: 401 });
    }

    // Verify code
    if (smsData.code !== code) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 401 });
    }

    // Delete used code
    delete smsCodes[phoneForStorage];
    await saveSMSCodes(smsCodes);

    // Find customer
    const customer = await findCustomerByPhone(phoneForStorage);

    if (!customer) {
      return NextResponse.json({ error: 'Zákazník nenalezen' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      name: customer.name,
      email: customer.email,
      phone: phoneForStorage,
    });
  } catch (error) {
    console.error('Chyba při ověřování kódu:', error);
    return NextResponse.json(
      { error: 'Chyba při ověřování kódu' },
      { status: 500 }
    );
  }
}
