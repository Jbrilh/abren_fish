import { auth } from "@/auth";
import { StaffNav } from "@/components/staff-nav";

export default async function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const homeHref = session?.user?.role === "OWNER" ? "/owner" : "/waiter";

  return (
    <div className="min-h-screen flex flex-col">
      <StaffNav homeHref={homeHref} userName={session?.user?.name} />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
