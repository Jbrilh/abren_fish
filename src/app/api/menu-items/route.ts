import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { menuItemSchema } from "@/lib/validations/menu";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { recipeItems: true },
  });
  return Response.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const body = await request.json();
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.menuItem.create({ data: parsed.data });
  return Response.json(item, { status: 201 });
}
