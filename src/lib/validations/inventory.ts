import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
  stockQty: z.coerce.number().min(0, "Stock can't be negative"),
  lowStockThreshold: z.coerce.number().min(0, "Threshold can't be negative"),
});
