import { OpeningHours } from '@/types';

// Konfigurace pekárny
export const config = {
  name: 'Sup do pece',
  tagline: 'Řemeslná pekárna',
  description: 'Pečeme z lásky, z kvásku a bez kompromisů',

  // Kontakt
  address: 'Vaše adresa 123, Město',
  phone: '+420 123 456 789',
  email: 'info@supdopece.cz',

  // Objednávky
  minOrderValue: 0, // minimální hodnota objednávky v Kč
  maxDaysAhead: 14, // max počet dní dopředu pro objednávku
  slotIntervalMinutes: 60, // interval časových slotů (60 minut = po hodinách)

  // DEADLINE PRO OBJEDNÁVKY
  // Objednávka na další den musí být nejpozději do této hodiny předchozího dne
  orderDeadlineHour: 12, // 12:00 (poledne)
  orderDeadlineMinute: 0,

  // Platby
  payments: {
    online: true, // povolit online platby
    cash: true, // povolit platbu hotově
    card: true, // povolit platbu kartou při vyzvednutí
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

// Generování časových slotů pro daný den
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
    slots.push(
      `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    );

    currentMin += config.slotIntervalMinutes;
    if (currentMin >= 60) {
      currentHour += 1;
      currentMin = 0;
    }
  }

  return slots;
}
