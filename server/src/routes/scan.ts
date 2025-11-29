import { Router, Request, Response, NextFunction } from 'express';
import { validateImageUpload } from '../middleware/validation';
import { processReceiptImage, processLabelImage } from '../services/llmService';
import { ScanImageRequest } from '../types';

const router = Router();

// POST /api/scan/receipt - Process receipt image
router.post('/receipt', validateImageUpload, async (req: Request<{}, {}, ScanImageRequest>, res: Response, next: NextFunction) => {
    try {
        console.log('[SCAN] Receipt scan request received');
        const { image } = req.body;

        // Log image info for debugging
        const imagePreview = image.substring(0, 50);
        console.log('[SCAN] Image data length:', image?.length || 0);
        console.log('[SCAN] Image preview (first 50 chars):', imagePreview);

        // Validate it's not a file path (common mistake)
        if (image.startsWith('file://') || image.startsWith('/') || image.startsWith('content://')) {
            console.error('[SCAN] ERROR: Received file path instead of base64 data');
            return res.status(400).json({
                code: 'INVALID_IMAGE_DATA',
                message: 'Received file path instead of base64-encoded image data. Please convert the image to base64 before sending.',
            });
        }

        const result = await processReceiptImage(image);
        console.log('[SCAN] Receipt processing complete, items found:', result.items.length);
        res.json(result);
    } catch (error) {
        console.error('[SCAN] Receipt scan error:', error);
        next(error);
    }
});

// POST /api/scan/label - Process product label image
router.post('/label', validateImageUpload, async (req: Request<{}, {}, ScanImageRequest>, res: Response, next: NextFunction) => {
    try {
        console.log('[SCAN] Label scan request received');
        const { image } = req.body;

        // Log image info for debugging
        const imagePreview = image.substring(0, 50);
        console.log('[SCAN] Image data length:', image?.length || 0);
        console.log('[SCAN] Image preview (first 50 chars):', imagePreview);

        // Validate it's not a file path (common mistake)
        if (image.startsWith('file://') || image.startsWith('/') || image.startsWith('content://')) {
            console.error('[SCAN] ERROR: Received file path instead of base64 data');
            return res.status(400).json({
                code: 'INVALID_IMAGE_DATA',
                message: 'Received file path instead of base64-encoded image data. Please convert the image to base64 before sending.',
            });
        }

        const result = await processLabelImage(image);
        console.log('[SCAN] Label processing complete');
        res.json(result);
    } catch (error) {
        console.error('[SCAN] Label scan error:', error);
        next(error);
    }
});

export default router;
