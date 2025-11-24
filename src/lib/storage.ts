import fs from 'fs/promises';
import path from 'path';

// Lazy import KV - importuje se jen když je potřeba
let kvClient: any = null;
async function getKV() {
  if (!kvClient) {
    const { kv } = await import('@vercel/kv');
    kvClient = kv;
  }
  return kvClient;
}

// Zkontroluj jestli je KV nastavené
const hasKV = () => {
  return !!(process.env.KV_URL || process.env.KV_REST_API_URL);
};

const isProduction = process.env.VERCEL === '1' && hasKV();

// Storage keys
const KEYS = {
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  SMS_CODES: 'sms-codes',
} as const;

// Lokální soubory (pro development a fallback)
const FILES = {
  CUSTOMERS: path.join(process.cwd(), 'data', 'magic-tokens.json'),
  ORDERS: path.join(process.cwd(), 'data', 'orders.json'),
  SMS_CODES: path.join(process.cwd(), 'data', 'sms-codes.json'),
};

// Načíst data
export async function getData<T>(key: keyof typeof KEYS): Promise<T | null> {
  try {
    if (isProduction) {
      // Vercel KV
      const kv = await getKV();
      const data = await kv.get<T>(KEYS[key]);
      return data;
    } else {
      // Lokální JSON soubor
      const filePath = FILES[key];
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as T;
    }
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return null;
  }
}

// Uložit data
export async function setData<T>(key: keyof typeof KEYS, data: T): Promise<void> {
  try {
    if (isProduction) {
      // Vercel KV
      const kv = await getKV();
      await kv.set(KEYS[key], data);
    } else {
      // Lokální JSON soubor
      const filePath = FILES[key];
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
}

// Pomocné funkce pro zákazníky
export interface Customer {
  name: string;
  email: string;
  phone?: string;
  token: string;
  createdAt: string;
}

export async function getCustomers(): Promise<Record<string, Customer>> {
  const data = await getData<Record<string, Customer>>('CUSTOMERS');
  return data || {};
}

export async function saveCustomers(customers: Record<string, Customer>): Promise<void> {
  await setData('CUSTOMERS', customers);
}

// Pomocné funkce pro objednávky
export interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export async function getOrders(): Promise<Record<string, Order>> {
  const data = await getData<Record<string, Order>>('ORDERS');
  return data || {};
}

export async function saveOrders(orders: Record<string, Order>): Promise<void> {
  await setData('ORDERS', orders);
}

// Pomocné funkce pro SMS kódy
export interface SMSCode {
  phone: string;
  code: string;
  customerName: string;
  customerEmail: string;
  expiresAt: number;
}

export async function getSMSCodes(): Promise<Record<string, SMSCode>> {
  const data = await getData<Record<string, SMSCode>>('SMS_CODES');
  return data || {};
}

export async function saveSMSCodes(codes: Record<string, SMSCode>): Promise<void> {
  await setData('SMS_CODES', codes);
}
