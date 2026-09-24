import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { computeOrderTotal } from "@/lib/order-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  OPEN: "secondary",
  SENT_TO_KITCHEN: "default",
  SERVED: "default",
  PAID: "secondary",
  CANCELLED: "destructive",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <Button render={<Link href="/orders/new" />}>New order</Button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Table / Ticket / Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {order.type === "DINE_IN" ? "Dine-in" : "Delivery"}
                </TableCell>
                <TableCell>
                  {order.type === "DINE_IN"
                    ? `Ticket ${order.ticketNumber ?? "-"}${
                        order.tableNumber ? ` (Table ${order.tableNumber})` : ""
                      }`
                    : `${order.customer?.name ?? "-"} (${order.customer?.phone ?? "-"})`}
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>{computeOrderTotal(order.items).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                    {order.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/orders/${order.id}`} />}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
