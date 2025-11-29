import cron from 'node-cron';
import { checkAndSendExpirationNotifications } from './notificationService';

/**
 * Initialize cron jobs for the application
 */
export function initializeCronJobs(): void {
    // Schedule notification check to run daily at 9:00 AM
    // Cron format: minute hour day month weekday
    // '0 9 * * *' = At 9:00 AM every day
    cron.schedule('0 9 * * *', async () => {
        console.log('[CRON] Running daily expiration notification check at', new Date().toISOString());
        try {
            await checkAndSendExpirationNotifications();
            console.log('[CRON] Expiration notification check completed successfully');
        } catch (error) {
            console.error('[CRON] Error running expiration notification check:', error);
        }
    }, {
        timezone: 'America/New_York' // Adjust to your preferred timezone
    });

    console.log('[CRON] Notification cron job scheduled for 9:00 AM daily');
}

/**
 * Manually trigger the notification check (useful for testing)
 */
export async function triggerNotificationCheck(): Promise<void> {
    console.log('[CRON] Manually triggering notification check at', new Date().toISOString());
    await checkAndSendExpirationNotifications();
}
