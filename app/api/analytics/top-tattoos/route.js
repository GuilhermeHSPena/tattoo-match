import prisma from "../../../../lib/prisma";
import { ok, requireRole } from "../../../../lib/apiHelpers";

export async function GET() {
  const { session, res } = await requireRole("artist");
  if (res) return res;

  const artistId = parseInt(session.user.id);

  const tattoos = await prisma.tattoo.findMany({
    where: { artistId },
    include: { _count: { select: { requests: true } } },
    orderBy: { requests: { _count: "desc" } },
    take: 10,
  });

  const data = tattoos.map((t) => ({
    tattoo_id: t.id,
    label: t.label,
    total_requests: t._count.requests,
  }));

  return ok({ data });
}
