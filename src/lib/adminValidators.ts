import { z } from "zod";

export const orderStatusSchema = z.enum(["PENDING", "PAID", "CANCELLED", "SHIPPED"]);

export const adminUpdateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  trackingCode: z.string().trim().max(120).optional().nullable(),
  trackingUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
});
