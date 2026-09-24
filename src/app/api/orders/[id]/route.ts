import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true } },
      customer: true,
      createdBy: { select: { name: true } },
    },
  });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(order);
}
