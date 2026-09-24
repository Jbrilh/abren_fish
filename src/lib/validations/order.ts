import { z } from "zod";

const orderItemInput = z.object({
  menuItemId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const createOrderSchema = z
  .object({
    type: z.enum(["DINE_IN", "DELIVERY"]),
    ticketNumber: z.string().min(1).optional(),
    tableNumber: z.string().min(1).optional(),
    customerName: z.string().min(1).optional(),
    customerPhone: z.string().min(1).optional(),
    items: z.array(orderItemInput).default([]),
  })
  .refine((data) => data.type !== "DINE_IN" || !!data.ticketNumber, {
    message: "Ticket number is required for dine-in orders",
    path: ["ticketNumber"],
  })
  .refine(
    (data) => data.type !== "DELIVERY" || (!!data.customerName && !!data.customerPhone),
    {
      message: "Customer name and phone are required for delivery orders",
      path: ["customerPhone"],
    }
  );

export const addItemsSchema = z.object({
  items: z.array(orderItemInput).min(1),
});
