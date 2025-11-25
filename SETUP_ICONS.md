# PWA Icons Setup

## Problem

The PWA manifests reference icon files that don't exist yet:
- `/public/icon-192.png` (192x192px)
- `/public/icon-512.png` (512x512px)

This causes 404 errors in the browser console and prevents proper PWA installation.

## Solution

You need to create these icon files. Here are your options:

### Option 1: Use an Icon Generator (Recommended)

1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload a logo/image for "Šup do pece" (ideally 512x512px or larger)
3. Generate PWA icons
4. Download and place `icon-192.png` and `icon-512.png` in `/public/` folder

### Option 2: Create Simple Icons

Use any graphics editor to create:
- **icon-192.png**: 192x192px PNG with bakery logo/emoji 🍞
- **icon-512.png**: 512x512px PNG with bakery logo/emoji 🍞

**Recommended colors:**
- Background: `#f5e6d3` (bread-light) - for main app
- Background: `#1f2937` (dark gray) - for admin app
- Icon: `#8b5a2b` (bread-dark) or bread emoji

### Option 3: Temporary Fix - Use Emoji as Icon

For quick testing, you can create simple PNG files with a bread emoji on colored background.

### Option 4: Online Tools

- **Canva**: Create 512x512px design with bread theme
- **Figma**: Design icon and export as PNG
- **GIMP/Photoshop**: Professional editing

## Installation Steps

1. Create or download the icon files
2. Place them in `/public/` folder:
   ```
   public/
   ├── icon-192.png
   ├── icon-512.png
   └── manifest.json
   ```
3. Clear browser cache and reload
4. Check browser console - 404 errors should be gone

## Icon Requirements

- **Format**: PNG
- **Sizes**: 192x192px and 512x512px
- **Content**: Bakery-related (bread, rolling pin, oven, etc.)
- **Background**: Should match app theme colors
- **Purpose**: Used for PWA home screen icons and splash screens

## Testing

After adding icons:
1. Open http://localhost:3000
2. Open DevTools Console (F12)
3. Check for 404 errors - should be none
4. Try installing PWA (Chrome: three dots > Install app)
5. Check home screen icon appearance

## Admin App Icons

The admin app uses the same icons currently. If you want different icons for admin:
1. Create separate icons (e.g., `icon-admin-192.png`, `icon-admin-512.png`)
2. Update `/public/manifest-admin.json` to reference new files
