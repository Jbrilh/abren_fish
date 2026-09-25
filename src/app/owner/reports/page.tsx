import { getSalesReport } from "@/lib/sales-report-service";
import { SalesCharts } from "./sales-charts";

function defaultRange() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const start = params.start ?? defaults.start;
  const end = params.end ?? defaults.end;

  const report = await getSalesReport(start, end);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Sales report</h1>
      <SalesCharts start={start} end={end} report={report} />
    </div>
  );
}
