import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export function ok(data, status = 200) {
  return Response.json(data, { status });
}

export function err(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function requireSession(request) {
  const session = await getServerSession(authOptions);
  if (!session) return { session: null, res: err("Não autenticado.", 401) };
  return { session, res: null };
}

export async function requireRole(role) {
  const session = await getServerSession(authOptions);
  if (!session) return { session: null, res: err("Não autenticado.", 401) };
  if (session.user.role !== role)
    return { session: null, res: err("Acesso não autorizado.", 403) };
  return { session, res: null };
}
