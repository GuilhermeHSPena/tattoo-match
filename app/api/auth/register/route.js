import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { ok, err } from "../../../../lib/apiHelpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, password, role } = body;

  if (!name?.trim() || !email?.trim() || !password?.trim())
    return err("Nome, e-mail e senha são obrigatórios.");

  if (!["client", "artist"].includes(role))
    return err("Role inválido. Use 'client' ou 'artist'.");

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return err("E-mail já cadastrado.", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase(), passwordHash, role },
  });

  return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
}
