import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function OwnerPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Owner Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.name} (Owner)
          </p>
        </div>
        <SignOutButton />
      </div>
      <p className="text-sm text-muted-foreground">
        Menu, inventory, reports, and P&amp;L will land here in later phases.
      </p>
    </div>
  );
}
