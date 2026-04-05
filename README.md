# Expiria

A mobile app for tracking food expiration dates using AI-powered receipt scanning. Built with React Native (Expo), Tamagui, and Express.js.

## Overview

Expiria helps users reduce food waste by tracking expiration dates of purchased items. Scan your shopping receipt and the app uses a multimodal LLM to extract food items and estimate expiration dates. Get timely notifications before items expire, with a pastel traffic-light card interface for quick visual assessment.

## Design System

The visual identity is anchored in the adaptive icon — a flat, thick-outlined apple with a clock and leaf in sage greens, warm cream, and terracotta on a soft white plate. Every UI decision flows from this icon's mood: calm, friendly, organic pastels with squircle shapes and generous spacing.

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary Ink | `#2E4C38` | Text, strokes, strong UI chrome |
| Primary Surface | `#A8BFA8` | Screen backgrounds, headers, tab bar |
| Secondary Surface | `#FAF0E6` | Cards, secondary panels |
| Accent | `#C07850` | CTAs, time-related UI |
| Canvas | `#FDFCFA` | Light fills, button text on dark bg |

The design system is documented in `design-system/expiria/MASTER.md` and implemented as a centralized Tamagui theme module at `mobile/src/theme/`.

## Features

- 📸 Receipt Scanning — capture receipts with your phone camera
- 🤖 AI-Powered Extraction — automatically extract food items and estimate expiration dates
- 🚦 Traffic Light Status — pastel green/yellow/red badges for food freshness
- 📅 Manual Date Adjustment — edit dates or scan product labels for accuracy
- 🔔 Smart Notifications — alerts at 3 days, 1 day, and on expiration day
- 💾 Offline Support — queue changes when offline, sync when connected
- 📱 Cross-Platform — iOS and Android via Expo

## Tech Stack

### Mobile App
- React Native (Expo SDK 54)
- TypeScript
- Tamagui (theme tokens, styled components)
- Expo Router (file-based navigation)
- Expo Camera / Notifications
- AsyncStorage

### Backend
- Express.js + TypeScript
- Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- OpenAI GPT-4 Vision API
- Expo Push Notifications

## Project Structure

```
expiria/
├── design-system/expiria/  # MASTER.md design system
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── app/           # Expo Router screens
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client and storage
│   │   ├── theme/         # Tamagui tokens, themes, config
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
└── server/                # Express backend
    ├── src/
    │   ├── routes/        # API route handlers
    │   ├── services/      # External service integrations
    │   └── middleware/     # Express middleware
    ├── prisma/            # Database schema and migrations
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- OpenAI API key

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npx prisma migrate dev
npm run dev
```

The backend runs at `http://localhost:3000`.

### Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go.

Update the API URL in `src/services/api.ts` if needed.

## Usage

### Scanning a Receipt

1. Tap the Scan tab
2. Point your camera at a shopping receipt and capture
3. Review extracted items and estimated expiration dates
4. Edit or remove items as needed, then save

### Managing Food Items

- Home tab shows all items sorted by expiration date
- Tap a card to edit the expiration date or scan a product label
- Swipe or tap delete to remove items
- Status badges: 🟢 3+ days, 🟡 1-3 days, 🔴 expired/today

### Notifications

Push notifications fire at 3 days, 1 day, and on expiration day. Tap to view the item.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food-items` | Get all food items |
| GET | `/api/food-items/:id` | Get single food item |
| POST | `/api/food-items` | Create food item(s) |
| PUT | `/api/food-items/:id` | Update food item |
| DELETE | `/api/food-items/:id` | Delete food item |
| POST | `/api/scan/receipt` | Process receipt image |
| POST | `/api/scan/label` | Process product label image |
| POST | `/api/notifications/register` | Register push token |

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted in device settings
- On iOS Simulator, use the image picker fallback
- Check that `expo-camera` is properly installed

### API Connection Issues
- Verify backend is running on correct port
- Update API URL in `mobile/src/services/api.ts`
- For physical devices, use your computer's local IP instead of `localhost`

### Notifications Not Received
- Ensure notification permissions are granted
- Check that push token is registered with backend
- Verify cron job is running (backend logs)

## License

MIT
