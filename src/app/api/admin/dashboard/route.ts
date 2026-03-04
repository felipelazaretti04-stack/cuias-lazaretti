// file: src/app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const [pendingCount, paidCount, shippedCount, cancelledCount] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
  ]);

  const paidThisMonth = await prisma.order.findMany({
    where: { status: "PAID", createdAt: { gte: from, lte: to } },
    select: { totalCents: true, createdAt: true },
    take: 5000,
  });

  const revenueMonthCents = paidThisMonth.reduce((acc, o) => acc + (o.totalCents || 0), 0);
  const paidMonthCount = paidThisMonth.length;
  const ticketAvgCents = paidMonthCount > 0 ? Math.round(revenueMonthCents / paidMonthCount) : 0;

  // Série diária do mês atual (1..N)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const buckets = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    revenueCents: 0,
    orders: 0,
  }));

  for (const o of paidThisMonth) {
    const day = new Date(o.createdAt).getDate();
    const idx = day - 1;
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].revenueCents += o.totalCents || 0;
      buckets[idx].orders += 1;
    }
  }

  const lastOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      publicId: true,
      status: true,
      paymentStatus: true,
      totalCents: true,
      createdAt: true,
      customerEmail: true,
      customerName: true,
    },
  });

  return NextResponse.json({
    range: { from: from.toISOString(), to: to.toISOString() },
    kpis: {
      pendingCount,
      paidCount,
      shippedCount,
      cancelledCount,
      revenueMonthCents,
      paidMonthCount,
      ticketAvgCents,
    },
    series: buckets,
    lastOrders,
  });
}
