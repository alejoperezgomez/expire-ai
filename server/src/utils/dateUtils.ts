import { TrafficLightStatus } from '../types';

/**
 * Calculate the number of days until expiration
 */
export function calculateDaysUntilExpiration(expirationDate: Date | string): number {
    const expDate = new Date(expirationDate);
    const today = new Date();

    // Reset time to midnight for accurate day calculation
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Get traffic light status based on days until expiration
 * - Green: More than 3 days until expiration
 * - Yellow: 1-3 days until expiration
 * - Red: Expired or expires today
 */
export function getTrafficLightStatus(daysUntilExpiration: number): TrafficLightStatus {
    if (daysUntilExpiration <= 0) {
        return 'red';
    } else if (daysUntilExpiration <= 3) {
        return 'yellow';
    }
    return 'green';
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date as relative text (e.g., "Expires in 3 days", "Expired 2 days ago")
 */
export function formatRelativeExpiration(daysUntilExpiration: number): string {
    if (daysUntilExpiration === 0) {
        return 'Expires today';
    } else if (daysUntilExpiration === 1) {
        return 'Expires tomorrow';
    } else if (daysUntilExpiration > 1) {
        return `Expires in ${daysUntilExpiration} days`;
    } else if (daysUntilExpiration === -1) {
        return 'Expired yesterday';
    } else {
        return `Expired ${Math.abs(daysUntilExpiration)} days ago`;
    }
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Convert date to ISO string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
    return date.toISOString().split('T')[0];
}
