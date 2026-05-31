import { z } from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(1, 'Ism kiritilishi shart'),
  lastName: z.string().min(1, 'Familiya kiritilishi shart'),
  email: z.string().email('Email formati noto\'g\'ri').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'VIEWER']).optional(),
  password: z.string().min(6, 'Parol kamida 6 belgi').optional().or(z.literal('')),
});

export type UserFormData = z.infer<typeof userSchema>;

/**
 * Field-level xatolarni chiqarish uchun helper.
 * ZodError dan { fieldName: errorMessage } shaklida object qaytaradi.
 */
export function extractFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
