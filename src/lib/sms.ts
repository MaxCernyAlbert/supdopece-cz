import { config } from '@/data/config';

interface OrderConfirmationSMSData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
}

// Format price with thousand separator
function formatPrice(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Format date to Czech format
function formatDate(dateString: string): string {
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  }
  return dateString;
}

// Normalize phone number to international format
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Add Czech prefix if not present
  if (digits.length === 9) {
    digits = '420' + digits;
  }

  // Ensure it starts with +
  if (!digits.startsWith('+')) {
    digits = '+' + digits;
  }

  return digits;
}

// Send SMS via provider
async function sendSMS(to: string, message: string): Promise<boolean> {
  const smsApiKey = process.env.SMS_API_KEY;
  const smsApiUrl = process.env.SMS_API_URL;

  const normalizedPhone = normalizePhone(to);

  if (!smsApiKey || !smsApiUrl) {
    console.log('⚠️ SMS_API_KEY or SMS_API_URL not set, skipping SMS');
    console.log(`Would send SMS to ${normalizedPhone}:`);
    console.log(message);
    return false;
  }

  try {
    // Generic SMS API call - adjust based on your provider
    // Common providers: Twilio, MessageBird, SMS.cz, GoSMS.cz
    const response = await fetch(smsApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${smsApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: normalizedPhone,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('SMS API error:', error);
      return false;
    }

    console.log(`📱 SMS sent to ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

// Send order confirmation SMS
export async function sendOrderConfirmationSMS(data: OrderConfirmationSMSData): Promise<boolean> {
  if (!data.customerPhone) return false;

  const message = `${config.name}: Děkujeme za objednávku ${data.orderId}! ` +
    `Celkem: ${formatPrice(data.totalPrice)} Kč. ` +
    `Vyzvednutí: ${formatDate(data.pickupDate)} v ${data.pickupTime}. ` +
    `Adresa: ${config.address}`;

  return sendSMS(data.customerPhone, message);
}

// Send welcome SMS with magic link
export async function sendWelcomeSMS(phone: string, name: string, magicLink: string): Promise<boolean> {
  const message = `${config.name}: Ahoj ${name}! ` +
    `Tvoje registrace proběhla úspěšně. ` +
    `Pro přihlášení použij: ${magicLink}`;

  return sendSMS(phone, message);
}

// Send magic link SMS
export async function sendMagicLinkSMS(phone: string, name: string, magicLink: string): Promise<boolean> {
  const message = `${config.name}: Ahoj ${name}! ` +
    `Tvůj přihlašovací odkaz: ${magicLink}`;

  return sendSMS(phone, message);
}
