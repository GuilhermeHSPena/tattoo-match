import prisma from "../../../lib/prisma";
import { ok, err, requireSession } from "../../../lib/apiHelpers";

const include = {
  client: { select: { id: true, name: true, email: true } },
  tattoo: {
    include: { artist: { select: { id: true, name: true } } },
  },
};

function fmt(r) {
  return {
    id: r.id,
    client: r.client,
    tattoo: {
      id: r.tattoo.id,
      label: r.tattoo.label,
      image_url: r.tattoo.imageUrl,
      category: r.tattoo.category,
      size: r.tattoo.size,
      artist: r.tattoo.artist,
    },
    phone: r.phone,
    message: r.message,
    status: r.status,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export async function GET(request) {
  const { session, res } = await requireSession();
  if (res) return res;

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const userId = parseInt(session.user.id);

  let where = {};
  if (session.user.role === "artist") {
    where = { tattoo: { artistId: userId } };
  } else {
    where = { clientId: userId };
  }
  if (statusFilter) where.status = statusFilter;

  const requests = await prisma.tattooRequest.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });

  return ok({ requests: requests.map(fmt) });
}

export async function POST(request) {
  const { session, res } = await requireSession();
  if (res) return res;

  if (session.user.role !== "client")
    return err("Apenas clientes podem fazer pedidos.", 403);

  const body = await request.json().catch(() => ({}));
  const { tattoo_id, phone, message } = body;

  if (!tattoo_id) return err("Campo 'tattoo_id' é obrigatório.");

  const tattoo = await prisma.tattoo.findUnique({ where: { id: parseInt(tattoo_id) } });
  if (!tattoo) return err("Tatuagem não encontrada.", 404);

  const req = await prisma.tattooRequest.create({
    data: {
      clientId: parseInt(session.user.id),
      tattooId: tattoo.id,
      phone: phone?.trim() || null,
      message: message?.trim() || null,
    },
    include,
  });

  return ok({ request: fmt(req) }, 201);
}
