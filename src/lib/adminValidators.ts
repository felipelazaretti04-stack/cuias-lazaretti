import { z } from "zod";


export const orderStatusSchema = z.enum(["PENDING", "PAID", "CANCELLED", "SHIPPED"]);

export const adminUpdateOrderSchema = z.object({
  status: orderStatusSchema,
});
