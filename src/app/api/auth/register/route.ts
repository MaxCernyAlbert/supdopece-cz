import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, saveCustomers, Customer } from '@/lib/storage';

// Helper function to send email (placeholder - implement with your email provider)
async function sendWelcomeEmail(email: string, name: string, magicLink: string): Promise<boolean> {
  try {
    // TODO: Implement with Resend, SendGrid, or other email provider
    console.log(`📧 Sending welcome email to ${email} for ${name}: ${magicLink}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Helper function to send SMS (placeholder - implement with your SMS provider)
async function sendWelcomeSMS(phone: string, name: string, magicLink: string): Promise<boolean> {
  try {
    // TODO: Implement with Twilio, MessageBird, or other SMS provider
    console.log(`📱 Sending welcome SMS to ${phone} for ${name}: ${magicLink}`);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

// Self-registration endpoint
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Jméno je povinné' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Vyplňte alespoň email nebo telefon' }, { status: 400 });
    }

    const customers = await getCustomers();

    // Check if customer already exists (by email or phone)
    const existingCustomer = Object.values(customers).find(
      (c) => (email && c.email === email) || (phone && c.phone === phone)
    );

    if (existingCustomer) {
      // Customer exists - send login link instead
      const magicLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/u/${existingCustomer.token}`;

      let emailSent = false;
      let smsSent = false;

      if (email && existingCustomer.email) {
        emailSent = await sendWelcomeEmail(email, existingCustomer.name, magicLink);
      }

      if (phone && existingCustomer.phone) {
        smsSent = await sendWelcomeSMS(phone, existingCustomer.name, magicLink);
      }

      return NextResponse.json({
        success: true,
        message: 'Účet již existuje. Poslali jsme vám přihlašovací odkaz.',
        emailSent,
        smsSent,
      });
    }

    // Create new customer
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let token = slug;
    let counter = 1;
    while (customers[token]) {
      token = `${slug}-${counter}`;
      counter++;
    }

    const customer: Customer = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      token,
      createdAt: new Date().toISOString(),
    };

    customers[token] = customer;
    await saveCustomers(customers);

    // Generate magic link
    const magicLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/u/${token}`;

    // Send welcome messages
    let emailSent = false;
    let smsSent = false;

    if (email) {
      emailSent = await sendWelcomeEmail(email, name, magicLink);
    }

    if (phone) {
      smsSent = await sendWelcomeSMS(phone, name, magicLink);
    }

    console.log('Nová registrace:', name, email || phone);

    return NextResponse.json({
      success: true,
      message: 'Registrace úspěšná! Poslali jsme vám přihlašovací odkaz.',
      emailSent,
      smsSent,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Chyba při registraci' },
      { status: 500 }
    );
  }
}
