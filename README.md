# FoodTracker

A mobile application for tracking food expiration dates using AI-powered receipt scanning. Built with React Native (Expo) and Express.js.

## Overview

FoodTracker helps users reduce food waste by tracking expiration dates of purchased items. Simply scan your shopping receipt, and the app uses a multimodal LLM to extract food items and estimate expiration dates. Get timely notifications before items expire, with a color-coded card interface for quick visual assessment.

## Features

- 📸 **Receipt Scanning**: Capture shopping receipts with your phone camera
- 🤖 **AI-Powered Extraction**: Automatically extract food items and estimate expiration dates
- 🚦 **Traffic Light Status**: Visual indicators (green/yellow/red) for food freshness
- 📅 **Manual Date Adjustment**: Edit expiration dates or scan product labels for accurate dates
- 🔔 **Smart Notifications**: Receive alerts 3 days, 1 day, and on expiration day
- 💾 **Offline Support**: Queue changes when offline and sync when connected
- 📱 **Cross-Platform**: Works on iOS and Android

## Tech Stack

### Mobile App
- React Native (Expo)
- TypeScript
- Expo Router (file-based navigation)
- Expo Camera
- Expo Notifications
- AsyncStorage

### Backend
- Express.js
- TypeScript
- Prisma ORM
- SQLite (development) / PostgreSQL (production)
- OpenAI GPT-4 Vision API
- Expo Push Notifications

## Project Structure

```
food-expiration-tracker/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── app/           # Expo Router screens
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client and storage
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
│
└── server/                # Express backend
    ├── src/
    │   ├── routes/        # API route handlers
    │   ├── controllers/   # Business logic
    │   ├── services/      # External service integrations
    │   ├── middleware/    # Express middleware
    │   └── types/         # TypeScript type definitions
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

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_api_key_here
   DATABASE_URL="file:./prisma/dev.db"
   PORT=3000
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:3000`.

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `src/services/api.ts` if needed (default: `http://localhost:3000`).

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Run on your device:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## Usage

### Scanning a Receipt

1. Tap the **Scan** tab in the bottom navigation
2. Grant camera permissions if prompted
3. Point your camera at a shopping receipt
4. Tap the capture button
5. Review extracted items and estimated expiration dates
6. Edit or remove items as needed
7. Tap **Save Items** to add them to your tracker

### Managing Food Items

- **View All Items**: Home tab shows all food items sorted by expiration date
- **Edit Expiration Date**: Tap a food card → Edit date manually or scan product label
- **Delete Item**: Swipe left on a card or tap delete in detail view
- **Check Status**: 
  - 🟢 Green: More than 3 days until expiration
  - 🟡 Yellow: 1-3 days until expiration
  - 🔴 Red: Expired or expires today

### Notifications

The app sends push notifications:
- 3 days before expiration
- 1 day before expiration
- On expiration day

Tap a notification to view the specific food item.

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

## Database Schema

```prisma
model User {
  id            String      @id @default(uuid())
  pushToken     String?
  foodItems     FoodItem[]
}

model FoodItem {
  id              String      @id @default(uuid())
  name            String
  purchaseDate    DateTime
  expirationDate  DateTime
  isEstimated     Boolean     @default(true)
  userId          String
}

model NotificationLog {
  id            String      @id @default(uuid())
  foodItemId    String
  type          String
  sentAt        DateTime    @default(now())
}
```

## Development

### Running Tests

Backend tests:
```bash
cd server
npm test
```

Mobile tests:
```bash
cd mobile
npm test
```

### Database Management

View database in Prisma Studio:
```bash
cd server
npx prisma studio
```

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI GPT-4 Vision for receipt and label scanning
- Expo team for the excellent mobile development platform
- Prisma for the type-safe database toolkit
