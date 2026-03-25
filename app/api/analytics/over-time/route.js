import prisma from "../../../../lib/prisma";
import { ok, requireRole } from "../../../../lib/apiHelpers";

export async function GET() {
  const { session, res } = await requireRole("artist");
  if (res) return res;

  const artistId = parseInt(session.user.id);
  const tattoos = await prisma.tattoo.findMany({ where: { artistId }, select: { id: true } });
  const tattooIds = tattoos.map((t) => t.id);

  const requests = await prisma.tattooRequest.findMany({
    where: { tattooId: { in: tattooIds } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const map = {};
  for (const r of requests) {
    const day = r.createdAt.toISOString().slice(0, 10);
    map[day] = (map[day] ?? 0) + 1;
  }

  const data = Object.entries(map).map(([day, count]) => ({ day, count }));
  return ok({ data });
}
