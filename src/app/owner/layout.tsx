import Link from "next/link";
import { Fish } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { OwnerNav } from "./owner-nav";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <Link
            href="/owner"
            className="flex shrink-0 items-center gap-2 font-heading font-semibold"
          >
            <Fish className="size-5" />
            <span className="hidden sm:inline">
              Abren Fish{" "}
              <span className="font-normal text-primary-foreground/60">· Owner</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-primary-foreground/80 sm:inline">
              {session?.user?.name}
            </span>
            <SignOutButton className="border-white/30 bg-transparent px-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:px-3" />
          </div>
        </div>
        <OwnerNav />
      </header>
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
