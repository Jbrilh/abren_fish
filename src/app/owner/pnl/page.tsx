import { getSalesReport } from "@/lib/sales-report-service";
import { getExpenseReport } from "@/lib/expense-report-service";
import { ExpenseLog } from "@/components/expense-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RESTAURANT_CATEGORY_SUGGESTIONS = [
  "Ingredients",
  "Utilities",
  "Salaries",
  "Rent",
  "Maintenance",
  "Supplies",
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

export default async function PnlPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const start = params.start ?? defaults.start;
  const end = params.end ?? defaults.end;

  const [sales, expenseReport] = await Promise.all([
    getSalesReport(start, end),
    getExpenseReport("RESTAURANT", start, end),
  ]);

  const revenue = sales.summary.totalRevenue;
  const expenses = expenseReport.total;
  const net = revenue - expenses;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Restaurant P&amp;L</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Revenue from paid orders minus restaurant expenses. Kept separate from
        personal expenses.
      </p>

      <div className="grid grid-cols-1 gap-4 max-w-2xl mb-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Restaurant expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Net P&amp;L</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-semibold"
              style={{ color: net >= 0 ? "var(--status-good)" : "var(--status-critical)" }}
            >
              {net >= 0 ? "+" : ""}
              {net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <ExpenseLog
        type="RESTAURANT"
        basePath="/owner/pnl"
        start={start}
        end={end}
        categorySuggestions={RESTAURANT_CATEGORY_SUGGESTIONS}
        expenses={expenseReport.expenses}
        byCategory={expenseReport.byCategory}
      />
    </div>
  );
}
