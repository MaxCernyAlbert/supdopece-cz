# Sup do pece - Setup Guide

## 🚀 Jak spustit

```bash
cd supdopece
npm install
npm run dev
```

Otevři: **http://localhost:3000**

---

## ⚙️ Konfigurace

### 1. Nastavení datumů a časů vyzvednutí

Soubor: **`src/data/config.ts`**

```typescript
export const config = {
  // Objednávky
  maxDaysAhead: 14,         // Max počet dní dopředu (14 = 2 týdny)
  slotIntervalMinutes: 30,  // Časové sloty (15/30/60 minut)
  minPreorderHours: 2,      // Minimální předstih (2 hodiny)
};

// Otevírací doba
export const openingHours = [
  { day: 0, open: '08:00', close: '12:00', closed: false }, // Neděle
  { day: 1, open: '07:00', close: '17:00', closed: false }, // Pondělí
  { day: 2, open: '07:00', close: '17:00', closed: false }, // Úterý
  // ... atd
];
```

**Pro zavření v určitý den:**
```typescript
{ day: 1, open: '09:00', close: '17:00', closed: true }, // Pondělí zavřeno
```

### 2. Nastavení produktů

Soubor: **`src/data/products.ts`**

```typescript
export const products: Product[] = [
  {
    id: 'chleb-psenicny',        // Unikátní ID
    name: 'Pšeničný chléb',       // Název
    description: 'Popis produktu',
    price: 110,                   // Cena v Kč
    weight: '850g',
    category: 'chleby',           // chleby, pecivo, sladke, slane
    allergens: [1, 7],            // Čísla alergenů (1-14)
    available: true,              // Dostupnost
  },
];
```

### 3. Kontaktní údaje

Soubor: **`src/data/config.ts`**

```typescript
export const config = {
  name: 'Sup do pece',
  tagline: 'Řemeslná pekárna',
  address: 'Vaše adresa 123, Město',
  phone: '+420 123 456 789',
  email: 'info@supdopece.cz',
};
```

---

## 📱 Mobilní aplikace (PWA)

Web funguje jako aplikace na mobilu:

1. **Android Chrome/Edge:**
   - Otevři web → Menu (⋮) → "Přidat na plochu"

2. **iOS Safari:**
   - Otevři web → Sdílet → "Přidat na plochu"

3. **Ikony:** Přidej soubory do `/public/`:
   - `icon-192.png` (192×192 px)
   - `icon-512.png` (512×512 px)

---

## 🔐 Systém přihlášení (Magic Link)

### Jak to funguje:

1. **Zákazník** jde na `/auth/login`
2. Zadá svůj **email**
3. Dostane **unikátní odkaz** (magic link)
4. **Klikne** na odkaz
5. Je **automaticky přihlášený**

### Výhody:
- ✅ **Žádná hesla** - jednodušší a bezpečnější
- ✅ **Unikátní kód** pro každého zákazníka
- ✅ **Automatické vyplnění** emailu při objednávce
- ✅ Vidíš **kdo přesně objednal**

### Test v demo módu:

1. Jdi na: `http://localhost:3000/auth/login`
2. Zadej email (např. `test@email.cz`)
3. Zkopíruj magic link z výstupu
4. Otevři ho v novém okně
5. Jsi přihlášen!

---

## 💳 Platební brána (Stripe)

### Pro ostrý provoz:

1. **Registruj se** na https://stripe.com
2. Získej **API klíče** z dashboardu
3. Přidej do `.env`:

```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_URL=https://supdopece.cz
```

4. **Odkomentuj Stripe kód** v:
   - `src/app/api/create-checkout/route.ts`
   - `src/app/api/webhook/route.ts`

5. **Instaluj Stripe**:
```bash
npm install stripe
```

---

## 📊 Jak vidět objednávky?

### Momentálně (demo):
- Objednávky se **logují do konzole** (dev server)
- Otevři terminál kde běží `npm run dev`

### Pro produkci:
Potřebuješ **databázi** (např. PostgreSQL, MongoDB) a **admin panel**.

Doporučení:
- **Supabase** (PostgreSQL + Auth)
- **PlanetScale** (MySQL)
- **MongoDB Atlas**

---

## 🎨 Změna barev

Soubor: **`tailwind.config.js`**

```javascript
colors: {
  bread: {
    light: '#f5e6d3',  // Světlé pozadí
    medium: '#d4a574', // Střední
    dark: '#8b5a2b',   // Tmavá hlavička
  }
}
```

---

## 🚀 Nasazení (hosting)

### Doporučené platformy:

1. **Vercel** (nejjednodušší)
   - Push na GitHub
   - Propoj s Vercel
   - Automatické nasazení

2. **Netlify**
   - Podobné jako Vercel

3. **VPS** (např. Wedos, Forpsi)
   - Potřebuješ Node.js
   - `npm run build && npm start`

---

## 📞 Podpora

Máš otázky? Potřebuješ pomoct s nasazením?
- Email: info@supdopece.cz
- Dokumentace: Next.js docs

---

## ✅ Checklist před spuštěním

- [ ] Upravit produkty v `src/data/products.ts`
- [ ] Nastavit otevírací dobu v `src/data/config.ts`
- [ ] Změnit kontaktní údaje
- [ ] Přidat ikony pro PWA (`icon-192.png`, `icon-512.png`)
- [ ] Nastavit Stripe API klíče (pro online platby)
- [ ] Otestovat objednávkový proces
- [ ] Otestovat na mobilu
- [ ] Nastavit doménu a hosting
