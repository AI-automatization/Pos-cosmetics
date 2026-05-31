import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email kiritilishi shart')
    .email('Email formati noto\'g\'ri'),
  password: z
    .string()
    .min(1, 'Parol kiritilishi shart')
    .min(6, 'Parol kamida 6 belgi bo\'lishi kerak'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Zod xatolarini field -> message map ga aylantiradi.
 * Har field uchun faqat birinchi xatolik qaytariladi.
 */
export function formatZodErrors(
  error: z.ZodError<LoginFormData>,
): Partial<Record<keyof LoginFormData, string>> {
  const result: Partial<Record<keyof LoginFormData, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof LoginFormData | undefined;
    if (field && !result[field]) {
      result[field] = issue.message;
    }
  }
  return result;
}
