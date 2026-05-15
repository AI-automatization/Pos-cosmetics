import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const SALT = 'raos-payment-credentials';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const masterKey = this.config.get<string>('ENCRYPTION_MASTER_KEY');
    if (!masterKey) {
      this.logger.warn(
        'ENCRYPTION_MASTER_KEY not set — using fallback dev key. DO NOT use in production!',
      );
    }
    const secret = masterKey || 'raos-dev-encryption-key-not-for-production';
    this.key = scryptSync(secret, SALT, KEY_LENGTH);
  }

  /** Encrypt plaintext → "ivHex:tagHex:ciphertextHex" */
  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return [
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  /** Decrypt "ivHex:tagHex:ciphertextHex" → plaintext */
  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    const [ivHex, tagHex, encHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }
}
