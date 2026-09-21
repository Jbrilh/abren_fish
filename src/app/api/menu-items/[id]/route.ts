import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { menuItemSchema } from "@/lib/validations/menu";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { recipeItems: true },
  });
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: parsed.data,
  });
  return Response.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.menuItem.delete({ where: { id } });
  } catch {
    return Response.json(
      { error: "Can't delete: this item is referenced by existing orders." },
      { status: 409 }
    );
  }
  return new Response(null, { status: 204 });
}
