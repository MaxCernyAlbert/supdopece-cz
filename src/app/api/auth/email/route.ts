import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, saveCustomers, Customer } from '@/lib/storage';

// Email codes storage (similar to SMS codes)
interface EmailCode {
  email: string;
  code: string;
  customerName: string;
  expiresAt: number;
}

const emailCodes: Record<string, EmailCode> = {};

// Find customer by email
async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const customers = await getCustomers();

  for (const customer of Object.values(customers)) {
    if (customer.email.toLowerCase() === email.toLowerCase()) {
      return customer;
    }
  }

  return null;
}

// Generate 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email (demo mode or real email)
async function sendEmail(email: string, code: string): Promise<boolean> {
  // DEMO MODE - just log to console
  console.log('📧 Email to', email, ':', code);

  // FOR PRODUCTION - uncomment and use email service:

  /*
  // NODEMAILER (Gmail/SMTP)
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Váš přihlašovací kód - Šup do pece',
    text: `Váš přihlašovací kód je: ${code}\n\nKód je platný 5 minut.`,
    html: `
      <h2>Šup do pece</h2>
      <p>Váš přihlašovací kód je:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>Kód je platný 5 minut.</p>
    `,
  });
  */

  /*
  // SENDGRID
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Váš přihlašovací kód - Šup do pece',
    text: `Váš přihlašovací kód je: ${code}\n\nKód je platný 5 minut.`,
    html: `
      <h2>Šup do pece</h2>
      <p>Váš přihlašovací kód je:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>Kód je platný 5 minut.</p>
    `,
  });
  */

  return true;
}

// Send email with code
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email je povinný' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find or create customer
    let customer = await findCustomerByEmail(normalizedEmail);

    if (!customer) {
      // Auto-create customer on first email login
      const customers = await getCustomers();

      const tempName = name || `User ${normalizedEmail.split('@')[0]}`;

      customer = {
        name: tempName,
        email: normalizedEmail,
        phone: '', // No phone for email-only users
        token: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      customers[customer.token] = customer;
      await saveCustomers(customers);

      console.log('[EMAIL] Auto-created customer:', tempName, normalizedEmail);
    }

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store code
    emailCodes[normalizedEmail] = {
      email: normalizedEmail,
      code,
      customerName: customer.name,
      expiresAt,
    };

    // Send email
    await sendEmail(normalizedEmail, code);

    return NextResponse.json({
      success: true,
      message: 'Email s kódem odeslán',
      // For demo purposes return code
      demoCode: code,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Chyba při odesílání emailu' },
      { status: 500 }
    );
  }
}

// Verify email code
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    const code = request.nextUrl.searchParams.get('code');

    if (!email || !code) {
      return NextResponse.json({ error: 'Email a kód jsou povinné' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Load email code
    const emailData = emailCodes[normalizedEmail];

    if (!emailData) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 401 });
    }

    // Check expiration
    if (Date.now() > emailData.expiresAt) {
      delete emailCodes[normalizedEmail];
      return NextResponse.json({ error: 'Kód vypršel' }, { status: 401 });
    }

    // Verify code
    if (emailData.code !== code) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 401 });
    }

    // Delete used code
    delete emailCodes[normalizedEmail];

    // Find customer
    const customer = await findCustomerByEmail(normalizedEmail);

    if (!customer) {
      return NextResponse.json({ error: 'Zákazník nenalezen' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Chyba při ověřování kódu' },
      { status: 500 }
    );
  }
}
