import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const TOKENS_FILE = path.join(process.cwd(), 'data', 'magic-tokens.json');
const SMS_CODES_FILE = path.join(process.cwd(), 'data', 'sms-codes.json');

interface Customer {
  name: string;
  email: string;
  token: string;
  phone?: string;
  createdAt: string;
}

interface SMSCode {
  phone: string;
  code: string;
  customerName: string;
  customerEmail: string;
  expiresAt: number;
}

// Načíst zákazníky
async function loadTokens(): Promise<Map<string, Customer>> {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    const tokens = JSON.parse(data);
    return new Map(Object.entries(tokens));
  } catch {
    return new Map();
  }
}

// Načíst SMS kódy
async function loadSMSCodes(): Promise<Map<string, SMSCode>> {
  try {
    const data = await fs.readFile(SMS_CODES_FILE, 'utf-8');
    const codes = JSON.parse(data);
    return new Map(Object.entries(codes));
  } catch {
    return new Map();
  }
}

// Uložit SMS kódy
async function saveSMSCodes(codes: Map<string, SMSCode>) {
  try {
    await fs.mkdir(path.dirname(SMS_CODES_FILE), { recursive: true });
    const obj = Object.fromEntries(codes);
    await fs.writeFile(SMS_CODES_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('Chyba při ukládání SMS kódů:', error);
  }
}

// Najít zákazníka podle telefonu
async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const tokens = await loadTokens();

  for (const customer of Array.from(tokens.values())) {
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

// Odeslat SMS s kódem
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Telefon je povinný' }, { status: 400 });
    }

    // Normalizovat telefon (odstranit mezery a +420)
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/^\+420/, '');

    // Najít zákazníka podle telefonu
    const customer = await findCustomerByPhone(normalizedPhone);

    if (!customer) {
      return NextResponse.json(
        { error: 'Tento telefon není registrován. Kontaktujte administrátora.' },
        { status: 404 }
      );
    }

    // Generovat 6místný kód
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minut

    // Uložit kód
    const smsCodes = await loadSMSCodes();
    smsCodes.set(normalizedPhone, {
      phone: normalizedPhone,
      code,
      customerName: customer.name,
      customerEmail: customer.email,
      expiresAt,
    });
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

// Ověřit kód
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    const code = request.nextUrl.searchParams.get('code');

    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefon a kód jsou povinné' }, { status: 400 });
    }

    // Normalizovat telefon
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/^\+420/, '');

    // Načíst kódy
    const smsCodes = await loadSMSCodes();
    const smsData = smsCodes.get(normalizedPhone);

    if (!smsData) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 401 });
    }

    // Zkontrolovat expiraci
    if (Date.now() > smsData.expiresAt) {
      smsCodes.delete(normalizedPhone);
      await saveSMSCodes(smsCodes);
      return NextResponse.json({ error: 'Kód vypršel' }, { status: 401 });
    }

    // Zkontrolovat kód
    if (smsData.code !== code) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 401 });
    }

    // Smazat použitý kód
    smsCodes.delete(normalizedPhone);
    await saveSMSCodes(smsCodes);

    // Najít zákazníka
    const customer = await findCustomerByPhone(normalizedPhone);

    if (!customer) {
      return NextResponse.json({ error: 'Zákazník nenalezen' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      name: customer.name,
      email: customer.email,
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error('Chyba při ověřování kódu:', error);
    return NextResponse.json(
      { error: 'Chyba při ověřování kódu' },
      { status: 500 }
    );
  }
}
