import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Mahsulot nomi kiritilishi shart'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  costPrice: z.number().min(0, 'Tannarx 0 dan kam bo\'lmasligi kerak'),
  salePrice: z.number().positive('Sotish narxi 0 dan katta bo\'lishi kerak'),
  minStock: z.number().min(0, 'Minimal zaxira 0 dan kam bo\'lmasligi kerak').optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

/** Field nomlari bo'yicha xatolik xaritasi */
export type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>;

/**
 * ZodError dan field-level xatolik xaritasini yaratadi.
 * Har field uchun faqat birinchi xatolik olinadi.
 */
export function extractFieldErrors(
  issues: z.ZodIssue[],
): ProductFormErrors {
  const errors: ProductFormErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof ProductFormData | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
