import { z } from "zod";

export const expenseSchema = z.object({
  type: z.enum(["RESTAURANT", "PERSONAL"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  note: z.string().optional(),
});
