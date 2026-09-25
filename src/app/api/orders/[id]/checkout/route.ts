import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { checkoutSchema } from "@/lib/validations/checkout";
import { computeOrderTotal } from "@/lib/order-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "SERVED") {
    return Response.json(
      { error: "Order must be fully served before checkout." },
      { status: 409 }
    );
  }

  if (data.paymentMethod === "DUE" && !order.customerId) {
    if (!data.customerName || !data.customerPhone) {
      return Response.json(
        {
          error: {
            formErrors: [
              "Customer name and phone are required to put an order on a due tab.",
            ],
          },
        },
        { status: 400 }
      );
    }
  }

  const total = computeOrderTotal(order.items);

  const updatedOrder = await prisma.$transaction(async (tx) => {
    let customerId = order.customerId;

    if (data.paymentMethod === "DUE") {
      if (!customerId) {
        const customer = await tx.customer.upsert({
          where: { phone: data.customerPhone! },
          update: { name: data.customerName! },
          create: { name: data.customerName!, phone: data.customerPhone! },
        });
        customerId = customer.id;
      }

      await tx.dueTransaction.create({
        data: {
          customerId,
          orderId: id,
          amount: total,
        },
      });

      await tx.customer.update({
        where: { id: customerId },
        data: { dueBalance: { increment: total } },
      });
    }

    return tx.order.update({
      where: { id },
      data: {
        paymentMethod: data.paymentMethod,
        status: "PAID",
        paidAt: new Date(),
        customerId,
      },
      include: {
        items: { include: { menuItem: true }, orderBy: { createdAt: "asc" } },
        customer: true,
      },
    });
  });

  return Response.json(updatedOrder);
}
