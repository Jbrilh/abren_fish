import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { applyInventoryDelta } from "@/lib/order-service";

const NON_CANCELLABLE_STATUSES = ["PAID", "SERVED", "CANCELLED"];

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (NON_CANCELLABLE_STATUSES.includes(order.status)) {
    return Response.json(
      { error: "This order can't be cancelled anymore." },
      { status: 409 }
    );
  }

  const pendingItems = order.items.filter((i) => i.status === "PENDING");

  const updated = await prisma.$transaction(async (tx) => {
    if (pendingItems.length > 0) {
      await applyInventoryDelta(
        tx,
        pendingItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        -1
      );
    }
    return tx.order.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: { items: { include: { menuItem: true } }, customer: true },
    });
  });

  return Response.json(updated);
}
