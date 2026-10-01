import { Fish, ChefHat } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { KitchenDisplay } from "./kitchen-display";

export default async function ChefPage() {
  const session = await auth();

  return (
    <div className="min-h-dvh flex flex-col bg-muted/40">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <ChefHat className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-heading font-semibold leading-tight">
                Kitchen Display
              </h1>
              <p className="flex items-center gap-1 truncate text-xs text-primary-foreground/70">
                <Fish className="size-3 shrink-0" />
                <span className="truncate">
                  Abren Fish · {session?.user?.name}
                </span>
              </p>
            </div>
          </div>
          <SignOutButton className="shrink-0 border-white/30 bg-transparent px-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:px-3" />
        </div>
      </header>
      <KitchenDisplay />
    </div>
  );
}
