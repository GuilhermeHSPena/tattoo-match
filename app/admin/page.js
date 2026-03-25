"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/apiClient";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

const STATUS_LABEL = { pending: "Pendente", approved: "Aprovado", rejected: "Recusado" };
const TABS = ["Pedidos", "Portfólio", "Analytics"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.85rem" }}>
      <p style={{ color: "var(--muted)", marginBottom: "4px" }}>{label}</p>
      <p style={{ color: "var(--gold)", fontWeight: 500 }}>{payload[0].value} pedido{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("Pedidos");

  const [requests, setRequests] = useState([]);
  const [reqFilter, setReqFilter] = useState("all");
  const [reqLoading, setReqLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  const [profile, setProfile] = useState({ city: "", instagram: "" });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [tattoos, setTattoos] = useState([]);
  const [tatLoading, setTatLoading] = useState(true);
  const [tatForm, setTatForm] = useState({ label: "", image_url: "", category: "", size: "", price: "", description: "" });
  const [tatError, setTatError] = useState("");
  const [tatSuccess, setTatSuccess] = useState("");
  const [tatSubmitting, setTatSubmitting] = useState(false);

  const [summary, setSummary] = useState(null);
  const [overTime, setOverTime] = useState([]);
  const [topTattoos, setTopTattoos] = useState([]);
  const [anaLoading, setAnaLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }
    if (session.user.role !== "artist") { router.push("/dashboard"); return; }
    fetchAll();
  }, [session, status]);

  async function fetchAll() {
    await Promise.all([fetchRequests(), fetchTattoos(), fetchAnalytics(), fetchProfile()]);
  }

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile({ city: data.user?.city || "", instagram: data.user?.instagram || "" });
    } catch {}
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileSuccess("");
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setProfileSuccess("Perfil atualizado!");
    } catch {}
    finally { setProfileSubmitting(false); }
  }

  async function fetchRequests() {
    setReqLoading(true);
    try { const d = await api.requests.list(); setRequests(d.requests); }
    catch { setRequests([]); }
    finally { setReqLoading(false); }
  }

  async function fetchTattoos() {
    setTatLoading(true);
    try {
      const data = await api.tattoos.list({ artist_id: session.user.id });
      setTattoos(data.tattoos);
    } catch { setTattoos([]); }
    finally { setTatLoading(false); }
  }

  async function fetchAnalytics() {
    setAnaLoading(true);
    try {
      const [s, ot, tt] = await Promise.all([api.analytics.summary(), api.analytics.overTime(), api.analytics.topTattoos()]);
      setSummary(s); setOverTime(ot.data); setTopTattoos(tt.data);
    } catch {}
    finally { setAnaLoading(false); }
  }

  async function handleStatusChange(reqId, newStatus) {
    try {
      await api.requests.updateStatus(reqId, newStatus);
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: newStatus } : r));
    } catch (err) { alert(err.message); }
  }

  async function handleCreateTattoo(e) {
    e.preventDefault();
    setTatError(""); setTatSuccess(""); setTatSubmitting(true);
    try {
      const created = await api.tattoos.create(tatForm);
      setTattoos((prev) => [created.tattoo, ...prev]);
      setTatForm({ label: "", image_url: "", category: "", size: "", price: "", description: "" });
      setTatSuccess("Tatuagem adicionada com sucesso!");
    } catch (err) { setTatError(err.message); }
    finally { setTatSubmitting(false); }
  }

  async function handleDeleteTattoo(id) {
    if (!confirm("Remover esta tatuagem do portfólio?")) return;
    try { await api.tattoos.delete(id); setTattoos((prev) => prev.filter((t) => t.id !== id)); }
    catch (err) { alert(err.message); }
  }

  const filteredReqs = reqFilter === "all" ? requests : requests.filter((r) => r.status === reqFilter);

  if (status === "loading") return (
    <div className="loading-center"><div className="spinner" role="status"><span className="sr-only">Carregando…</span></div></div>
  );

  return (
    <div className="dashboard-layout">
          <aside className="sidebar" aria-label="Menu lateral">
            <div className="sidebar-logo">Tattoo Match</div>
            {TABS.map((t) => (
              <button key={t} className={`sidebar-link ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)} aria-current={tab === t ? "page" : undefined}>
                {t === "Pedidos" && "📋 "}{t === "Portfólio" && "🎨 "}{t === "Analytics" && "📊 "}{t}
              </button>
            ))}
            <div style={{ marginTop: "auto" }}>
              <Link href="/gallery" className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                Galeria
              </Link>
              <button className="sidebar-link" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sair da conta">
                ← Sair
              </button>
            </div>
          </aside>

      <main className="main-content">
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.8rem" }}>
            {tab === "Pedidos" && "Pedidos recebidos"}
            {tab === "Portfólio" && "Meu portfólio"}
            {tab === "Analytics" && "Analytics"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>Olá, {session?.user?.name}</p>
        </div>

        {/* ── Pedidos ── */}
        {tab === "Pedidos" && (
          <section aria-label="Gerenciar pedidos">
            <div className="filters" role="group" aria-label="Filtrar por status">
              {[["all", "Todos"], ["pending", "Pendentes"], ["approved", "Aprovados"], ["rejected", "Recusados"]].map(([v, l]) => (
                <button key={v} className={`filter-btn ${reqFilter === v ? "active" : ""}`}
                  onClick={() => setReqFilter(v)} aria-pressed={reqFilter === v}>{l}</button>
              ))}
            </div>
            {reqLoading ? (
              <div className="loading-center"><div className="spinner" role="status"><span className="sr-only">Carregando…</span></div></div>
            ) : filteredReqs.length === 0 ? (
              <p style={{ color: "var(--muted)", padding: "40px 0" }}>Nenhum pedido encontrado.</p>
            ) : (
              <div className="table-wrap" role="region" aria-label="Tabela de pedidos">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Cliente</th>
                      <th scope="col">Tatuagem</th>
                      <th scope="col">Status</th>
                      <th scope="col">Data</th>
                      <th scope="col">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReqs.map((r) => (
                      <tr key={r.id}
                        onClick={() => setSelectedReq(r)}
                        style={{ cursor: "pointer" }}
                        title="Clique para ver detalhes">
                        <td>
                          <div style={{ fontWeight: 500 }}>{r.client.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{r.client.email}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img src={r.tattoo.image_url} alt={r.tattoo.label}
                              style={{ width: 36, height: 36, objectFit: "cover", borderRadius: "4px" }}
                              onError={(e) => { e.target.src = "https://placehold.co/36x36/141414/c9a84c?text=T"; }} />
                            <span style={{ fontSize: "0.9rem" }}>{r.tattoo.label}</span>
                          </div>
                        </td>
                        <td><span className={`badge badge-${r.status}`}>{STATUS_LABEL[r.status]}</span></td>
                        <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                        <td>
                          {r.status === "pending" && (
                            <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                              <button className="btn btn-sm btn-gold" onClick={() => handleStatusChange(r.id, "approved")}
                                aria-label={`Aprovar pedido de ${r.client.name}`}>Aprovar</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(r.id, "rejected")}
                                aria-label={`Recusar pedido de ${r.client.name}`}>Recusar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Portfólio ── */}
        {tab === "Portfólio" && (
          <section aria-label="Gerenciar portfólio">

            {/* Perfil do tatuador */}
            <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "20px" }}>Meu perfil</h2>
              <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label htmlFor="profile-city" className="form-label">Cidade</label>
                  <input id="profile-city" className="input" placeholder="Ex: São Paulo"
                    value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-instagram" className="form-label">Instagram</label>
                  <input id="profile-instagram" className="input" placeholder="@seuarroba"
                    value={profile.instagram} onChange={(e) => setProfile({ ...profile, instagram: e.target.value })} />
                </div>
                {profileSuccess && <p className="success-msg" role="status" style={{ gridColumn: "1 / -1" }}>{profileSuccess}</p>}
                <button type="submit" className="btn btn-outline" disabled={profileSubmitting} style={{ gridColumn: "1 / -1" }} aria-busy={profileSubmitting}>
                  {profileSubmitting ? "Salvando…" : "Salvar perfil"}
                </button>
              </form>
            </div>

            {/* Formulário de tatuagem */}
            <div className="card" style={{ padding: "28px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "20px" }}>Adicionar tatuagem</h2>
              <form onSubmit={handleCreateTattoo} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="tat-label" className="form-label">Nome / título *</label>
                  <input id="tat-label" className="input" placeholder="Ex: Rosa Tradicional"
                    value={tatForm.label} onChange={(e) => setTatForm({ ...tatForm, label: e.target.value })} required aria-required="true" />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="tat-url" className="form-label">URL da imagem *</label>
                  <input id="tat-url" className="input" type="url" placeholder="https://..."
                    value={tatForm.image_url} onChange={(e) => setTatForm({ ...tatForm, image_url: e.target.value })} required aria-required="true" />
                </div>
                <div className="form-group">
                  <label htmlFor="tat-cat" className="form-label">Categoria</label>
                  <select id="tat-cat" className="input" value={tatForm.category}
                    onChange={(e) => setTatForm({ ...tatForm, category: e.target.value })}>
                    <option value="">— Selecione —</option>
                    <option value="tradicional">Tradicional</option>
                    <option value="geométrico">Geométrico</option>
                    <option value="tribal">Tribal</option>
                    <option value="realismo">Realismo</option>
                    <option value="aquarela">Aquarela</option>
                    <option value="minimalista">Minimalista</option>
                    <option value="oriental">Oriental</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="tat-size" className="form-label">Tamanho</label>
                  <select id="tat-size" className="input" value={tatForm.size}
                    onChange={(e) => setTatForm({ ...tatForm, size: e.target.value })}>
                    <option value="">—</option>
                    <option value="pequeno">Pequeno</option>
                    <option value="médio">Médio</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="tat-price" className="form-label">Preço cobrado (R$)</label>
                  <input id="tat-price" className="input" type="number" min="0" step="0.01"
                    placeholder="Ex: 350.00"
                    value={tatForm.price}
                    onChange={(e) => setTatForm({ ...tatForm, price: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="tat-desc" className="form-label">Descrição</label>
                  <textarea id="tat-desc" className="input" placeholder="Descreva o trabalho…"
                    value={tatForm.description} onChange={(e) => setTatForm({ ...tatForm, description: e.target.value })}
                    rows={2} style={{ resize: "vertical" }} />
                </div>
                {tatError && <p className="error-msg" role="alert" style={{ gridColumn: "1 / -1" }}>{tatError}</p>}
                {tatSuccess && <p className="success-msg" role="status" style={{ gridColumn: "1 / -1" }}>{tatSuccess}</p>}
                <button type="submit" className="btn btn-gold" disabled={tatSubmitting} style={{ gridColumn: "1 / -1" }} aria-busy={tatSubmitting}>
                  {tatSubmitting ? "Salvando…" : "Adicionar ao portfólio"}
                </button>
              </form>
            </div>

            {/* Lista de tatuagens */}
            {tatLoading ? (
              <div className="loading-center"><div className="spinner" role="status"><span className="sr-only">Carregando…</span></div></div>
            ) : tattoos.length === 0 ? (
              <p style={{ color: "var(--muted)", padding: "40px 0" }}>Nenhuma tatuagem no portfólio ainda.</p>
            ) : (
              <ul className="tattoo-grid" style={{ listStyle: "none" }} aria-label="Suas tatuagens">
                {tattoos.map((t) => (
                  <li key={t.id} className="card tattoo-card">
                    <div style={{ overflow: "hidden" }}>
                      <img src={t.image_url} alt={t.label} className="tattoo-card-img"
                        onError={(e) => { e.target.src = "https://placehold.co/400x300/141414/c9a84c?text=Tattoo"; }} />
                    </div>
                    <div className="tattoo-card-body">
                      <p className="tattoo-card-label">{t.label}</p>
                      <div className="tattoo-card-meta">
                        {t.category && <span>{t.category}</span>}
                        {t.size && <span>· {t.size}</span>}
                        {t.artist?.city && <span>· 📍 {t.artist.city}</span>}
                      </div>
                      {t.price && (
                        <p style={{ color: "var(--gold)", fontWeight: 500, fontSize: "0.95rem", marginTop: "8px" }}>
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(t.price)}
                        </p>
                      )}
                      <button className="btn btn-danger btn-sm" style={{ marginTop: "12px", width: "100%" }}
                        onClick={() => handleDeleteTattoo(t.id)} aria-label={`Remover ${t.label} do portfólio`}>
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ── Analytics ── */}
        {tab === "Analytics" && (
          <section aria-label="Análise de dados">
            {anaLoading ? (
              <div className="loading-center"><div className="spinner" role="status"><span className="sr-only">Carregando…</span></div></div>
            ) : (
              <>
                {summary && (
                  <div className="stats-row" aria-label="Resumo">
                    {[
                      { value: summary.total_requests, label: "Total de pedidos", color: "var(--gold)" },
                      { value: summary.by_status.pending, label: "Pendentes", color: "var(--pending)" },
                      { value: summary.by_status.approved, label: "Aprovados", color: "var(--success)" },
                      { value: summary.by_status.rejected, label: "Recusados", color: "var(--danger)" },
                      { value: summary.total_tattoos, label: "No portfólio", color: "var(--gold)" },
                    ].map((s) => (
                      <div key={s.label} className="stat-card">
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1rem", marginBottom: "20px", color: "var(--muted)" }}>Pedidos ao longo do tempo</h2>
                  {overTime.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Ainda sem dados suficientes.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={overTime}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                        <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="count" stroke="var(--gold)" strokeWidth={2}
                          dot={{ fill: "var(--gold)", r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="card" style={{ padding: "24px" }}>
                  <h2 style={{ fontSize: "1rem", marginBottom: "20px", color: "var(--muted)" }}>Contatos por tatuagem</h2>
                  {topTattoos.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Ainda sem dados suficientes.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topTattoos} layout="vertical">
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} width={120} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="total_requests" fill="var(--gold)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* ── Detalhe do pedido ── */}
      {selectedReq && (
        <div
          onClick={() => setSelectedReq(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px", animation: "fadeIn 0.2s ease",
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px",
              position: "relative", animation: "slideUp 0.25s ease",
            }}>
            <button
              onClick={() => setSelectedReq(null)}
              aria-label="Fechar"
              style={{
                position: "absolute", top: "16px", right: "16px",
                background: "none", border: "none", color: "var(--muted)",
                fontSize: "1.2rem", cursor: "pointer", lineHeight: 1,
              }}>
              ✕
            </button>

            {/* Cabeçalho */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
              <img
                src={selectedReq.tattoo.image_url}
                alt={selectedReq.tattoo.label}
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "10px", flexShrink: 0 }}
                onError={(e) => { e.target.src = "https://placehold.co/72x72/141414/c9a84c?text=T"; }}
              />
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "8px" }}>
                  {selectedReq.tattoo.label}
                </h2>
                <span className={`badge badge-${selectedReq.status}`}>
                  {STATUS_LABEL[selectedReq.status]}
                </span>
              </div>
            </div>

            <div className="divider" style={{ margin: "0 0 20px" }} />

            {/* Dados do cliente */}
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
              Cliente
            </p>
            <div style={{ background: "var(--bg3)", borderRadius: "10px", padding: "16px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Nome</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{selectedReq.client.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>E-mail</span>
                <a href={`mailto:${selectedReq.client.email}`} style={{ fontSize: "0.85rem", color: "var(--gold)" }}>
                  {selectedReq.client.email}
                </a>
              </div>
              {selectedReq.phone && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Telefone</span>
                  <a href={`tel:${selectedReq.phone}`} style={{ fontSize: "0.85rem", color: "var(--gold)" }}>
                    {selectedReq.phone}
                  </a>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Data</span>
                <span style={{ fontSize: "0.85rem" }}>
                  {new Date(selectedReq.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Mensagem */}
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
              Mensagem
            </p>
            <div style={{ background: "var(--bg3)", borderRadius: "10px", padding: "16px", marginBottom: "24px", minHeight: "80px" }}>
              {selectedReq.message ? (
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text)" }}>{selectedReq.message}</p>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>Nenhuma mensagem enviada.</p>
              )}
            </div>

            {/* Ações */}
            {selectedReq.status === "pending" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn btn-gold"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleStatusChange(selectedReq.id, "approved");
                    setSelectedReq({ ...selectedReq, status: "approved" });
                  }}
                  aria-label={`Aprovar pedido de ${selectedReq.client.name}`}>
                  Aprovar
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleStatusChange(selectedReq.id, "rejected");
                    setSelectedReq({ ...selectedReq, status: "rejected" });
                  }}
                  aria-label={`Recusar pedido de ${selectedReq.client.name}`}>
                  Recusar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}