import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { inventoryItemSchema } from "@/lib/validations/inventory";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = inventoryItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: parsed.data,
  });
  return Response.json(item);
}
