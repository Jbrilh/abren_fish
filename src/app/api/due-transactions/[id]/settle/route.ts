import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const { id } = await params;
  const txn = await prisma.dueTransaction.findUnique({ where: { id } });
  if (!txn) return Response.json({ error: "Not found" }, { status: 404 });
  if (txn.settled) {
    return Response.json({ error: "Already settled" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.dueTransaction.update({
      where: { id },
      data: { settled: true, settledDate: new Date() },
    });
    await tx.customer.update({
      where: { id: txn.customerId },
      data: { dueBalance: { decrement: txn.amount } },
    });
  });

  return Response.json({ ok: true });
}
