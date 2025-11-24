# Sup do pece - Objednávkový systém pro pekárnu

Webová aplikace pro objednávání chleba a pečiva s rezervací termínu vyzvednutí.

## 🚀 Funkce

- 🍞 Katalog produktů s kategoriemi
- 🛒 Košík a objednávkový systém
- 📅 Rezervace data a času vyzvednutí
- 📱 SMS přihlášení zákazníků (6místný kód)
- 🔗 Magic link přihlášení
- 💳 Online platby nebo platba při vyzvednutí
- 👨‍💼 Admin panel pro správu
- 📊 Historie objednávek
- 👥 Správa zákazníků
- 📱 PWA - funguje jako mobilní aplikace

## 🛠️ Technologie

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **date-fns** - Datum/čas

## 🏃 Jak spustit lokálně

\`\`\`bash
npm install
npm run dev
\`\`\`

Otevři: http://localhost:3000

## ⚙️ Konfigurace

### Otevírací doba a časové sloty
\`src/data/config.ts\`

\`\`\`typescript
export const openingHours = [
  { day: 5, open: '08:30', close: '12:00', closed: false }, // Pátek
  { day: 6, open: '08:30', close: '12:00', closed: false }, // Sobota
  { day: 0, open: '08:30', close: '12:00', closed: false }, // Neděle
];

export const config = {
  slotIntervalMinutes: 60, // Časové sloty po hodinách
  orderDeadlineHour: 12, // Deadline pro objednávky
};
\`\`\`

### Produkty
\`src/data/products.ts\`

### Admin heslo
Výchozí: \`admin123\`

Změň v:
- \`src/app/api/auth/magic-link/route.ts\` (řádek 44)
- \`src/app/api/orders/route.ts\` (řádek 90)
- \`src/app/api/customers/route.ts\` (řádek 39)

## 📱 SMS Autentizace

### Demo mód (výchozí)
Kód se zobrazí na stránce místo SMS.

### Produkce
V \`src/app/api/auth/sms/route.ts\` odkomentuj a nastav:

**Twilio:**
\`\`\`typescript
const client = require('twilio')(accountSid, authToken);
\`\`\`

**SMSBrana.cz:**
\`\`\`typescript
await fetch('https://api.smsbrana.cz/smsconnect/http.php', {...});
\`\`\`

## 💳 Platební brána

V \`src/app/api/create-checkout/route.ts\` nastav Stripe:

\`\`\`bash
npm install stripe
\`\`\`

\`.env\`:
\`\`\`
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_URL=https://test.supdopece.cz
\`\`\`

## 🚀 Nasazení

### Vercel (doporučeno)
1. Push na GitHub
2. Jdi na [vercel.com](https://vercel.com)
3. Import repozitáře
4. Nastav environment variables
5. Deploy!

### Vlastní server
\`\`\`bash
npm run build
npm start
\`\`\`

## 📚 Dokumentace

- \`SETUP.md\` - Detailní návod k nastavení
- \`ADMIN-NAVOD.md\` - Návod pro admin panel

## 📞 Kontakt

Vytvořeno pro Sup do pece
