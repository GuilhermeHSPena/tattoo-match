import prisma from "../../../../lib/prisma";
import { ok, requireRole } from "../../../../lib/apiHelpers";

export async function GET() {
  const { session, res } = await requireRole("artist");
  if (res) return res;

  const artistId = parseInt(session.user.id);

  const tattoos = await prisma.tattoo.findMany({ where: { artistId }, select: { id: true } });
  const tattooIds = tattoos.map((t) => t.id);

  const [pending, approved, rejected] = await Promise.all([
    prisma.tattooRequest.count({ where: { tattooId: { in: tattooIds }, status: "pending" } }),
    prisma.tattooRequest.count({ where: { tattooId: { in: tattooIds }, status: "approved" } }),
    prisma.tattooRequest.count({ where: { tattooId: { in: tattooIds }, status: "rejected" } }),
  ]);

  return ok({
    total_tattoos: tattooIds.length,
    total_requests: pending + approved + rejected,
    by_status: { pending, approved, rejected },
  });
}
