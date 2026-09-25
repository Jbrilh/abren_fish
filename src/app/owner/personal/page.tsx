import { getExpenseReport } from "@/lib/expense-report-service";
import { ExpenseLog } from "@/components/expense-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PERSONAL_CATEGORY_SUGGESTIONS = [
  "Rent",
  "Groceries",
  "Transport",
  "Child expenses",
];

function defaultRange() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default async function PersonalExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const start = params.start ?? defaults.start;
  const end = params.end ?? defaults.end;

  const report = await getExpenseReport("PERSONAL", start, end);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Personal expenses</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your own draw/expenses - kept separate from the restaurant P&amp;L.
      </p>

      <Card className="max-w-xs mb-6">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Total this range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {report.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </CardContent>
      </Card>

      <ExpenseLog
        type="PERSONAL"
        basePath="/owner/personal"
        start={start}
        end={end}
        categorySuggestions={PERSONAL_CATEGORY_SUGGESTIONS}
        expenses={report.expenses}
        byCategory={report.byCategory}
      />
    </div>
  );
}
