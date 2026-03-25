"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    // Fetch session to know the role and redirect accordingly
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    router.push(session?.user?.role === "artist" ? "/admin" : "/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-box fade-up">
        <Link href="/" style={{ color: "var(--gold)", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase" }}>
          ← Tattoo Match
        </Link>
        <h1 className="auth-title" style={{ marginTop: "24px" }}>Entrar</h1>
        <p className="auth-subtitle">Bem-vindo de volta.</p>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input id="email" type="email" className="input" placeholder="seu@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required aria-required="true" autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input id="password" type="password" className="input" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              required aria-required="true" autoComplete="current-password" />
          </div>

          {error && <p className="error-msg" role="alert">{error}</p>}

          <button type="submit" className="btn btn-gold" disabled={loading} aria-busy={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "0.9rem", color: "var(--muted)", textAlign: "center" }}>
          Não tem conta?{" "}
          <Link href="/register" style={{ color: "var(--gold)" }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
