import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["CHEF"]);
  if (error) return error;

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  const updatedOrder = await prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({
      where: { orderId: id, status: "PENDING" },
      data: { status: "SERVED" },
    });

    return tx.order.update({
      where: { id },
      data: { status: "SERVED", servedAt: new Date() },
      include: {
        items: { include: { menuItem: true }, orderBy: { createdAt: "asc" } },
        customer: true,
      },
    });
  });

  return Response.json(updatedOrder);
}
