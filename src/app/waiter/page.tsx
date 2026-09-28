import Link from "next/link";
import { Fish, PlusCircle, ClipboardList } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  {
    href: "/orders/new",
    label: "New order",
    description: "Start a dine-in or delivery order",
    icon: PlusCircle,
    primary: true,
  },
  {
    href: "/orders",
    label: "View orders",
    description: "See open and recent orders",
    icon: ClipboardList,
  },
];

export default async function WaiterPage() {
  const session = await auth();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <Fish className="size-5" />
            <span>
              Abren Fish{" "}
              <span className="font-normal text-primary-foreground/60">
                · Waiter
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-foreground/80">
              {session?.user?.name}
            </span>
            <SignOutButton className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/40 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card
                  className={
                    action.primary
                      ? "border-primary/30 bg-primary text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      : "transition-all hover:-translate-y-0.5 hover:shadow-md"
                  }
                >
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div
                      className={
                        action.primary
                          ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15"
                          : "flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
                      }
                    >
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.label}</CardTitle>
                      <p
                        className={
                          action.primary
                            ? "text-sm text-primary-foreground/75"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {action.description}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
