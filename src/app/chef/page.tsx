import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { KitchenDisplay } from "./kitchen-display";

export default async function ChefPage() {
  const session = await auth();

  return (
    <div>
      <div className="p-6 pb-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Kitchen Display</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.name} (Chef)
          </p>
        </div>
        <SignOutButton />
      </div>
      <KitchenDisplay />
    </div>
  );
}
