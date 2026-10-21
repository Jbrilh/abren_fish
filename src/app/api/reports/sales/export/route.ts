import ExcelJS from "exceljs";
import { requireUser } from "@/lib/api-auth";
import { getSalesReport } from "@/lib/sales-report-service";

export async function GET(request: Request) {
  const { error } = await requireUser(["OWNER"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return Response.json({ error: "start and end are required" }, { status: 400 });
  }

  const report = await getSalesReport(start, end);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Abren Fish";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 24 },
    { header: "Value", key: "value", width: 20 },
  ];
  summarySheet.addRows([
    { metric: "Date range", value: `${start} to ${end}` },
    { metric: "Total revenue", value: report.summary.totalRevenue },
    { metric: "Paid orders", value: report.summary.orderCount },
    { metric: "Avg order value", value: report.summary.avgOrderValue },
  ]);
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getColumn("value").numFmt = "#,##0.00";
  summarySheet.getCell("B3").numFmt = "0";

  const dailySheet = workbook.addWorksheet("Daily revenue");
  dailySheet.columns = [
    { header: "Date", key: "date", width: 16 },
    { header: "Revenue", key: "total", width: 16 },
  ];
  dailySheet.addRows(report.daily);
  dailySheet.getRow(1).font = { bold: true };
  dailySheet.getColumn("total").numFmt = "#,##0.00";

  const methodSheet = workbook.addWorksheet("By payment method");
  methodSheet.columns = [
    { header: "Payment method", key: "method", width: 20 },
    { header: "Revenue", key: "total", width: 16 },
  ];
  methodSheet.addRows(report.byPaymentMethod);
  methodSheet.getRow(1).font = { bold: true };
  methodSheet.getColumn("total").numFmt = "#,##0.00";

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sales-report-${start}-to-${end}.xlsx"`,
    },
  });
}
