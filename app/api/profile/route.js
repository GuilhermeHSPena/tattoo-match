import prisma from "../../../lib/prisma";
import { ok, err, requireSession } from "../../../lib/apiHelpers";

export async function GET(request) {
  const { session, res } = await requireSession();
  if (res) return res;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { id: true, name: true, city: true, instagram: true },
  });

  return ok({ user });
}

export async function PATCH(request) {
  const { session, res } = await requireSession();
  if (res) return res;

  const body = await request.json().catch(() => ({}));
  const { city, instagram } = body;

  const user = await prisma.user.update({
    where: { id: parseInt(session.user.id) },
    data: {
      city: city?.trim() || null,
      instagram: instagram?.trim() || null,
    },
  });

  return ok({ user: { id: user.id, name: user.name, city: user.city, instagram: user.instagram } });
}