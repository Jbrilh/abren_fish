import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";

export async function requireUser(allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      user: null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      user: null,
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user: session.user, error: null };
}
