import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const homeHref = session?.user?.role === "OWNER" ? "/owner" : "/waiter";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-4">
            <Link
              href={homeHref}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Orders
            </Link>
            <Link
              href="/customers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Due list
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
