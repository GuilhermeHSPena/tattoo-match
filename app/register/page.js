"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.register(form);
      // Auto-login after register
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) { setError("Conta criada, mas erro ao entrar. Tente fazer login."); return; }
      router.push(form.role === "artist" ? "/admin" : "/gallery");
    } catch (err) {
      setError(err.message ?? "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box fade-up">
        <Link href="/" style={{ color: "var(--gold)", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase" }}>
          ← Tattoo Match
        </Link>
        <h1 className="auth-title" style={{ marginTop: "24px" }}>Criar conta</h1>
        <p className="auth-subtitle">Junte-se à comunidade.</p>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nome completo</label>
            <input id="name" type="text" className="input" placeholder="Seu nome"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              required aria-required="true" autoComplete="name" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input id="email" type="email" className="input" placeholder="seu@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required aria-required="true" autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input id="password" type="password" className="input" placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              required aria-required="true" autoComplete="new-password" />
          </div>

          <fieldset style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
            <legend className="form-label" style={{ padding: "0 8px" }}>Tipo de conta</legend>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              {[
                { value: "client", label: "Cliente", desc: "Quero me tatuar" },
                { value: "artist", label: "Tatuador", desc: "Tenho um portfólio" },
              ].map((opt) => (
                <label key={opt.value} style={{
                  flex: 1, cursor: "pointer", display: "flex", flexDirection: "column", gap: "2px",
                  padding: "12px", borderRadius: "var(--radius)", border: "1px solid",
                  borderColor: form.role === opt.value ? "var(--gold)" : "var(--border)",
                  background: form.role === opt.value ? "var(--gold-dim)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  <input type="radio" name="role" value={opt.value}
                    checked={form.role === opt.value}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="sr-only" />
                  <span style={{ fontWeight: 500, color: form.role === opt.value ? "var(--gold)" : "var(--text)" }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{opt.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="error-msg" role="alert">{error}</p>}

          <button type="submit" className="btn btn-gold" disabled={loading} aria-busy={loading}>
            {loading ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "0.9rem", color: "var(--muted)", textAlign: "center" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "var(--gold)" }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
