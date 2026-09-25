import { prisma } from "@/lib/prisma";

export async function getExpenseReport(
  type: "RESTAURANT" | "PERSONAL",
  startDateStr: string,
  endDateStr: string
) {
  const start = new Date(`${startDateStr}T00:00:00.000Z`);
  const end = new Date(`${endDateStr}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const expenses = await prisma.expense.findMany({
    where: { type, date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  const byCategory = new Map<string, number>();
  let total = 0;
  for (const expense of expenses) {
    const amount = expense.amount.toNumber();
    total += amount;
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + amount);
  }

  return {
    total,
    expenses: expenses.map((e) => ({
      id: e.id,
      category: e.category,
      amount: e.amount.toString(),
      date: e.date.toISOString().slice(0, 10),
      note: e.note,
    })),
    byCategory: Array.from(byCategory.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}
