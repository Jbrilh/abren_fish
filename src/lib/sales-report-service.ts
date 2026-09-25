import { prisma } from "@/lib/prisma";
import { computeOrderTotal } from "@/lib/order-service";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CBE: "CBE",
  TELEBIRR: "Telebirr",
  HALF_HALF: "Half/half",
  DUE: "Due",
};

export async function getSalesReport(startDateStr: string, endDateStr: string) {
  const start = new Date(`${startDateStr}T00:00:00.000Z`);
  const end = new Date(`${endDateStr}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const orders = await prisma.order.findMany({
    where: { status: "PAID", paidAt: { gte: start, lt: end } },
    include: { items: true },
  });

  const dailyTotals = new Map<string, number>();
  const methodTotals = new Map<string, number>();
  let totalRevenue = 0;

  for (const order of orders) {
    const total = computeOrderTotal(order.items);
    totalRevenue += total;

    const day = order.paidAt!.toISOString().slice(0, 10);
    dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + total);

    const method = order.paymentMethod ?? "UNKNOWN";
    methodTotals.set(method, (methodTotals.get(method) ?? 0) + total);
  }

  const daily: { date: string; total: number }[] = [];
  for (
    let d = new Date(start);
    d < end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const key = d.toISOString().slice(0, 10);
    daily.push({ date: key, total: dailyTotals.get(key) ?? 0 });
  }

  const byPaymentMethod = Array.from(methodTotals.entries())
    .map(([method, total]) => ({
      method: PAYMENT_METHOD_LABELS[method] ?? method,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    daily,
    byPaymentMethod,
    summary: {
      totalRevenue,
      orderCount: orders.length,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    },
  };
}
