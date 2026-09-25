"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Transaction = {
  id: string;
  amount: string;
  createdAt: string;
  orderLabel: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  dueBalance: string;
  transactions: Transaction[];
};

export function DueList({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [settlingId, setSettlingId] = useState<string | null>(null);

  async function handleSettle(txnId: string) {
    setSettlingId(txnId);
    try {
      const res = await fetch(`/api/due-transactions/${txnId}/settle`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to settle"));
        return;
      }
      toast.success("Marked settled");
      router.refresh();
    } finally {
      setSettlingId(null);
    }
  }

  if (customers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No outstanding due balances.
      </p>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {customer.name} · {customer.phone}
              </span>
              <span className="text-destructive">
                Owes {Number(customer.dueBalance).toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.orderLabel}</TableCell>
                    <TableCell>
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{Number(txn.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={settlingId === txn.id}
                        onClick={() => handleSettle(txn.id)}
                      >
                        {settlingId === txn.id ? "Settling..." : "Mark settled"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
