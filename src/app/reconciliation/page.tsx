import { prisma } from "@/lib/prisma";
import { computeExpectedCash, dayBounds } from "@/lib/reconciliation-service";
import { ReconciliationForm } from "./reconciliation-form";

export default async function ReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().slice(0, 10);

  const { start } = dayBounds(date);

  const [expectedCash, existing, history] = await Promise.all([
    computeExpectedCash(date),
    prisma.cashReconciliation.findUnique({ where: { date: start } }),
    prisma.cashReconciliation.findMany({
      orderBy: { date: "desc" },
      take: 14,
    }),
  ]);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Cash reconciliation</h1>
      <ReconciliationForm
        date={date}
        expectedCash={expectedCash}
        existing={
          existing
            ? {
                actualCash: existing.actualCash.toString(),
                difference: existing.difference.toString(),
                note: existing.note,
              }
            : null
        }
        history={history.map((h) => ({
          date: h.date.toISOString().slice(0, 10),
          expectedCash: h.expectedCash.toString(),
          actualCash: h.actualCash.toString(),
          difference: h.difference.toString(),
        }))}
      />
    </div>
  );
}
