import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { handleValidationErrors } from '../middleware/validation';
import { triggerNotificationCheck } from '../services/cronService';

const router = Router();
const prisma = new PrismaClient();

// Temporary user ID until auth is implemented
const TEMP_USER_ID = 'temp-user-id';

// POST /api/notifications/register - Register push token
router.post(
    '/register',
    [
        body('pushToken').isString().notEmpty().withMessage('Push token is required'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { pushToken } = req.body;

            // Upsert user with push token
            await prisma.user.upsert({
                where: { id: TEMP_USER_ID },
                update: { pushToken },
                create: { id: TEMP_USER_ID, pushToken },
            });

            res.json({ success: true, message: 'Push token registered' });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/notifications/trigger - Manually trigger notification check (for testing)
router.post(
    '/trigger',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await triggerNotificationCheck();
            res.json({ success: true, message: 'Notification check triggered' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
