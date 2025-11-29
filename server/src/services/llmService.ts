import OpenAI from 'openai';
import { ScanReceiptResponse, ScanLabelResponse, ExtractedFoodItem } from '../types';
import { imageProcessingError } from '../middleware/errorHandler';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Detect image format from base64 string by checking magic bytes
 */
function detectImageFormat(base64: string): string {
    // Get first few characters to check magic bytes
    const header = base64.substring(0, 20);

    // PNG: starts with iVBORw0KGgo
    if (header.startsWith('iVBORw0KGgo')) {
        return 'png';
    }
    // JPEG: starts with /9j/
    if (header.startsWith('/9j/')) {
        return 'jpeg';
    }
    // GIF: starts with R0lGOD
    if (header.startsWith('R0lGOD')) {
        return 'gif';
    }
    // WebP: starts with UklGR
    if (header.startsWith('UklGR')) {
        return 'webp';
    }

    // Default to jpeg (most common for photos)
    return 'jpeg';
}

const RECEIPT_PROMPT = `Analyze this shopping receipt image and extract all food items.
For each food item, provide:
1. The item name (normalized, e.g., "Milk" not "2% MILK 1GAL")
2. Estimated days until expiration based on typical shelf life

Return as JSON array:
[
  { "name": "string", "estimatedExpirationDays": number, "confidence": 0-1 }
]

Only include food items, not household products or non-perishables.
If no food items are found, return an empty array.`;

const LABEL_PROMPT = `Analyze this product label/packaging image and extract the expiration date.
Look for: "Best By", "Use By", "Exp", "BB", or similar date indicators.

Return as JSON:
{
  "expirationDate": "YYYY-MM-DD" or null if not found,
  "confidence": 0-1
}`;

export async function processReceiptImage(imageBase64: string): Promise<ScanReceiptResponse> {
    try {
        // Ensure proper data URI format
        let imageUrl = imageBase64;
        if (!imageBase64.startsWith('data:')) {
            // Detect image format from base64 header or default to jpeg
            const format = detectImageFormat(imageBase64);
            imageUrl = `data:image/${format};base64,${imageBase64}`;
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: RECEIPT_PROMPT },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });

        const content = response.choices[0]?.message?.content;
        console.log(content)
        if (!content) {
            throw imageProcessingError('No response from LLM');
        }

        // Parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return { items: [] };
        }

        const items: ExtractedFoodItem[] = JSON.parse(jsonMatch[0]);
        return { items };
    } catch (error) {
        if (error instanceof Error && error.message.includes('No response')) {
            throw error;
        }
        console.error('LLM processing error:', error);
        throw imageProcessingError('Failed to process receipt image');
    }
}

export async function processLabelImage(imageBase64: string): Promise<ScanLabelResponse> {
    try {
        // Ensure proper data URI format
        let imageUrl = imageBase64;
        if (!imageBase64.startsWith('data:')) {
            // Detect image format from base64 header or default to jpeg
            const format = detectImageFormat(imageBase64);
            imageUrl = `data:image/${format};base64,${imageBase64}`;
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: LABEL_PROMPT },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw imageProcessingError('No response from LLM');
        }

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { expirationDate: null, confidence: 0 };
        }

        const result: ScanLabelResponse = JSON.parse(jsonMatch[0]);
        return result;
    } catch (error) {
        if (error instanceof Error && error.message.includes('No response')) {
            throw error;
        }
        console.error('LLM processing error:', error);
        throw imageProcessingError('Failed to process label image');
    }
}
