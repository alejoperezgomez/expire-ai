# Push Notifications Testing Guide

## Overview
The push notification system is now fully implemented. This guide explains how to test it.

## Components Implemented

### Mobile App (Task 8.1)
- ✅ `useNotifications` hook for managing push notifications
- ✅ Automatic permission request on app launch
- ✅ Push token registration with backend
- ✅ Notification tap handling (navigates to food item detail)
- ✅ Foreground notification display
- ✅ Configured in `app.json` with notification settings

### Backend Service (Task 8.2)
- ✅ Notification service (`notificationService.ts`)
- ✅ Queries food items expiring in 3, 1, or 0 days
- ✅ Checks NotificationLog to prevent duplicate notifications
- ✅ Sends notifications via Expo Push API
- ✅ Logs sent notifications to database

### Cron Job (Task 8.3)
- ✅ Daily cron job scheduled for 9:00 AM
- ✅ Integrated with notification service
- ✅ Batch notification sending
- ✅ Manual trigger endpoint for testing

## Testing Instructions

### 1. Test Push Token Registration

Start the mobile app on a physical device (push notifications don't work on simulators):

```bash
cd mobile
npm start
```

The app will automatically:
1. Request notification permissions
2. Get the Expo push token
3. Register it with the backend

Check the server logs to confirm registration.

### 2. Test Manual Notification Trigger

You can manually trigger the notification check without waiting for the cron job:

```bash
curl -X POST http://localhost:3005/api/notifications/trigger
```

This will:
1. Query all food items expiring in 0, 1, or 3 days
2. Send notifications to registered devices
3. Log the notifications to prevent duplicates

### 3. Test Notification Tap Navigation

When you receive a notification:
1. Tap on it
2. The app should open and navigate to the food item detail screen
3. The food item ID is passed in the notification data

### 4. Test Cron Job

The cron job runs automatically at 9:00 AM daily. To test:

1. Add food items with expiration dates:
   - Today (will trigger "expiring today" notification)
   - Tomorrow (will trigger "1 day" notification)
   - 3 days from now (will trigger "3 day" notification)

2. Wait for 9:00 AM or use the manual trigger endpoint

3. Check that notifications are sent and logged

### 5. Test Duplicate Prevention

1. Trigger notifications manually: `POST /api/notifications/trigger`
2. Trigger again immediately
3. Verify that duplicate notifications are NOT sent (check NotificationLog table)

## Notification Types

| Type | Trigger | Title | Body |
|------|---------|-------|------|
| `expiry_day` | Expires today | "Food Expiring Today!" | "{item} expires today. Use it before it goes bad!" |
| `one_day` | Expires tomorrow | "Food Expiring Tomorrow" | "{item} expires tomorrow. Plan to use it soon!" |
| `three_day` | Expires in 3 days | "Food Expiring Soon" | "{item} expires in 3 days." |

## Cron Schedule

- **Schedule**: Daily at 9:00 AM
- **Timezone**: America/New_York (configurable in `cronService.ts`)
- **Format**: `0 9 * * *` (minute hour day month weekday)

## Database Schema

### NotificationLog Table
```sql
CREATE TABLE NotificationLog (
  id TEXT PRIMARY KEY,
  foodItemId TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'three_day' | 'one_day' | 'expiry_day'
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(foodItemId, type)
);
```

The unique constraint on `(foodItemId, type)` prevents duplicate notifications.

## Troubleshooting

### Notifications not received
1. Ensure you're using a physical device (not simulator)
2. Check that notification permissions are granted
3. Verify push token is registered (check User table)
4. Check server logs for errors

### Duplicate notifications
1. Check NotificationLog table for existing entries
2. Verify the unique constraint is working
3. Check server logs for database errors

### Cron job not running
1. Verify server is running continuously
2. Check server logs for cron initialization message
3. Verify timezone is correct in `cronService.ts`
4. Use manual trigger endpoint to test notification logic

## API Endpoints

### Register Push Token
```
POST /api/notifications/register
Body: { "pushToken": "ExponentPushToken[...]" }
```

### Manual Trigger (Testing)
```
POST /api/notifications/trigger
```

## Configuration

### Change Cron Schedule
Edit `server/src/services/cronService.ts`:
```typescript
cron.schedule('0 9 * * *', async () => {
  // Change '0 9 * * *' to your desired schedule
});
```

### Change Timezone
Edit `server/src/services/cronService.ts`:
```typescript
{
  timezone: 'America/New_York' // Change to your timezone
}
```

### Change Notification Thresholds
Edit `server/src/services/notificationService.ts` to modify when notifications are sent.
