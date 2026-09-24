import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { error } = await requireUser(["CHEF"]);
  if (error) return error;

  const { id, itemId } = await params;

  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== id) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }
  if (item.status === "SERVED") {
    return Response.json({ error: "Already served" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.update({
      where: { id: itemId },
      data: { status: "SERVED" },
    });

    const remaining = await tx.orderItem.count({
      where: { orderId: id, status: { not: "SERVED" } },
    });

    if (remaining === 0) {
      await tx.order.update({
        where: { id },
        data: { status: "SERVED", servedAt: new Date() },
      });
    }
  });

  const updatedOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true }, orderBy: { createdAt: "asc" } },
      customer: true,
    },
  });

  return Response.json(updatedOrder);
}
