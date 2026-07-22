# MEMORY.md — PromptBoard Project

## Project
- **Name:** PromptBoard
- **Stack:** Vite + React (JavaScript), Vanilla CSS, no Tailwind
- **Dev server:** `http://localhost:5173` (run `npm run dev` from project root)
- **Data:** Persisted in `localStorage` under key `promptboard_react_v1`
- **Location:** `/Users/abhishekguleria/Downloads/Anti Gravety Projects/Prompt/`

---

## Design System: Caldera (from Design.md)

> "forge fire on warm limestone. The canvas is raw warm plaster, and every orange element reads as glowing embers pressed into the surface."

**Theme:** LIGHT (not dark — this is a warm off-white / limestone canvas)

---

### Colors

| Token | Value | Role |
|---|---|---|
| `--color-ember` | `#fc5000` | Primary CTA buttons, stat cards, key highlights |
| `--color-plasma-violet` | `#524ae9` | Hero halftone only — never for buttons/controls |
| `--color-sulfur` | `#f5f28e` | Tag/badge backgrounds only |
| `--color-limestone` | `#f7f6f2` | Card surfaces, content blocks, secondary button fills |
| `--color-pumice` | `#e2e2df` | Page canvas (dominant background) |
| `--color-obsidian` | `#070607` | Primary text, headings, borders |
| `--color-chalk` | `#ffffff` | Text on dark surfaces, high-contrast overlays |

---

### Typography

| Font | Use | Weight | Sizes |
|---|---|---|---|
| PP Neue Corp Compact (substitute: **Bebas Neue** or **Anton**) | All headings & display | 400 (ultrabold cut) | 26–189px |
| **DM Sans** | Body, nav, buttons, labels ≤30px | 500 (Medium ONLY — never 400 or 700) | 14, 16, 18, 30px |
| System sans-serif | Captions, meta, dates, micro-labels | 400 | 12px only |

**Critical rules:**
- PP Neue Corp Compact: `font-feature-settings: "ss06", "ss10"` | letter-spacing: `+0.02em` at display sizes
- DM Sans: ALWAYS 500 weight, NEVER Regular (400) or Bold (700)
- No negative letter-spacing on display type

---

### Border Radius (THE TRIPLE-RADIUS SYSTEM)

| Element | Value |
|---|---|
| Cards | `40px` |
| Buttons (non-pill) | `40px` |
| Pills (buttons, tags, nav, inputs) | `800px` |
| Inputs | `100px` |
| Small elements | `16px` |
| Medium elements | `20px` |

---

### Spacing Scale
4, 8, 9, 10, 12, 16, 18, 20, 24, 32, 40, 48, 56, 64, 80, 92 px

---

### Layout
- Max width: `1280px`
- Section gap: `80px`
- Card padding: `40px` all sides
- Element gap: `16px`

---

### Surface Hierarchy (NO SHADOWS — flat design)
1. **Pumice** `#e2e2df` — page background
2. **Limestone** `#f7f6f2` — cards, content blocks
3. **Ember** `#fc5000` — featured/accent surfaces
4. **Plasma Violet** `#524ae9` — hero halftone ONLY

---

### Components

#### Primary CTA Button
- Background: Ember `#fc5000`
- Text: Obsidian `#070607`
- Radius: `800px` (full pill)
- Padding: `12px 24px`
- Font: DM Sans 500, 16px
- NO shadow, NEVER rectangular

#### Secondary Pill Button
- Background: transparent
- Border: 1.5px solid Obsidian
- Text: Obsidian
- Radius: `40px`
- Padding: `16px`
- Font: DM Sans 500, 16px

#### Ghost/Nav Link
- No background, no border
- Text: Obsidian
- Radius: `800px`
- Padding: `0 12px`
- Font: DM Sans 500, 16px

#### Card (Content)
- Background: Limestone `#f7f6f2`
- Radius: `40px`
- Padding: `40px`
- No border, NO shadow

#### Stat Feature Card
- Background: Ember `#fc5000`
- Text: Chalk `#ffffff`
- Radius: `40px`, Padding: `40px`
- Metric: PP Neue Corp Compact 80px+
- Label: DM Sans 500, 14–16px

#### Category Tag / Badge
- Background: Sulfur `#f5f28e`
- Text: Obsidian `#070607`
- Radius: `800px` (pill)
- Padding: `3–4px 8–10px`
- Font: DM Sans 500, 12–14px

#### Navigation Bar
- Canvas: Pumice background continues through
- Nav container: Limestone pill, 800px radius
- Nav items: DM Sans 500 16px Obsidian, 9px gaps
- Logo left, social + CTA right

#### Input Field
- Background: transparent
- Border: 1.5px Chalk (dark sections)
- Radius: `100px`
- Padding: `24px 64px 24px 32px`
- Font: DM Sans 500

#### Hero Halftone Block
- Gradient: Plasma Violet → Ember
- Overlay: orange halftone dot pattern
- Radius: `40px`

---

### Do's & Don'ts

**DO:**
- 40px radius on all cards and non-pill buttons
- 800px radius for all pills, tags, nav, inputs
- Ember CTAs with Obsidian text only
- DM Sans 500 for all body/UI
- PP Neue Corp Compact at 48px+ for structural headings
- Flat surfaces — color contrast creates hierarchy, NOT shadows
- Halftone dot pattern as hero/signature motif
- Layer: Pumice canvas → Limestone cards → Ember features

**DON'T:**
- ❌ No shadows anywhere — system is intentionally flat
- ❌ No rectangular buttons (low-radius)
- ❌ No extra accent colors beyond Ember, Plasma Violet, Sulfur
- ❌ No DM Sans Regular (400) or Bold (700) — Medium (500) ONLY
- ❌ No Plasma Violet on buttons or controls
- ❌ No negative letter-spacing on PP Neue Corp Compact

---

### Signature Motifs
1. **Halftone dot pattern** — orange dots on violet-to-orange gradient, hero scale, 40px radius
2. **189px display headline** — tight 0.94 line-height, ultrabold compressed
3. **Triple-radius system** — 100px inputs, 40px cards/buttons, 800px pills

---

## File Structure

```
src/
├── components/
│   ├── Header.jsx        ← nav bar (Limestone pill container)
│   ├── SearchBar.jsx     ← search (100px radius input)
│   ├── Gallery.jsx       ← masonry grid
│   ├── Card.jsx          ← Limestone card, 40px radius
│   ├── AddModal.jsx      ← add prompt form
│   ├── DetailModal.jsx   ← detail view
│   └── Toast.jsx         ← notification
├── hooks/
│   ├── usePrompts.js     ← state + localStorage
│   └── useToast.js       ← toast state
├── App.jsx               ← root component
├── main.jsx              ← entry point
└── index.css             ← full Caldera design system CSS
```

---

## Applied Caldera to PromptBoard

| PromptBoard Element | Caldera Treatment |
|---|---|
| Page background | Pumice `#e2e2df` |
| Cards | Limestone `#f7f6f2`, 40px radius, 40px padding, NO shadow |
| Add Prompt button | Ember `#fc5000`, Obsidian text, 800px pill |
| Tags/badges | Sulfur `#f5f28e`, Obsidian text, 800px pill |
| Model badge | Ember `#fc5000`, Chalk text, 800px pill |
| Search input | 100px radius, Obsidian border 1.5px |
| Nav | Limestone pill container, 800px radius |
| Copy button | Ember fill, 800px pill |
| Detail copy CTA | Ember fill, 800px pill, Obsidian text |
| Fav button | Outlined, 40px radius |
| Headings | Bebas Neue / Anton (substitute for PP Neue Corp Compact) |
| Body text | DM Sans 500 throughout |

---

_Last updated: 2026-07-22_
