# Nastavení Vercel KV (Databáze pro produkci)

Aplikace používá **Vercel KV** (Redis) pro ukládání dat v produkci na Vercelu.

## Proč Vercel KV?

Vercel je **serverless platforma** - nemá perzistentní filesystem. To znamená, že:
- ❌ JSON soubory se **neukládají** po každém requestu
- ❌ Data se **ztratí** při každém novém deploymentu
- ✅ Potřebuješ **databázi** pro ukládání zákazníků a objednávek

**Řešení:** Vercel KV (Redis databáze)
- ✅ Free tier: 30MB storage, 10,000 příkazů/měsíc
- ✅ Nativní integrace s Vercel
- ✅ Setup trvá 2 minuty

## 🚀 Rychlý Setup (2 minuty)

### 1. Vytvoř KV databázi na Vercelu

1. Jdi na [vercel.com](https://vercel.com) do svého projektu
2. Klikni na **"Storage"** v horním menu
3. Klikni na **"Create Database"**
4. Vyber **"KV"** (Redis)
5. Pojmenuj databázi: `supdopece-kv`
6. Vyber region: **Frankfurt** (nejblíž ČR)
7. Klikni **"Create"**

### 2. Připoj databázi k projektu

1. V detailu KV databáze klikni na **"Connect Project"**
2. Vyber svůj projekt `supdopece-cz`
3. Klikni **"Connect"**

**To je vše!** Vercel automaticky přidá environment variables do projektu:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 3. Redeploy aplikace

1. Jdi na **"Deployments"**
2. U posledního deploymentu klikni na **tři tečky** → **"Redeploy"**
3. Nebo pushni nový commit a deploy se spustí automaticky

**Hotovo!** Aplikace teď ukládá data do Vercel KV.

## ✅ Ověření

Po redeployu:

1. Jdi na `/admin`
2. Vytvoř nového zákazníka
3. Jdi na `/admin/zakaznici`
4. Zákazník by tam měl být!

## 🏠 Lokální development

Pro lokální vývoj aplikace **používá JSON soubory** v `data/` složce:
- `data/magic-tokens.json` - zákazníci
- `data/orders.json` - objednávky
- `data/sms-codes.json` - SMS kódy

Nepotřebuješ žádné nastavení - vše funguje automaticky!

## 📊 Jak to funguje?

Aplikace automaticky detekuje prostředí:

```typescript
const isProduction = process.env.VERCEL === '1';

if (isProduction) {
  // Používá Vercel KV
  await kv.set('customers', data);
} else {
  // Používá JSON soubory
  await fs.writeFile('data/customers.json', data);
}
```

## 💰 Cena

**Free tier:**
- ✅ 30 MB storage
- ✅ 10,000 příkazů/měsíc
- ✅ Stačí pro malou pekárnu (stovky objednávek/měsíc)

**Pro tier:** $1/měsíc
- 256 MB storage
- 100,000 příkazů/měsíc

## 🔄 Migrace existujících dat

Pokud máš existující data v JSON souborech (z lokálu) a chceš je nahrát do KV:

1. Spusť aplikaci lokálně s daty
2. Vytvoř migrace skript (optional)
3. Nebo ručně přidej zákazníky přes `/admin`

## ❓ Problémy?

**Objednávky se neukládají:**
- ✅ Zkontroluj že je KV databáze připojená k projektu
- ✅ Zkontroluj že máš nastavené env variables
- ✅ Podívej se do Vercel logs (Deployments → View Function Logs)

**KV nelze vytvořit:**
- Možná potřebuješ přidat platební metodu (i pro free tier)
- Jdi do Account Settings → Billing

## 📚 Další info

- [Vercel KV Dokumentace](https://vercel.com/docs/storage/vercel-kv)
- [Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
