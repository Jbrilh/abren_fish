"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ExpenseRow = {
  id: string;
  category: string;
  amount: string;
  date: string;
  note: string | null;
};

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

export function ExpenseLog({
  type,
  basePath,
  start,
  end,
  categorySuggestions,
  expenses,
  byCategory,
}: {
  type: "RESTAURANT" | "PERSONAL";
  basePath: string;
  start: string;
  end: string;
  categorySuggestions: string[];
  expenses: ExpenseRow[];
  byCategory: { category: string; amount: number }[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(end);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function updateRange(newStart: string, newEnd: string) {
    router.push(`${basePath}?start=${newStart}&end=${newEnd}`);
  }

  async function handleAdd() {
    if (!category.trim() || !amount) {
      toast.error("Category and amount are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, category, amount, date, note: note || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to log expense"));
        return;
      }
      toast.success("Expense logged");
      setCategory("");
      setAmount("");
      setNote("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      toast.success("Expense deleted");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="rangeStart">From</Label>
          <Input
            id="rangeStart"
            type="date"
            value={start}
            max={end}
            onChange={(e) => updateRange(e.target.value, end)}
            className="w-44"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rangeEnd">To</Label>
          <Input
            id="rangeEnd"
            type="date"
            value={end}
            min={start}
            onChange={(e) => updateRange(start, e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
                <XAxis
                  dataKey="category"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="amount" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={64}>
                  <LabelList
                    dataKey="amount"
                    position="top"
                    formatter={(v: React.ReactNode) => formatMoney(Number(v))}
                    fill="var(--foreground)"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log an expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="expDate">Date</Label>
              <Input
                id="expDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expCategory">Category</Label>
              <Input
                id="expCategory"
                list={`${type}-category-suggestions`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Rent"
              />
              <datalist id={`${type}-category-suggestions`}>
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expAmount">Amount</Label>
              <Input
                id="expAmount"
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expNote">Note (optional)</Label>
              <Input id="expNote" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add expense"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses in range</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses logged in this range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.category}</TableCell>
                    <TableCell>{formatMoney(Number(e.amount))}</TableCell>
                    <TableCell className="text-muted-foreground">{e.note}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === e.id}
                        onClick={() => handleDelete(e.id)}
                      >
                        {deletingId === e.id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
