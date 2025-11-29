import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateCreateFoodItem, validateUpdateFoodItem, validateFoodItemId } from '../middleware/validation';
import { notFoundError } from '../middleware/errorHandler';
import { CreateFoodItemInput, UpdateFoodItemInput } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Temporary user ID until auth is implemented
const TEMP_USER_ID = 'temp-user-id';

// GET /api/food-items - Get all food items for user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const foodItems = await prisma.foodItem.findMany({
            where: { userId: TEMP_USER_ID },
            orderBy: { expirationDate: 'asc' },
        });
        res.json(foodItems);
    } catch (error) {
        next(error);
    }
});

// GET /api/food-items/:id - Get single food item
router.get('/:id', validateFoodItemId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const foodItem = await prisma.foodItem.findUnique({
            where: { id },
        });

        if (!foodItem || foodItem.userId !== TEMP_USER_ID) {
            throw notFoundError('Food item');
        }

        res.json(foodItem);
    } catch (error) {
        next(error);
    }
});

// POST /api/food-items - Create food item(s)
router.post('/', validateCreateFoodItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('[CREATE FOOD ITEMS] Received body:', JSON.stringify(req.body, null, 2));
        const items: CreateFoodItemInput[] = Array.isArray(req.body) ? req.body : [req.body];

        const createdItems = await Promise.all(
            items.map((item) =>
                prisma.foodItem.create({
                    data: {
                        name: item.name,
                        purchaseDate: new Date(item.purchaseDate),
                        expirationDate: new Date(item.expirationDate),
                        isEstimated: item.isEstimated ?? true,
                        userId: TEMP_USER_ID,
                    },
                })
            )
        );

        res.status(201).json(Array.isArray(req.body) ? createdItems : createdItems[0]);
    } catch (error) {
        next(error);
    }
});

// PUT /api/food-items/:id - Update food item
router.put('/:id', validateUpdateFoodItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates: UpdateFoodItemInput = req.body;

        // Check if item exists and belongs to user
        const existing = await prisma.foodItem.findUnique({ where: { id } });
        if (!existing || existing.userId !== TEMP_USER_ID) {
            throw notFoundError('Food item');
        }

        const updatedItem = await prisma.foodItem.update({
            where: { id },
            data: {
                ...(updates.name && { name: updates.name }),
                ...(updates.expirationDate && { expirationDate: new Date(updates.expirationDate) }),
                ...(updates.isEstimated !== undefined && { isEstimated: updates.isEstimated }),
            },
        });

        res.json(updatedItem);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/food-items/:id - Delete food item
router.delete('/:id', validateFoodItemId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Check if item exists and belongs to user
        const existing = await prisma.foodItem.findUnique({ where: { id } });
        if (!existing || existing.userId !== TEMP_USER_ID) {
            throw notFoundError('Food item');
        }

        await prisma.foodItem.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
