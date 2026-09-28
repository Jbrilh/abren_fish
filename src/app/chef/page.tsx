import { Fish, ChefHat } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { KitchenDisplay } from "./kitchen-display";

export default async function ChefPage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
              <ChefHat className="size-5" />
            </div>
            <div>
              <h1 className="font-heading font-semibold leading-tight">
                Kitchen Display
              </h1>
              <p className="flex items-center gap-1 text-xs text-primary-foreground/70">
                <Fish className="size-3" />
                Abren Fish · {session?.user?.name}
              </p>
            </div>
          </div>
          <SignOutButton className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" />
        </div>
      </header>
      <KitchenDisplay />
    </div>
  );
}
