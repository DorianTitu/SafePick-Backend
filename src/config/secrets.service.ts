import { Injectable } from '@nestjs/common';

/**
 * Service to validate and provide access to secure configuration values
 * Ensures all required environment variables are set with correct format
 */
@Injectable()
export class SecretsService {
  /**
   * Get JWT secret and validate it's configured securely
   */
  getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        '❌ JWT_SECRET not configured. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      );
    }

    if (secret.length < 32) {
      throw new Error('❌ JWT_SECRET must be at least 32 characters (64 hex digits)');
    }

    if (
      secret.includes('your-super-secret') ||
      secret.includes('change-in-production') ||
      secret.includes('change-this')
    ) {
      throw new Error('❌ JWT_SECRET is using default/placeholder value. CHANGE IT IMMEDIATELY!');
    }

    return secret;
  }

  /**
   * Get JWT expiration time
   */
  getJwtExpiration(): string {
    return process.env.JWT_EXPIRATION || '900'; // 15 minutos por defecto
  }

  /**
   * Get allowed CORS origins
   */
  getAllowedOrigins(): string[] {
    const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3001';
    return origins.split(',').map((o) => o.trim());
  }

  /**
   * Get environment
   */
  getEnvironment(): 'development' | 'production' | 'test' {
    return (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }
}
