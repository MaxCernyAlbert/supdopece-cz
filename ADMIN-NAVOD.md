# 👨‍💼 Admin Panel - Návod k použití

## 🔑 Jak vytvořit přístupový odkaz pro zákazníka

### 1. Otevři Admin Panel

Jdi na: **http://localhost:3000/admin**

### 2. Vyplň údaje

```
Admin heslo: admin123
Jméno zákazníka: Jan Novák
Email zákazníka: jan@email.cz
```

### 3. Klikni "Vytvořit trvalý odkaz"

Dostaneš **trvalý odkaz**, např.:
```
http://localhost:3000/auth/verify?token=abc123def456...
```

### 4. Pošli odkaz zákazníkovi

- 📱 WhatsApp
- ✉️ Email
- 💬 SMS
- 📋 Zkopíruj a pošli jak chceš

---

## 📱 Co zákazník udělá?

### Varianta A: Přímé použití
1. Klikne na odkaz
2. Je automaticky přihlášený
3. Může objednávat

### Varianta B: Jako aplikace (doporučeno)
1. Klikne na odkaz
2. Je přihlášený
3. **Na mobilu:**
   - Android: Menu (⋮) → "Přidat na plochu"
   - iOS: Sdílet → "Přidat na plochu"
4. Má ikonu na ploše jako aplikace
5. I po měsících stále přihlášený!

---

## ✅ Co získáš?

### U každé objednávky uvidíš:

```json
{
  "customerName": "Jan Novák",
  "customerEmail": "jan@email.cz",
  "items": [...],
  "totalPrice": 250,
  "pickupDate": "2024-12-01",
  "pickupTime": "10:00"
}
```

### Výhody:
- ✅ **Žádná registrace** - zákazník jen klikne
- ✅ **Trvalý přístup** - odkaz nikdy nevyprší
- ✅ **Víš kdo objednal** - jméno a email v každé objednávce
- ✅ **Aplikace** - zákazník si uloží jako PWA
- ✅ **Žádná hesla** - jednoduché a bezpečné

---

## 🔐 Změna admin hesla

### V produkci **POVINNĚ změň** heslo!

Soubor: `src/app/api/auth/magic-link/route.ts`

Řádek 44:
```typescript
if (adminPassword !== 'admin123') {  // ← ZMĚŇ TOTO!
```

Změň na:
```typescript
if (adminPassword !== 'tvoje-silne-heslo-123') {
```

---

## 📊 Kde jsou uloženi zákazníci?

Soubor: **`data/magic-tokens.json`**

```json
{
  "abc123def456...": {
    "name": "Jan Novák",
    "email": "jan@email.cz",
    "token": "abc123def456...",
    "createdAt": "2024-11-24T12:00:00.000Z"
  }
}
```

**Pro produkci:** Přesuň do databáze (PostgreSQL, MongoDB)

---

## 🎯 Praktický příklad

### Situace:
Máš stálého zákazníka **Petra Svobodu** (petr@email.cz)

### Postup:

1. **Admin panel** → Vytvoříš mu odkaz
2. **WhatsApp** → Pošleš mu: "Ahoj Petře, zde je tvůj osobní odkaz na objednávky: http://..."
3. **Petr** → Klikne, uloží si na plochu jako aplikaci
4. **Za měsíc** → Petr otevře aplikaci z plochy → stále přihlášený
5. **Objedná** → Ty vidíš: "Objednávka od Petr Svoboda (petr@email.cz)"

---

## ⚠️ Důležité

### Jeden odkaz = jeden zákazník
- Každý zákazník má **svůj unikátní odkaz**
- Nesdílej jeden odkaz více lidem
- Pokud ztratí odkaz, vytvoř nový

### Bezpečnost
- Odkaz obsahuje tajný token
- Kdo má odkaz = má přístup jako daný zákazník
- Pošli odkaz jen správné osobě (WhatsApp, email)

---

## 🚀 Tip pro začátek

Vytvoř testovacího zákazníka:
```
Jméno: Test Test
Email: test@test.cz
```

Vyzkoušej si celý proces:
1. Vytvoř odkaz
2. Otevři v novém okně incognito
3. Zkus objednat
4. Ověř, že vidíš jméno v objednávce

---

## 📞 Potřebuješ pomoct?

- Dokumentace: SETUP.md
- Kontakt: info@supdopece.cz
