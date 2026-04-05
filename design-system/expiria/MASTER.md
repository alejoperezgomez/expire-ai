# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/expiria/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Expiria
**Generated:** 2026-04-05 18:57:34
**Category:** Food Wellness / Organic Pastel Mobile Tracker

---

## Visual DNA

The Expiria adaptive icon is the single visual reference point: a flat, thick-outlined illustration of an apple with a clock and leaf rendered in sage greens, warm cream, and a terracotta accent on a soft white plate. Every design decision flows from this icon's mood — calm, friendly, slightly organic; flat shapes, thick uniform outlines, no sharp corners, solid fills with at most one simple highlight, very soft shadows.

---

## Global Rules

### Color Palette — Pastel Earthy Palette

| Role | Hex | Token | Usage |
|------|-----|-------|-------|
| Primary Ink | `#2E4C38` | `primaryInk` | Deep muted sage/forest green — text, key strokes, strong UI chrome |
| Primary Surface | `#A8BFA8` | `primarySurface` | Soft sage/muted green — large fills, hero shapes |
| Secondary Surface | `#FAF0E6` | `secondarySurface` | Warm cream-peach — cards, secondary panels |
| Accent | `#C07850` | `accent` | Muted terracotta — CTAs, time-related UI, used sparingly |
| Canvas | `#FDFCFA` | `canvas` | Warm white — app background |
| Text | `#2E4C38` | `text` | Deep green (same as primaryInk) |
| Text Muted | `#7A8B7A` | `textMuted` | Desaturated sage mid-tone |
| Border | `#D4DDD4` | `border` | Soft sage-tinted neutral |

**Color Philosophy:** Pastels carry the atmosphere; one darker green (`primaryInk`) carries readability and structure, consistent with the adaptive icon's wordmark color. All fills are flat or solid with at most one simple highlight (e.g. a light crescent) per element.

### Traffic Light System — Pastel-Adapted

Status indicators for food expiration use pastel variants that harmonize with the sage/cream/terracotta palette while remaining distinguishable and accessible (minimum 3:1 contrast ratio between text and background).

| Status | Background | Text | Token (bg) | Token (text) |
|--------|-----------|------|------------|-------------|
| Green (Fresh) | `#DFF0D8` | `#3B6E3B` | `statusGreenBg` | `statusGreenText` |
| Yellow (Expiring Soon) | `#FFF3CD` | `#7A6118` | `statusYellowBg` | `statusYellowText` |
| Red (Expired) | `#F8D7DA` | `#8B3A3A` | `statusRedBg` | `statusRedText` |

### Typography

- **Font Family:** Inter (geometric sans-serif)
- **Mood:** calm, friendly, modern, readable
- **Brand Case:** UPPERCASE for brand moments (app title, section headers)
- **Body Case:** Mixed case with comfortable line height for body copy

| Scale | Size | Weight | Usage |
|-------|------|--------|-------|
| Heading | 28px | Bold (700) | Screen titles |
| Subheading | 20px | Semi-bold (600) | Section headers, card titles |
| Body | 16px | Regular (400) / Medium (500) | Body copy, descriptions |
| Caption | 13px | Medium (500) | Date labels, meta text |
| Small | 11px | Medium (500) | Badges, tab labels |

Primary text uses the same deep green as the icon outlines (`primaryInk`). Muted text uses `textMuted`.

### Squircle Shape Language

Derived from the adaptive icon's super-rounded container — large corner radii everywhere.

| Token | Value | Usage |
|-------|-------|-------|
| `radius.sm` | `8px` | Small chips, inputs |
| `radius.md` | `16px` | Buttons, modals |
| `radius.lg` | `24px` | Cards, badges, sheets |
| `radius.full` | `9999px` | Circular avatars, pills |

Thick even strokes for emphasis (outlined buttons, selected chips, illustration-style dividers):

| Token | Value | Usage |
|-------|-------|-------|
| `strokes.thin` | `1px` | Hairline borders, dividers |
| `strokes.medium` | `2px` | Outlined buttons, selected states |
| `strokes.thick` | `3px` | Emphasis strokes, illustration accents |

### Spacing Scale

Generous airy spacing so elements feel centered and not cramped.

| Token | Value | Usage |
|-------|-------|-------|
| `space.xs` | `4px` | Tight gaps, badge padding |
| `space.sm` | `8px` | Icon gaps, inline spacing |
| `space.md` | `16px` | Standard padding, card content |
| `space.lg` | `24px` | Section padding, card margins |
| `space.xl` | `32px` | Large gaps between sections |
| `space.xxl` | `48px` | Hero padding, screen margins |

### Shadow Depths

Very soft shadows only — no heavy drop shadows that fight the flat illustration style.

| Level | Value | Usage |
|-------|-------|-------|
| Soft | `shadowColor: #2E4C38, offset: {0, 1}, opacity: 0.06, radius: 3, elevation: 1` | Subtle lift for small elements |
| Card | `shadowColor: #2E4C38, offset: {0, 2}, opacity: 0.08, radius: 6, elevation: 2` | Cards, panels |

Shadow color uses `primaryInk` for warmth. Maximum `shadowOpacity` is `0.15`. Maximum `elevation` is `4`. No shadow should compete with the flat illustration style.

---

## Motif Guidance

### Primary Motifs (from Adaptive Icon)

- **Apple + Clock:** The core brand motif. Use rounded apple silhouette with embedded clock face for deadline/freshness indicators. Keep outlines thick and uniform.
- **Leaf / Stem:** Organic accents derived from the apple's leaf. Use for empty states, success confirmations, and decorative touches. Keep simple — single leaf with gentle curve, not botanical illustration.

### Usage Rules

- Motifs are used **sparingly** — not on every screen or component
- Empty states and success states are the primary placement
- Keep motifs flat with solid fills, matching the icon's illustration style
- Use `primaryInk` for outlines, `primarySurface` for fills
- Circular clock motifs pair with time-related UI (date pickers, expiration countdowns)
- Leaf/stem accents pair with freshness and organic themes
- Scalloped or "bite" negative space can be used as a subtle brand touch on hero shapes

---

## Component Specs (React Native / Mobile)

### Cards

```typescript
// FoodCard style pattern
{
  backgroundColor: '#FAF0E6',  // secondarySurface
  borderRadius: 24,            // radius.lg
  padding: 16,                 // space.md
  shadowColor: '#2E4C38',     // primaryInk
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
}
```

### Badges (Traffic Light)

```typescript
// ExpirationBadge style pattern
{
  paddingHorizontal: 10,       // space.sm + 2
  paddingVertical: 6,          // space.xs + 2
  borderRadius: 24,            // radius.lg
  // Background and text color from Traffic Light System tokens
}
```

### Buttons

```typescript
// Primary action button
{
  backgroundColor: '#2E4C38',  // primaryInk
  borderRadius: 16,            // radius.md
  paddingVertical: 12,
  paddingHorizontal: 24,       // space.lg
}
// Button text: canvas (#FDFCFA), semi-bold (600)
```

---

## Anti-Patterns (Do NOT Use)

### Expiria-Specific Forbidden Patterns

- ❌ **Saturated neons** — No high-saturation, high-lightness colors. All palette colors must remain in the muted pastel/earthy range. (Saturation > 80% AND lightness 40-70% = forbidden)
- ❌ **Glassmorphism stacks** — No translucent layered panels, no `backdrop-filter: blur`, no frosted glass effects. Keep surfaces opaque and flat.
- ❌ **Harsh black** — No `#000000` for text or UI chrome. Use `primaryInk` (#2E4C38) instead. Exception: CameraView overlay where black is intrinsic to camera rendering.
- ❌ **Razor-sharp corners** — No `borderRadius: 0` on interactive or content elements. All cards, buttons, inputs, badges, and sheets use the squircle radius scale (minimum `radius.sm` = 8px).
- ❌ **Heavy drop shadows** — No `shadowOpacity > 0.15` or `elevation > 4`. Shadows must be very soft to preserve the flat illustration style.

### General Forbidden Patterns

- ❌ **Emojis as icons** — Use vector icons (Ionicons, Lucide)
- ❌ **Low contrast text** — Maintain 3:1 minimum contrast ratio for badges, 4.5:1 for body text
- ❌ **Instant state changes** — Always use transitions/animations (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for accessibility
- ❌ **Hardcoded hex colors in components** — All colors must come from the Theme Module; no inline hex values in StyleSheet definitions (except CameraView black/white)

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] All colors sourced from Theme Module tokens — zero hardcoded hex in components/screens
- [ ] No saturated neon colors anywhere in the palette
- [ ] No glassmorphism or blur effects
- [ ] No harsh black (#000000) used for text or UI chrome (CameraView exempt)
- [ ] No razor-sharp corners (borderRadius: 0) on interactive elements
- [ ] No heavy shadows (shadowOpacity ≤ 0.15, elevation ≤ 4)
- [ ] Traffic light badges maintain ≥ 3:1 contrast ratio
- [ ] Body text maintains ≥ 4.5:1 contrast ratio
- [ ] Squircle shape language applied consistently (radius.sm minimum)
- [ ] Spacing feels generous and airy (use spacing scale tokens)
- [ ] Typography uses Inter font family
- [ ] Brand moments use UPPERCASE
- [ ] Motifs (apple+clock, leaf/stem) used sparingly and only in appropriate contexts
- [ ] All shadows use primaryInk as shadow color for warmth
- [ ] Flat illustration style maintained — no gradients, no heavy depth effects
