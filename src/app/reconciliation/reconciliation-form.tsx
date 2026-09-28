"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Existing = {
  actualCash: string;
  difference: string;
  note: string | null;
} | null;

type HistoryRow = {
  date: string;
  expectedCash: string;
  actualCash: string;
  difference: string;
};

export function ReconciliationForm({
  date,
  expectedCash,
  existing,
  history,
}: {
  date: string;
  expectedCash: number;
  existing: Existing;
  history: HistoryRow[];
}) {
  const router = useRouter();
  const [actualCash, setActualCash] = useState(existing?.actualCash ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const liveDifference =
    actualCash === "" ? null : Number(actualCash) - expectedCash;

  async function handleSave() {
    if (actualCash === "") {
      toast.error("Enter the actual cash counted.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, actualCash, note: note || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to save reconciliation"));
        return;
      }
      toast.success("Reconciliation saved");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => router.push(`/reconciliation?date=${e.target.value}`)}
              className="w-48"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Expected cash</Label>
              <p className="text-lg font-medium">{expectedCash.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Cash orders + half of half/half orders, paid this day
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualCash">Actual cash counted</Label>
              <Input
                id="actualCash"
                type="number"
                step="any"
                min="0"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
              />
            </div>
          </div>

          {liveDifference !== null && (
            <p
              className={
                liveDifference === 0
                  ? "text-sm text-muted-foreground"
                  : "text-sm text-destructive"
              }
            >
              Difference: {liveDifference >= 0 ? "+" : ""}
              {liveDifference.toFixed(2)}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : existing ? "Update" : "Save"}
          </Button>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent history</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{Number(row.expectedCash).toFixed(2)}</TableCell>
                    <TableCell>{Number(row.actualCash).toFixed(2)}</TableCell>
                    <TableCell
                      className={
                        Number(row.difference) === 0 ? "" : "text-destructive"
                      }
                    >
                      {Number(row.difference) >= 0 ? "+" : ""}
                      {Number(row.difference).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
