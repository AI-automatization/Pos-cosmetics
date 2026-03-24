import { registerDecorator, ValidationOptions } from 'class-validator';

// ─── EAN CHECK DIGIT ─────────────────────────────────────────────────────────
// Used for EAN-13, EAN-8, UPC-A barcode checksum validation

function calcEanCheckDigit(digits: string): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[i], 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  return (10 - (sum % 10)) % 10;
}

// ─── BARCODE VALIDATOR ────────────────────────────────────────────────────────
// EAN-13 (13 digits), EAN-8 (8 digits), UPC-A (12 digits), Code128 (printable ASCII 1-48 chars)

export function IsValidBarcode(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidBarcode',
      target: object.constructor,
      propertyName,
      options: {
        message: "Barcode format noto'g'ri (EAN-13, EAN-8, UPC-A yoki Code128 bo'lishi kerak)",
        ...options,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          const code = value.trim();

          // EAN-13: 13 digits with valid check digit
          if (/^\d{13}$/.test(code)) {
            return calcEanCheckDigit(code.slice(0, 12)) === parseInt(code[12], 10);
          }

          // UPC-A: 12 digits with valid check digit
          if (/^\d{12}$/.test(code)) {
            return calcEanCheckDigit(code.slice(0, 11)) === parseInt(code[11], 10);
          }

          // EAN-8: 8 digits with valid check digit
          if (/^\d{8}$/.test(code)) {
            return calcEanCheckDigit(code.slice(0, 7)) === parseInt(code[7], 10);
          }

          // Code128: printable ASCII (space 0x20 to tilde 0x7E), 1–48 chars
          if (/^[\x20-\x7E]{1,48}$/.test(code)) {
            return true;
          }

          return false;
        },
      },
    });
  };
}

// ─── UZBEK PHONE VALIDATOR ────────────────────────────────────────────────────
// Format: +998XXXXXXXXX  (international, exactly 13 chars)

export function IsUzPhone(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsUzPhone',
      target: object.constructor,
      propertyName,
      options: {
        message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
        ...options,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          return /^\+998[0-9]{9}$/.test(value.trim());
        },
      },
    });
  };
}

// ─── PRICE VALIDATOR ─────────────────────────────────────────────────────────
// Positive number, max 2 decimal places, reasonable upper bound (1 billion UZS)

export function IsValidPrice(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidPrice',
      target: object.constructor,
      propertyName,
      options: {
        message: "Narx musbat son bo'lishi va 2 dan ko'p kasr bo'lmaslik kerak",
        ...options,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'number') return false;
          if (value < 0 || value > 1_000_000_000) return false;
          // max 2 decimal places
          const str = String(value);
          if (str.includes('.')) {
            return str.split('.')[1].length <= 2;
          }
          return true;
        },
      },
    });
  };
}

// ─── MIME TYPE VALIDATOR ──────────────────────────────────────────────────────
// Allowed image MIME types for file uploads

export const ALLOWED_IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMimetype = (typeof ALLOWED_IMAGE_MIMETYPES)[number];

export function isAllowedImageMimetype(
  mimetype: string,
): mimetype is AllowedImageMimetype {
  return ALLOWED_IMAGE_MIMETYPES.includes(mimetype as AllowedImageMimetype);
}
