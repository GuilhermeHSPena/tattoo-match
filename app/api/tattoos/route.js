import prisma from "../../../lib/prisma";
import { ok, err, requireRole } from "../../../lib/apiHelpers";

const PRICE_RANGES = {
  "0-300":    { gte: 0,    lt: 300 },
  "300-600":  { gte: 300,  lt: 600 },
  "600-1000": { gte: 600,  lt: 1000 },
  "1000-2000":{ gte: 1000, lt: 2000 },
  "2000+":    { gte: 2000 },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category  = searchParams.get("category");
  const size      = searchParams.get("size");
  const artistId  = searchParams.get("artist_id");
  const priceRange = searchParams.get("price_range");

  const priceFilter = priceRange && PRICE_RANGES[priceRange]
    ? { price: PRICE_RANGES[priceRange] }
    : {};

  const tattoos = await prisma.tattoo.findMany({
    where: {
      ...(category  ? { category }                    : {}),
      ...(size      ? { size }                        : {}),
      ...(artistId  ? { artistId: parseInt(artistId) } : {}),
      ...priceFilter,
    },
    include: {
      artist: { select: { id: true, name: true, city: true, instagram: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    tattoos: tattoos.map((t) => ({
      id:          t.id,
      label:       t.label,
      description: t.description,
      category:    t.category,
      size:        t.size,
      image_url:   t.imageUrl,
      price:       t.price ? Number(t.price) : null,
      artist:      t.artist,
      created_at:  t.createdAt,
    })),
  });
}

export async function POST(request) {
  const { session, res } = await requireRole("artist");
  if (res) return res;

  const body = await request.json().catch(() => ({}));
  const { label, image_url, category, size, description, price } = body;

  if (!label?.trim())     return err("Campo 'label' é obrigatório.");
  if (!image_url?.trim()) return err("Campo 'image_url' é obrigatório.");

  const tattoo = await prisma.tattoo.create({
    data: {
      label:       label.trim(),
      imageUrl:    image_url.trim(),
      category:    category?.trim()    || null,
      size:        size?.trim()        || null,
      description: description?.trim() || null,
      price:       price ? parseFloat(price) : null,
      artistId:    parseInt(session.user.id),
    },
    include: {
      artist: { select: { id: true, name: true, city: true, instagram: true } },
    },
  });

  return ok({
    tattoo: {
      id:          tattoo.id,
      label:       tattoo.label,
      description: tattoo.description,
      category:    tattoo.category,
      size:        tattoo.size,
      image_url:   tattoo.imageUrl,
      price:       tattoo.price ? Number(tattoo.price) : null,
      artist:      tattoo.artist,
      created_at:  tattoo.createdAt,
    },
  }, 201);
}