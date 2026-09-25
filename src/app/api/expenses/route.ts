import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { expenseSchema } from "@/lib/validations/expense";

export async function GET(request: Request) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const expenses = await prisma.expense.findMany({
    where: {
      type: type ? (type as "RESTAURANT" | "PERSONAL") : undefined,
      date:
        start && end
          ? {
              gte: new Date(`${start}T00:00:00.000Z`),
              lt: new Date(new Date(`${end}T00:00:00.000Z`).getTime() + 86400000),
            }
          : undefined,
    },
    orderBy: { date: "desc" },
  });
  return Response.json(expenses);
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["OWNER"]);
  if (error) return error;

  const body = await request.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: new Date(`${parsed.data.date}T00:00:00.000Z`),
      note: parsed.data.note,
      createdById: user!.id,
    },
  });
  return Response.json(expense, { status: 201 });
}
