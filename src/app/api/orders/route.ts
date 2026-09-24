import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { createOrderSchema } from "@/lib/validations/order";
import { applyInventoryDelta } from "@/lib/order-service";

export async function GET(request: Request) {
  const { error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      items: { include: { menuItem: true } },
      customer: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(orders);
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const menuItems =
    data.items.length > 0
      ? await prisma.menuItem.findMany({
          where: { id: { in: data.items.map((i) => i.menuItemId) } },
        })
      : [];
  const priceById = new Map(menuItems.map((m) => [m.id, m.price]));

  const order = await prisma.$transaction(async (tx) => {
    let customerId: string | undefined;
    if (data.type === "DELIVERY") {
      const customer = await tx.customer.upsert({
        where: { phone: data.customerPhone! },
        update: { name: data.customerName! },
        create: { name: data.customerName!, phone: data.customerPhone! },
      });
      customerId = customer.id;
    }

    const hasItems = data.items.length > 0;

    const created = await tx.order.create({
      data: {
        type: data.type,
        ticketNumber: data.type === "DINE_IN" ? data.ticketNumber : undefined,
        tableNumber: data.type === "DINE_IN" ? data.tableNumber : undefined,
        customerId,
        createdById: user!.id,
        status: hasItems ? "SENT_TO_KITCHEN" : "OPEN",
        sentToKitchenAt: hasItems ? new Date() : undefined,
        items: hasItems
          ? {
              create: data.items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                priceAtOrder: priceById.get(item.menuItemId) ?? 0,
              })),
            }
          : undefined,
      },
      include: { items: { include: { menuItem: true } }, customer: true },
    });

    if (hasItems) {
      await applyInventoryDelta(tx, data.items, 1);
    }

    return created;
  });

  return Response.json(order, { status: 201 });
}
