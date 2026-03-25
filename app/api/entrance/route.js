import { ok, err } from "../../../lib/apiHelpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password?.trim()) return err("Senha obrigatória.");

  const correct = process.env.ENTRANCE_PASSWORD;
  if (!correct) return err("Senha não configurada no servidor.", 500);

  if (password.trim() !== correct) return err("Senha incorreta.");

  return ok({ ok: true });
}