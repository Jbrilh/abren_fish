import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { id } = await params;
  await prisma.expense.delete({ where: { id } }).catch(() => null);
  return new Response(null, { status: 204 });
}
