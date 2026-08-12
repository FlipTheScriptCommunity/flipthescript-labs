# FlipTheScript - UI/UX Design Guidelines

This document outlines the design language, color palette, typography, and styling components for the FlipTheScript project. It is based on the official launch poster and should be used as the source of truth for front-end development (Next.js, Tailwind CSS, etc.).

## 1. Concept & Vibe
* **Theme:** Dark Mode, Cyber/Hacker, Community-driven, Dynamic.
* **Atmosphere:** Energetic and professional yet edgy. 
* **Key Visuals:** High contrast against deep dark backgrounds, glowing elements, hand-drawn arrow accents, and gradient separators.

## 2. Color Palette

The color scheme relies on a very dark background with highly saturated, vibrant accent colors for contrast and emphasis.

### Backgrounds
* **Main Background:** `#0A0B10` (Deep space blue/black)
* **Card/Section Background:** `#13141C` (Slightly lighter dark shade for elevation)

### Accents & Branding
* **Primary Accent (Yellow/Gold):** `#F3B61F` (Used for critical attention elements, main CTAs, and primary highlights like "יוצא לדרך!").
* **Secondary Accent (Blue):** `#2A8BF2` (Used for secondary highlights, borders, informational text, and arrows).
* **Tertiary Accent (Purple):** `#8E44AD` (Used for complementary highlights, borders, and gradient blends).
* **Quaternary Accent (Teal/Green):** `#20B2AA` (Used for specific icon backgrounds and success indicators).

### Text Colors
* **Primary Text:** `#FFFFFF` (White - for body and most headings)
* **Muted Text:** `#B0B3C6` (Light grayish-blue - for secondary information)
* **Highlighted Text:** Uses the Yellow or Blue accents.

## 3. Typography

* **Primary Font (Hebrew & English UI):** `Rubik`, `Assistant`, or `Heebo`. Clean, highly legible sans-serif fonts. 
  * *Weights:* Regular (400) for body text, Bold (700) and Black (900) for headings.
* **Branding Font (English Logo):** A brush or marker-style font (e.g., `Permanent Marker` or `Road Rage`) for the "#FLIP THESCRIPT" logo elements.

## 4. UI Components & Elements

### Avatars & Profiles
Profile pictures should be circular and feature a solid, vibrant border.
```css
/* Avatar styling example */
.avatar {
  border-radius: 50%;
  border: 3px solid #2A8BF2; /* Use blue or purple accents */
  padding: 4px; /* Space between image and border */
}
```

### Icons
Icons should be flat, white, and placed inside a colored circular background.
* **Background Colors:** Blue (`#2A8BF2`), Purple (`#8E44AD`), or Teal (`#20B2AA`).
* **Icon Color:** White (`#FFFFFF`).

### Dividers & Lines
Use horizontal lines with linear gradients fading from the center to transparent edges.
```css
/* Gradient divider example */
.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #2A8BF2 50%, transparent 100%);
  width: 100%;
  margin: 20px 0;
}
```

### Buttons & Call to Actions (CTAs)
CTAs should be highly visible, utilizing the Primary Yellow accent.
```css
/* Primary CTA button */
.btn-primary {
  background-color: #F3B61F;
  color: #0A0B10; /* Dark text for contrast */
  font-weight: 800; /* Extra bold text */
  border-radius: 8px; /* Slight rounding */
  padding: 12px 24px;
}
```

### Hand-Drawn Elements
Incorporate hand-drawn style arrows (in Blue or Purple) pointing to critical areas like the CTA ("מעוניינים?"). This adds a dynamic, energetic, and slightly rebellious feel.

## 5. Layout & Grid

* **RTL First:** Since the primary content is in Hebrew, the entire grid and layout must support RTL (Right-to-Left) direction by default.
* **Sectioning:** Group related content (like "אז מה נעשה שם" and "למי זה מתאים?") into distinct block areas, subtly divided by gradient lines or distinct title bars.
* **Alignment:** Use a mix of centered text for main hero sections and right-aligned text for lists and informational blocks.

## 6. Tailwind CSS Configuration Snippet (Example)

```javascript
// tailwind.config.js snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0A0B10',
        card: '#13141C',
        primary: '#F3B61F',
        secondary: '#2A8BF2',
        accentPurple: '#8E44AD',
        accentTeal: '#20B2AA',
      },
      fontFamily: {
        sans: ['Rubik', 'Assistant', 'sans-serif'],
        marker: ['Permanent Marker', 'cursive'],
      },
    }
  }
}
```