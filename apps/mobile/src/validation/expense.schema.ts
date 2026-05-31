import { z } from 'zod';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../api/expenses.api';

export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Xarajat tavsifi kiritilishi shart'),
  amount: z
    .number({ invalid_type_error: 'Summa raqam bo\'lishi kerak' })
    .positive('Summa 0 dan katta bo\'lishi kerak'),
  category: z
    .string()
    .min(1, 'Kategoriya tanlanishi shart')
    .refine(
      (val): val is ExpenseCategory => EXPENSE_CATEGORIES.includes(val as ExpenseCategory),
      'Noto\'g\'ri kategoriya',
    ),
  date: z
    .string()
    .optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

/** Field nomini xato xabariga map qilish uchun yordamchi */
export function getFieldErrors(
  result: z.SafeParseReturnType<unknown, ExpenseFormData>,
): Partial<Record<keyof ExpenseFormData, string>> {
  if (result.success) return {};

  const errors: Partial<Record<keyof ExpenseFormData, string>> = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ExpenseFormData | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
