import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * T-072: Global HTML strip pipe — removes <...> tags from all string inputs.
 * Applied globally BEFORE ValidationPipe so data is sanitized before validation.
 */
@Injectable()
export class SanitizeStringPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return this.sanitize(value);
    }
    if (value !== null && typeof value === 'object') {
      return this.sanitizeObject(value as Record<string, unknown>);
    }
    return value;
  }

  private sanitize(str: string): string {
    // Remove HTML/XML tags and trim whitespace
    return str.replace(/<[^>]*>/g, '').trim();
  }

  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        result[key] = this.sanitize(val);
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          typeof item === 'string'
            ? this.sanitize(item)
            : item !== null && typeof item === 'object'
              ? this.sanitizeObject(item as Record<string, unknown>)
              : item,
        );
      } else if (val !== null && typeof val === 'object') {
        result[key] = this.sanitizeObject(val as Record<string, unknown>);
      } else {
        result[key] = val;
      }
    }
    return result;
  }
}
