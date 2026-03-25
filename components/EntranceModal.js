"use client";
import { useState } from "react";

export default function EntranceModal({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/entrance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Senha incorreta.");
      localStorage.setItem("tm_entrance", "true");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%), #0d0d0d",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "#141414", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "420px",
        textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <p style={{
            fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase",
            color: "#c9a84c", marginBottom: "12px",
          }}>
            Projeto Integrador · UNIVESP
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "2.2rem", fontWeight: 900, color: "#e8e2d6",
            lineHeight: 1.15,
          }}>
            Tattoo<br />
            <em style={{ color: "#c9a84c" }}>Match</em>
          </h1>
        </div>

        <p style={{
          fontSize: "0.88rem", color: "#7a7268", lineHeight: "1.7",
          marginBottom: "32px",
        }}>
          Esta aplicação web faz parte do{" "}
          <strong style={{ color: "#e8e2d6" }}>Projeto Integrador da UNIVESP</strong>.
          Se você é tester, avaliador ou integrante do grupo, a senha de acesso
          será disponibilizada por um membro do grupo e estará no{" "}
          <strong style={{ color: "#e8e2d6" }}>Relatório Final</strong>{" "}
          na plataforma da universidade.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            id="entrance-password"
            type="password"
            className="input"
            placeholder="Digite a senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Senha de acesso"
            aria-required="true"
            style={{ textAlign: "center", letterSpacing: "3px", fontSize: "1rem" }}
          />

          {error && (
            <p className="error-msg" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            aria-busy={loading}
            style={{ marginTop: "4px" }}
          >
            {loading ? "Verificando…" : "Acessar"}
          </button>
        </form>

        <p style={{ fontSize: "0.75rem", color: "#4a4540", marginTop: "24px" }}>
          Desenvolvimento de Software · 2025
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}