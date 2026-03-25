"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  function handleLogout() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Navegação principal">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo" aria-label="Tattoo Match — página inicial">
          Tattoo Match
        </Link>

        <div className="navbar-links">
          <Link href="/gallery" className="btn btn-ghost">Galeria</Link>

          {!session ? (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">Entrar</Link>
              <Link href="/register" className="btn btn-gold btn-sm">Cadastrar</Link>
            </>
          ) : (
            <>
            {session.user.role === "artist" ? (
              <Link href="/admin" className="btn btn-ghost">Painel</Link>
            ) : (
              <Link href="/dashboard" className="btn btn-ghost">Meus pedidos</Link>
            )}
            <span style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              padding: "0 4px",
            }}>
              Olá, <strong style={{ color: "var(--text)" }}>{session.user.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              aria-label="Sair da conta"
            >
              Sair
            </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
