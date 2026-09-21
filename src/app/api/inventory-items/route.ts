import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { inventoryItemSchema } from "@/lib/validations/inventory";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const body = await request.json();
  const parsed = inventoryItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.inventoryItem.create({ data: parsed.data });
  return Response.json(item, { status: 201 });
}
