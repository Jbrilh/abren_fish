import { prisma } from "@/lib/prisma";
import { computeOrderTotal } from "@/lib/order-service";

export function dayBounds(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function computeExpectedCash(dateStr: string) {
  const { start, end } = dayBounds(dateStr);

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: start, lt: end },
      paymentMethod: { in: ["CASH", "HALF_HALF"] },
    },
    include: { items: true },
  });

  return orders.reduce((sum, order) => {
    const total = computeOrderTotal(order.items);
    return sum + (order.paymentMethod === "HALF_HALF" ? total * 0.5 : total);
  }, 0);
}
