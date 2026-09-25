import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["CASH", "CBE", "TELEBIRR", "HALF_HALF", "DUE"]),
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().min(1).optional(),
});
