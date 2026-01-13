import { randomBytes } from 'crypto';

/**
 * Utility class for cryptographic operations
 * Provides secure random generation and validation
 */
export class CryptoUtil {
  /**
   * Generate a 6-digit OTP code using cryptographically secure random bytes
   * @returns String with exactly 6 digits (0-999999)
   */
  static generateSecureOtp(): string {
    // Generate 4 random bytes and mod 1000000 to get 0-999999
    const buffer = randomBytes(4);
    const randomValue = buffer.readUInt32BE(0) % 1000000;
    return String(randomValue).padStart(6, '0');
  }

  /**
   * Generate a secure random token/string
   * @param length - Number of bytes (will be returned as hex, so 2x length in characters)
   * @returns Hex string of specified length
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Validate OTP format (must be exactly 6 digits)
   * @param otp - The OTP code to validate
   * @returns true if valid, false otherwise
   */
  static isValidOtpFormat(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Validate email format
   * @param email - The email to validate
   * @returns true if valid format, false otherwise
   */
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param text - The text to escape
   * @returns Escaped text safe for HTML
   */
  static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Validate cedula format (8-13 digits)
   * @param cedula - The cedula to validate
   * @returns true if valid format, false otherwise
   */
  static isValidCedulaFormat(cedula: string): boolean {
    return /^\d{8,13}$/.test(cedula);
  }

  /**
   * Validate phone format (international)
   * @param phone - The phone number to validate
   * @returns true if valid format, false otherwise
   */
  static isValidPhoneFormat(phone: string): boolean {
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(phone);
  }
}
