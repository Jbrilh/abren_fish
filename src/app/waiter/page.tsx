import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function WaiterPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Waiter — Orders</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.name} (Waiter)
          </p>
        </div>
        <SignOutButton />
      </div>
      <p className="text-sm text-muted-foreground">
        Order entry, checkout, and the customer due list will land here in
        later phases.
      </p>
    </div>
  );
}
