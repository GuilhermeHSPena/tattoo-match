"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/apiClient";

const STATUS_LABEL = { pending: "Pendente", approved: "Aprovado", rejected: "Recusado" };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }
    if (session.user.role === "artist") { router.push("/admin"); return; }
    api.requests.list()
      .then((d) => setRequests(d.requests))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [session, status]);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  if (status === "loading" || loading) return (
    <><Navbar /><div className="loading-center"><div className="spinner" role="status"><span className="sr-only">Carregando…</span></div></div></>
  );

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Meus pedidos</h1>
            <p style={{ color: "var(--muted)" }}>Olá, <strong style={{ color: "var(--text)" }}>{session?.user?.name}</strong></p>
          </div>

          <div className="filters" role="group" aria-label="Filtrar pedidos por status">
            {[["all", "Todos"], ["pending", "Pendentes"], ["approved", "Aprovados"], ["rejected", "Recusados"]].map(([v, l]) => (
              <button key={v} className={`filter-btn ${filter === v ? "active" : ""}`}
                onClick={() => setFilter(v)} aria-pressed={filter === v}>{l}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
                {requests.length === 0 ? "Você ainda não fez nenhum pedido." : "Nenhum pedido com este status."}
              </p>
              {requests.length === 0 && <Link href="/gallery" className="btn btn-gold">Explorar galeria</Link>}
            </div>
          ) : (
            <div className="table-wrap" role="region" aria-label="Lista de pedidos">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Tatuagem</th>
                    <th scope="col">Tatuador</th>
                    <th scope="col">Status</th>
                    <th scope="col">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={r.tattoo.image_url} alt={r.tattoo.label}
                            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: "6px" }}
                            onError={(e) => { e.target.src = "https://placehold.co/44x44/141414/c9a84c?text=T"; }} />
                          <span>{r.tattoo.label}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)" }}>{r.tattoo.artist.name}</td>
                      <td>
                        <span className={`badge badge-${r.status}`} aria-label={`Status: ${STATUS_LABEL[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
