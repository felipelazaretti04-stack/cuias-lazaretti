import { prisma } from "@/lib/prisma";

export function makePublicOrderId(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CLZ-${y}${m}${d}-${rand}`;
}

export async function computeOrderTotals(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const subtotal = items.reduce((acc, it) => acc + it.lineTotalCents, 0);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const total = subtotal + (order.shippingCostCents ?? 0);

  await prisma.order.update({
    where: { id: orderId },
    data: { subtotalCents: subtotal, totalCents: total },
  });

  return { subtotalCents: subtotal, totalCents: total };
}
