import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const { error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const customers = await prisma.customer.findMany({
    where: { dueBalance: { gt: 0 } },
    include: {
      dueTxns: {
        where: { settled: false },
        include: { order: { select: { ticketNumber: true, tableNumber: true, createdAt: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  return Response.json(customers);
}
