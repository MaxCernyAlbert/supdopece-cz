# Remaining Implementation Tasks

## Completed (9/18)
1. ✅ Brand name → "Šup do pece"
2. ✅ Contact info (address, phone, Instagram)
3. ✅ Payment methods simplified (config)
4. ✅ Time slots → ranges
5. ✅ Day names → 2 letters
6. ✅ SMS login (auto +420, auto-create)
7. ✅ Google review link
8. ✅ Calendar reminder (iCal)
9. ✅ English commits started

## TODO (9/18)

### High Priority
1. **Cart UI improvement** - Make cart badge clickable, better mobile UX
2. **Payment methods in UI** - Update checkout to use new config (card, onPickup)
3. **Date picker scroll** - Remove horizontal scroll
4. **Admin session** - Cookie/session for admin login

### Medium Priority
5. **Order filtering** - Filter orders by pickup date in admin
6. **Grid/list toggle** - Product view switcher with localStorage

### Low Priority (Complex)
7. **Email login** - Similar to SMS but with email codes
8. **PWA install prompt** - Smart banner for Android/iOS
9. **Admin PWA** - Separate manifest for admin routes

## Implementation Notes

### Cart UI
- Make Header cart badge a Link to /objednavka
- Add fixed floating cart button on mobile
- Consider sidebar cart (complex)

### Payment Methods
File: `src/app/objednavka/page.tsx`
- Update payment options to match config.payments (card, onPickup)
- Remove cash/card_on_pickup old options

### Date Picker Scroll
File: `src/components/DateTimePicker.tsx`
- Add `overflow-x: hidden` or `max-width`
- Use flex-wrap for dates

### Admin Session
Files: `src/app/admin/**/*.tsx`
- Use cookies or sessionStorage
- Set on successful login, check on page load
- Expire after 24h

### Order Filtering
File: `src/app/admin/objednavky/page.tsx`
- Add date filter dropdown
- Filter orders.filter(o => o.pickupDate === selectedDate)

### Grid/List Toggle
File: `src/app/page.tsx`
- Add toggle button (grid/list icons)
- Use localStorage.setItem('viewMode', 'grid|list')
- Conditional className based on viewMode

### Email Login
Similar to SMS:
- New route `/api/auth/email/route.ts`
- Send code via email (nodemailer/sendgrid)
- Verify code like SMS

### PWA Install Prompt
- Detect beforeinstallprompt event
- Show banner with install button
- Different UI for iOS (Add to Home Screen instructions)

### Admin PWA
- Create separate manifest-admin.json
- Add to admin pages only
- Different theme color/name

## Quick Wins (Do First)
1. Payment methods UI update (5 min)
2. Cart badge clickable (5 min)
3. Date picker scroll fix (5 min)
4. Admin session (15 min)
5. Order filtering (15 min)

Total: ~45 minutes for quick wins
