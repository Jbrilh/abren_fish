import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic route - no auth check, remove after debugging deployment issues.
export async function GET() {
  try {
    const count = await prisma.user.count();
    return Response.json({ ok: true, userCount: count });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
