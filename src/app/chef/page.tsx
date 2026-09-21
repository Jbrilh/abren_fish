import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ChefPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Kitchen Display</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.name} (Chef)
          </p>
        </div>
        <SignOutButton />
      </div>
      <p className="text-sm text-muted-foreground">
        The live incoming-orders queue will land here in a later phase.
      </p>
    </div>
  );
}
