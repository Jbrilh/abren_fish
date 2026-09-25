import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

const NAV_LINKS = [
  { href: "/owner", label: "Dashboard" },
  { href: "/owner/menu", label: "Menu" },
  { href: "/owner/inventory", label: "Inventory" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Due list" },
  { href: "/reconciliation", label: "Reconciliation" },
];

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name} (Owner)
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
