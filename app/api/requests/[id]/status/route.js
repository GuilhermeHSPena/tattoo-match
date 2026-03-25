import prisma from "../../../../../lib/prisma";
import { ok, err, requireRole } from "../../../../../lib/apiHelpers";

const VALID = ["pending", "approved", "rejected"];

export async function PATCH(request, { params }) {
  const { session, res } = await requireRole("artist");
  if (res) return res;

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  const req = await prisma.tattooRequest.findUnique({
    where: { id },
    include: { tattoo: true },
  });

  if (!req) return err("Pedido não encontrado.", 404);
  if (req.tattoo.artistId !== parseInt(session.user.id))
    return err("Este pedido não pertence às suas tatuagens.", 403);

  const body = await request.json().catch(() => ({}));
  const { status } = body;
  if (!VALID.includes(status)) return err(`Status inválido. Use: ${VALID.join(", ")}.`);

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: { status },
    include: {
      client: { select: { id: true, name: true, email: true } },
      tattoo: { include: { artist: { select: { id: true, name: true } } } },
    },
  });

  return ok({ request: updated });
}
