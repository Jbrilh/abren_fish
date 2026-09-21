import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { recipeSchema } from "@/lib/validations/menu";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { id: menuItemId } = await params;
  const body = await request.json();
  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const recipeItems = await prisma.$transaction(async (tx) => {
    await tx.recipeItem.deleteMany({ where: { menuItemId } });
    if (parsed.data.items.length === 0) return [];
    await tx.recipeItem.createMany({
      data: parsed.data.items.map((item) => ({
        menuItemId,
        inventoryItemId: item.inventoryItemId,
        quantityNeeded: item.quantityNeeded,
      })),
    });
    return tx.recipeItem.findMany({ where: { menuItemId } });
  });

  return Response.json(recipeItems);
}
