import prisma from "../../../../lib/prisma";
import { ok, err, requireRole } from "../../../../lib/apiHelpers";

export async function DELETE(request, { params }) {
  const { session, res } = await requireRole("artist");
  if (res) return res;

  const { id: rawId } = await params;
  const id = parseInt(rawId);

  const tattoo = await prisma.tattoo.findUnique({ where: { id } });
  if (!tattoo) return err("Tatuagem não encontrada.", 404);
  if (tattoo.artistId !== parseInt(session.user.id))
    return err("Você só pode excluir suas próprias tatuagens.", 403);

  await prisma.tattoo.delete({ where: { id } });
  return ok({ message: "Tatuagem removida." });
}