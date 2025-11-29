import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExpoNotification {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

export async function sendPushNotification(notification: ExpoNotification): Promise<void> {
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification),
        });

        if (!response.ok) {
            console.error('Failed to send push notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

export async function checkAndSendExpirationNotifications(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Get all users with push tokens
    const users = await prisma.user.findMany({
        where: { pushToken: { not: null } },
        include: {
            foodItems: {
                where: {
                    expirationDate: {
                        gte: today,
                        lte: threeDaysFromNow,
                    },
                },
            },
        },
    });

    for (const user of users) {
        if (!user.pushToken) continue;

        for (const item of user.foodItems) {
            const expirationDate = new Date(item.expirationDate);
            expirationDate.setHours(0, 0, 0, 0);

            const daysUntilExpiration = Math.ceil(
                (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            let notificationType: string | null = null;
            let title = '';
            let body = '';

            if (daysUntilExpiration === 0) {
                notificationType = 'expiry_day';
                title = 'Food Expiring Today!';
                body = `${item.name} expires today. Use it before it goes bad!`;
            } else if (daysUntilExpiration === 1) {
                notificationType = 'one_day';
                title = 'Food Expiring Tomorrow';
                body = `${item.name} expires tomorrow. Plan to use it soon!`;
            } else if (daysUntilExpiration === 3) {
                notificationType = 'three_day';
                title = 'Food Expiring Soon';
                body = `${item.name} expires in 3 days.`;
            }

            if (notificationType) {
                // Check if notification was already sent
                const existingLog = await prisma.notificationLog.findUnique({
                    where: {
                        foodItemId_type: {
                            foodItemId: item.id,
                            type: notificationType,
                        },
                    },
                });

                if (!existingLog) {
                    await sendPushNotification({
                        to: user.pushToken,
                        title,
                        body,
                        data: { foodItemId: item.id },
                    });

                    // Log the notification
                    await prisma.notificationLog.create({
                        data: {
                            foodItemId: item.id,
                            type: notificationType,
                        },
                    });
                }
            }
        }
    }
}
