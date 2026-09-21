import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
});

export const recipeSchema = z.object({
  items: z.array(
    z.object({
      inventoryItemId: z.string().min(1),
      quantityNeeded: z.coerce.number().positive("Quantity must be greater than 0"),
    })
  ),
});
