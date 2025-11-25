import { OpeningHours } from '@/types';

// Bakery configuration
export const config = {
  name: 'Šup do pece',
  tagline: 'Řemeslná pekárna',
  description: 'Pečeme z lásky, z kvásku a bez kompromisů',

  // Contact info
  address: '23. dubna 14, 692 01 Pavlov-Mikulov na Moravě',
  phone: '722 987 432',
  email: 'info@supdopece.cz',
  instagram: 'https://www.instagram.com/supdopece',

  // Orders
  minOrderValue: 0, // minimum order value in CZK
  maxDaysAhead: 14, // max days ahead for orders
  slotIntervalMinutes: 60, // time slot interval (60 mins = hourly)

  // ORDER DEADLINE
  // Orders for next day must be placed before this time on previous day
  orderDeadlineHour: 12, // 12:00 (noon)
  orderDeadlineMinute: 0,

  // Payments
  payments: {
    card: true, // allow online card payment
    onPickup: true, // allow payment on pickup (cash or card)
    qrCode: true, // allow payment via QR code (bank transfer)
  },

  // QR code payment details
  qrPayment: {
    accountNumber: '123456789/0800', // Bank account number
    iban: 'CZ65 0800 0000 1234 5678 9012', // IBAN for international
    variableSymbol: true, // Use order ID as variable symbol
    message: 'Šup do pece - objednávka', // Payment message
  },
};

// Otevírací doba - JEN PÁTEK AŽ NEDĚLE
export const openingHours: OpeningHours[] = [
  { day: 0, open: '08:30', close: '12:00', closed: false }, // Neděle - OTEVŘENO
  { day: 1, open: '09:00', close: '17:00', closed: true },  // Pondělí - ZAVŘENO
  { day: 2, open: '09:00', close: '17:00', closed: true },  // Úterý - ZAVŘENO
  { day: 3, open: '09:00', close: '17:00', closed: true },  // Středa - ZAVŘENO
  { day: 4, open: '09:00', close: '17:00', closed: true },  // Čtvrtek - ZAVŘENO
  { day: 5, open: '08:30', close: '12:00', closed: false }, // Pátek - OTEVŘENO
  { day: 6, open: '08:30', close: '12:00', closed: false }, // Sobota - OTEVŘENO
];

// Helper pro získání otevírací doby pro konkrétní den
export function getOpeningHoursForDay(date: Date): OpeningHours {
  const dayOfWeek = date.getDay();
  return openingHours[dayOfWeek];
}

// Kontrola, jestli je možné objednat na tento den
export function canOrderForDate(date: Date): boolean {
  const now = new Date();
  const hours = getOpeningHoursForDay(date);

  // Pokud je den zavřený
  if (hours.closed) return false;

  // Kontrola deadline - objednávka na další den musí být do 12:00 předchozího dne
  const dayBeforePickup = new Date(date);
  dayBeforePickup.setDate(dayBeforePickup.getDate() - 1);
  dayBeforePickup.setHours(config.orderDeadlineHour, config.orderDeadlineMinute, 0, 0);

  // Pokud je teď po deadline, nelze objednat na tento den
  if (now > dayBeforePickup) {
    return false;
  }

  return true;
}

// Generate time slots for given day (as ranges: 8:30-9:00, 9:00-10:00)
export function generateTimeSlots(date: Date): string[] {
  const hours = getOpeningHoursForDay(date);

  if (hours.closed) return [];
  if (!canOrderForDate(date)) return [];

  const slots: string[] = [];
  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);

  let currentHour = openHour;
  let currentMin = openMin;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

    // Calculate end time
    let endHour = currentHour;
    let endMin = currentMin + config.slotIntervalMinutes;
    if (endMin >= 60) {
      endHour += 1;
      endMin = 0;
    }

    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    // Add as range: "8:30-9:00"
    slots.push(`${startTime}-${endTime}`);

    currentMin += config.slotIntervalMinutes;
    if (currentMin >= 60) {
      currentHour += 1;
      currentMin = 0;
    }
  }

  return slots;
}
