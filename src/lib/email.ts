import { config } from '@/data/config';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  magicLink: string;
}

// Send email using Resend API
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('⚠️ RESEND_API_KEY not set, skipping email');
    console.log(`Would send email to ${to}: ${subject}`);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.name} <objednavky@${process.env.RESEND_DOMAIN || 'supdopece.cz'}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    console.log(`📧 Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Format price with thousand separator
function formatPrice(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

// Format date to Czech format
function formatDate(dateString: string): string {
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  }
  return dateString;
}

// Payment method labels
const paymentLabels: Record<string, string> = {
  card: 'Kartou online',
  onPickup: 'Při vyzvednutí',
  qrCode: 'QR kódem (bankovní převod)',
};

// Send order confirmation email
export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<boolean> {
  if (!data.customerEmail) return false;

  const itemsHtml = data.items
    .map(item => `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}x</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}&nbsp;Kč</td>
    </tr>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Potvrzení objednávky</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d97706; margin: 0;">🥖 ${config.name}</h1>
        <p style="color: #666; margin: 5px 0;">${config.tagline}</p>
      </div>

      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #92400e; margin: 0 0 10px 0;">✅ Děkujeme za objednávku!</h2>
        <p style="margin: 0; color: #78350f;">Číslo objednávky: <strong>${data.orderId}</strong></p>
      </div>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Objednané položky</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #e5e7eb;">
              <th style="padding: 8px; text-align: left;">Položka</th>
              <th style="padding: 8px; text-align: center;">Počet</th>
              <th style="padding: 8px; text-align: right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 8px; font-weight: bold;">Celkem</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #d97706; font-size: 18px;">
                ${formatPrice(data.totalPrice)}&nbsp;Kč
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af;">📍 Vyzvednutí</h3>
        <p style="margin: 5px 0;"><strong>Datum:</strong> ${formatDate(data.pickupDate)}</p>
        <p style="margin: 5px 0;"><strong>Čas:</strong> ${data.pickupTime}</p>
        <p style="margin: 5px 0;"><strong>Adresa:</strong> ${config.address}</p>
        <p style="margin: 5px 0;"><strong>Platba:</strong> ${paymentLabels[data.paymentMethod] || data.paymentMethod}</p>
      </div>

      ${data.paymentMethod === 'qrCode' ? `
      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #92400e;">💳 Platební údaje</h3>
        <p style="margin: 5px 0;"><strong>Číslo účtu:</strong> ${config.qrPayment.accountNumber}</p>
        <p style="margin: 5px 0;"><strong>Částka:</strong> ${formatPrice(data.totalPrice)} Kč</p>
        <p style="margin: 5px 0;"><strong>Variabilní symbol:</strong> ${data.orderId.replace(/[^0-9]/g, '').substring(0, 10)}</p>
        <p style="margin: 5px 0;"><strong>Zpráva:</strong> ${config.qrPayment.message}</p>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #78350f;">
          ⚠️ Platba musí být provedena před vyzvednutím objednávky.
        </p>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 5px 0;">Máte otázky? Kontaktujte nás:</p>
        <p style="margin: 5px 0;">📞 ${config.phone} | ✉️ ${config.email}</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    data.customerEmail,
    `Potvrzení objednávky ${data.orderId} - ${config.name}`,
    html
  );
}

// Send welcome/registration email
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vítejte v ${config.name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d97706; margin: 0;">🥖 ${config.name}</h1>
        <p style="color: #666; margin: 5px 0;">${config.tagline}</p>
      </div>

      <div style="background: #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #065f46; margin: 0 0 10px 0;">👋 Vítejte, ${data.name}!</h2>
        <p style="margin: 0; color: #047857;">Vaše registrace byla úspěšná.</p>
      </div>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0;">Pro přihlášení použijte tento odkaz:</p>
        <a href="${data.magicLink}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Přihlásit se
        </a>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
          Nebo zkopírujte tento odkaz:<br>
          <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${data.magicLink}</code>
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 5px 0;">📍 ${config.address}</p>
        <p style="color: #666; margin: 5px 0;">📞 ${config.phone}</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    data.email,
    `Vítejte v ${config.name}!`,
    html
  );
}

// Send magic link email
export async function sendMagicLinkEmail(email: string, name: string, magicLink: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Přihlašovací odkaz</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d97706; margin: 0;">🥖 ${config.name}</h1>
      </div>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0;">Ahoj ${name}!</h2>
        <p style="margin: 0 0 15px 0;">Klikni na tlačítko pro přihlášení:</p>
        <a href="${magicLink}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Přihlásit se
        </a>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Tento odkaz můžete použít kdykoliv pro přihlášení.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Přihlašovací odkaz - ${config.name}`, html);
}
