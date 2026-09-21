import { redirect } from "next/navigation";
import { auth } from "@/auth";

const ROLE_HOME: Record<string, string> = {
  OWNER: "/owner",
  WAITER: "/waiter",
  CHEF: "/chef",
};

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(ROLE_HOME[session.user.role] ?? "/login");
}
