/**
 * Communication utilities for phone number interactions
 * Provides helper functions for handling phone calls and messaging
 */

/**
 * Initiates a phone call to the specified number
 * @param phoneNumber The phone number to call
 */
export const initiateCall = (phoneNumber: string): void => {
    if (!phoneNumber) return;
    window.location.href = `tel:${phoneNumber}`;
};

/**
 * Formats a phone number for display
 * @param phoneNumber The raw phone number
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    // Basic formatting - can be enhanced based on requirements
    return phoneNumber;
};

/**
 * Opens WhatsApp with the specified number
 * @param phoneNumber The phone number
 * @param message Optional message to pre-fill
 */
export const openWhatsApp = (phoneNumber: string, message?: string): void => {
    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(url, '_blank');
};