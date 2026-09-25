import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export default async function WaiterPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Waiter</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.name} (Waiter)
          </p>
        </div>
        <SignOutButton />
      </div>
      <div className="flex gap-2">
        <Button render={<Link href="/orders" />}>View orders</Button>
        <Button variant="outline" render={<Link href="/orders/new" />}>
          New order
        </Button>
        <Button variant="outline" render={<Link href="/customers" />}>
          Due list
        </Button>
        <Button variant="outline" render={<Link href="/reconciliation" />}>
          Reconciliation
        </Button>
      </div>
    </div>
  );
}
