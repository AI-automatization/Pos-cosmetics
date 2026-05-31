import { z } from 'zod';

/**
 * Yangi nasiya (qarz) yaratish uchun zod schema.
 * FormState dagi totalAmount string bo'lgani uchun
 * preprocess orqali number ga aylantiramiz.
 */
export const newDebtSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Mijoz ismi kiritilishi shart'),
  phone: z
    .string()
    .optional(),
  totalAmount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const cleaned = val.replace(/\s/g, '');
        const num = Number(cleaned);
        return Number.isNaN(num) ? 0 : num;
      }
      return val;
    },
    z.number().positive("Summa 0 dan katta bo'lishi kerak"),
  ),
  dueDate: z
    .string()
    .optional(),
  notes: z
    .string()
    .optional(),
});

export type NewDebtFormData = z.infer<typeof newDebtSchema>;

/** Field-level xatoliklarni saqlash uchun tip */
export type NewDebtFieldErrors = Partial<Record<keyof NewDebtFormData, string>>;

/**
 * ZodError dan field-level xatoliklarni chiqarib beradi.
 * Har field uchun faqat birinchi xabarni oladi.
 */
export function extractFieldErrors(
  error: z.ZodError<NewDebtFormData>,
): NewDebtFieldErrors {
  const result: NewDebtFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof NewDebtFormData | undefined;
    if (field && !result[field]) {
      result[field] = issue.message;
    }
  }
  return result;
}
