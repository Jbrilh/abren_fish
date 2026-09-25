import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

const LINKS = [
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Due list" },
  { href: "/reconciliation", label: "Reconciliation" },
];

export function StaffNav({
  homeHref,
  userName,
}: {
  homeHref: string;
  userName: string | null | undefined;
}) {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <nav className="flex items-center gap-4">
          <Link
            href={homeHref}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          {LINKS.map((link) => (
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
          <span className="text-sm text-muted-foreground">{userName}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
