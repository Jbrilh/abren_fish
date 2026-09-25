import { prisma } from "@/lib/prisma";
import { DueList } from "./due-list";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    where: { dueBalance: { gt: 0 } },
    include: {
      dueTxns: {
        where: { settled: false },
        include: {
          order: { select: { ticketNumber: true, tableNumber: true, createdAt: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    dueBalance: c.dueBalance.toString(),
    transactions: c.dueTxns.map((t) => ({
      id: t.id,
      amount: t.amount.toString(),
      createdAt: t.createdAt.toISOString(),
      orderLabel: t.order.ticketNumber
        ? `Ticket ${t.order.ticketNumber}${t.order.tableNumber ? ` (Table ${t.order.tableNumber})` : ""}`
        : "Delivery",
    })),
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Customer due list</h1>
      <DueList customers={data} />
    </div>
  );
}
