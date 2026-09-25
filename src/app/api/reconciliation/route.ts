import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { reconciliationSchema } from "@/lib/validations/reconciliation";
import { computeExpectedCash, dayBounds } from "@/lib/reconciliation-service";

export async function POST(request: Request) {
  const { user, error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const body = await request.json();
  const parsed = reconciliationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const expectedCash = await computeExpectedCash(data.date);
  const difference = data.actualCash - expectedCash;
  const { start } = dayBounds(data.date);

  const record = await prisma.cashReconciliation.upsert({
    where: { date: start },
    update: {
      expectedCash,
      actualCash: data.actualCash,
      difference,
      note: data.note,
      createdById: user!.id,
    },
    create: {
      date: start,
      expectedCash,
      actualCash: data.actualCash,
      difference,
      note: data.note,
      createdById: user!.id,
    },
  });

  return Response.json(record);
}
