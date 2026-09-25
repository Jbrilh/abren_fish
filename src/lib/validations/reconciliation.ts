import { z } from "zod";

export const reconciliationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  actualCash: z.coerce.number().min(0, "Can't be negative"),
  note: z.string().optional(),
});
