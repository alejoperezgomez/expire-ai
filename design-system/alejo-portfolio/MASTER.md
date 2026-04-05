# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Alejo Portfolio
**Generated:** 2026-03-28 20:53:01
**Category:** Quiet Portfolio / Editorial

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#FDFBF7` | `--color-background` |
| Foreground | `#2A2A2A` | `--color-foreground` |
| Muted | `#6B7280` | `--color-muted` |
| Accent | `#C85A3F` | `--color-accent` |
| Title Accent | `#2E4C38` | `--color-title-accent` |
| Hairline Border | `rgba(42, 42, 42, 0.1)` | `--color-border-hairline` |

**Color Notes:** Warm paper-style background, charcoal text, muted meta text, terracotta for links/interactive elements, and forest green for small-caps/site titles. Dark mode inverses this.

### Typography

- **Heading Font:** Playfair Display (Serif)
- **Body Font:** Playfair Display (Serif) for longform body text where appropriate; Inter (Sans) for UI elements, meta text, and smaller details.
- **Mood:** quiet, editorial, refined, longform-friendly, tactile
- **Google Fonts:** [Playfair Display + Inter](https://fonts.google.com/share?selection.family=Inter:wght@300;400;500;600;700|Playfair+Display:wght@400;500;600;700)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
```

### Spacing & Layout Constraints

- **Single-Column Focus:** Enforce single-column layouts with a comfortable measure (`max-w-prose` or `max-w-2xl` ~65ch) for readability.
- **Dividers:** Use hairline dividers (`border-t`, `border-b` with `border-border-hairline`) instead of dashboard-style generic cards or heavy drop shadows.

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth for interactive elements or inputs |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Menus, dropdowns |

*(Note: We actively avoid heavy shadows and prefer flat, bordered, or flush layouts).*

---

## Style Guidelines

**Style:** Quiet Portfolio / Editorial

**Keywords:** Warm paper, charcoal typography, terracotta accents, hairline dividers, longform typography, geometric sans for data/UI, flat, tactile, subtle interactions.

**Best For:** Personal portfolios, architecture firms, high-end editorial experiences, thought-leadership.

**Key Effects:** Soft fades, minimal scaling on hover, thin borders resolving on interaction. No morphing blobs or glassmorphism.

### Page Pattern

**Pattern Name:** Linear Editorial Flow

- **Conversion Strategy:** Content-first. Clear typography, simple terracotta anchor links, minimal distraction.
- **CTA Placement:** Inline links, subtle bordered buttons.
- **Section Order:** 1. Refined Hero (Name/Role), 2. Trajectory (clean timeline with borders), 3. Contact/Calendar

---

## Anti-Patterns (Do NOT Use)

- ❌ **Glassmorphism:** No translucent backgrounds, no blurred panels, no `backdrop-filter: blur`.
- ❌ **Generic Cards:** Avoid putting content in floating white boxes with heavy drop shadows. Use hairline grid lines or white-space logic instead.
- ❌ **Purple / Blue Gradients:** Stick to the terracotta/forest green accents and warm monochromatic bases.
- ❌ **Blob Animations:** No liquid morphing or floating background blobs.
- ❌ **Wide Text Lines:** Do not let paragraphs stretch edge-to-edge on large screens. Use `max-w-2xl` or `max-w-prose`.

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Does it follow the minimal, flat, editorial aesthetic (no generic shadow-cards)?
- [ ] Are dividers hairline (`border-border-hairline`) rather than heavy backgrounds?
- [ ] Are we adhering strictly to the terracotta (`accent`) and forest green (`title-accent`) tokens instead of arbitrary hex colors?
- [ ] Is layout width constrained for comfortable reading (~65ch)?
- [ ] No emojis used as icons (use SVG instead)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
