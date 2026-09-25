"use client";

import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Report = {
  daily: { date: string; total: number }[];
  byPaymentMethod: { method: string; total: number }[];
  summary: { totalRevenue: number; orderCount: number; avgOrderValue: number };
};

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatShortDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
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
      <p className="text-muted-foreground">
        {label && !isNaN(Date.parse(label)) ? formatShortDate(label) : label}
      </p>
      <p className="font-medium">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

export function SalesCharts({
  start,
  end,
  report,
}: {
  start: string;
  end: string;
  report: Report;
}) {
  const router = useRouter();

  function updateRange(newStart: string, newEnd: string) {
    router.push(`/owner/reports?start=${newStart}&end=${newEnd}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="start">From</Label>
          <Input
            id="start"
            type="date"
            value={start}
            max={end}
            onChange={(e) => updateRange(e.target.value, end)}
            className="w-44"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">To</Label>
          <Input
            id="end"
            type="date"
            value={end}
            min={start}
            onChange={(e) => updateRange(start, e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatMoney(report.summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Paid orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{report.summary.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Avg order value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatMoney(report.summary.avgOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {report.summary.orderCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          No paid orders in this date range.
        </p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Revenue by day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={report.daily} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="0"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    minTickGap={24}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatMoney}
                    width={56}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="var(--chart-1)"
                    fillOpacity={0.1}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by payment method</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={report.byPaymentMethod} margin={{ top: 20 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="0"
                  />
                  <XAxis
                    dataKey="method"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    <LabelList
                      dataKey="total"
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
        </>
      )}
    </div>
  );
}
