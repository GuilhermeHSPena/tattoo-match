"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/apiClient";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CATEGORIES   = ["Todos", "tradicional", "geométrico", "tribal", "realismo", "aquarela", "minimalista", "oriental"];
const SIZES        = ["Todos", "pequeno", "médio", "grande"];
const PRICE_RANGES = [
  { label: "Todos",             value: "" },
  { label: "Até R$300",         value: "0-300" },
  { label: "R$300 – R$600",     value: "300-600" },
  { label: "R$600 – R$1.000",   value: "600-1000" },
  { label: "R$1.000 – R$2.000", value: "1000-2000" },
  { label: "Acima de R$2.000",  value: "2000+" },
];

function formatPrice(price) {
  if (!price) return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export default function GalleryPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tattoos,    setTattoos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState("Todos");
  const [size,       setSize]       = useState("Todos");
  const [priceRange, setPriceRange] = useState("");
  const [selected,   setSelected]   = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [reqForm,    setReqForm]    = useState({ phone: "", message: "" });
  const [reqStatus,  setReqStatus]  = useState(null);
  const [zoomImg,    setZoomImg]    = useState(null);

  useEffect(() => { fetchTattoos(); }, [category, size, priceRange]);

  // Fecha lightbox com ESC
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setZoomImg(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function fetchTattoos() {
    setLoading(true);
    try {
      const params = {};
      if (category   !== "Todos") params.category    = category;
      if (size       !== "Todos") params.size        = size;
      if (priceRange !== "")      params.price_range = priceRange;
      const data = await api.tattoos.list(params);
      setTattoos(data.tattoos);
    } catch { setTattoos([]); }
    finally { setLoading(false); }
  }

  function openModal(tattoo) {
    setSelected(tattoo);
    setReqForm({ phone: "", message: "" });
    setReqStatus(null);
  }

  function closeModal() { setSelected(null); setReqStatus(null); }

  async function handleRequest(e) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    setRequesting(true);
    try {
      await api.requests.create({ tattoo_id: selected.id, ...reqForm });
      setReqStatus({ ok: true, msg: "Mensagem enviada! O tatuador entrará em contato em breve." });
    } catch (err) {
      setReqStatus({ ok: false, msg: err.message ?? "Erro ao enviar mensagem." });
    } finally { setRequesting(false); }
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="hero" style={{ padding: "60px 0 20px" }}>
          <div className="container">
            <h1 className="fade-up" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "12px" }}>Galeria</h1>
            <p className="fade-up-d1" style={{ color: "var(--muted)" }}>
              {tattoos.length} trabalho{tattoos.length !== 1 ? "s" : ""} disponível{tattoos.length !== 1 ? "is" : ""}
            </p>
          </div>
        </div>

        <div className="container">
          <section aria-label="Filtros">
            <p className="form-label" style={{ marginBottom: "10px" }}>Estilo</p>
            <div className="filters" role="group" aria-label="Filtrar por estilo">
              {CATEGORIES.map((c) => (
                <button key={c} className={`filter-btn ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)} aria-pressed={category === c}>{c}</button>
              ))}
            </div>

            <p className="form-label" style={{ marginBottom: "10px", marginTop: "16px" }}>Tamanho</p>
            <div className="filters" role="group" aria-label="Filtrar por tamanho">
              {SIZES.map((s) => (
                <button key={s} className={`filter-btn ${size === s ? "active" : ""}`}
                  onClick={() => setSize(s)} aria-pressed={size === s}>{s}</button>
              ))}
            </div>

            <p className="form-label" style={{ marginBottom: "10px", marginTop: "16px" }}>Faixa de preço</p>
            <div className="filters" role="group" aria-label="Filtrar por faixa de preço">
              {PRICE_RANGES.map((p) => (
                <button key={p.value} className={`filter-btn ${priceRange === p.value ? "active" : ""}`}
                  onClick={() => setPriceRange(p.value)} aria-pressed={priceRange === p.value}>{p.label}</button>
              ))}
            </div>
          </section>

          {loading ? (
            <div className="loading-center" aria-live="polite" aria-busy="true">
              <div className="spinner" role="status"><span className="sr-only">Carregando…</span></div>
            </div>
          ) : tattoos.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "80px 0" }}>
              Nenhuma tatuagem encontrada com esses filtros.
            </p>
          ) : (
            <ul className="tattoo-grid" style={{ listStyle: "none" }}>
              {tattoos.map((t, i) => (
                <li key={t.id} className={`card tattoo-card fade-up-d${Math.min(i % 3 + 1, 3)}`}
                  onClick={() => openModal(t)} role="button" tabIndex={0}
                  aria-label={`Ver detalhes de ${t.label}`}
                  onKeyDown={(e) => e.key === "Enter" && openModal(t)}>
                  <div style={{ overflow: "hidden" }}>
                    <img src={t.image_url} alt={t.label} className="tattoo-card-img" loading="lazy"
                      onError={(e) => { e.target.src = "https://placehold.co/400x300/141414/c9a84c?text=Tattoo"; }} />
                  </div>
                  <div className="tattoo-card-body">
                    <p className="tattoo-card-label">{t.label}</p>
                    <div className="tattoo-card-meta">
                      {t.category && <span>{t.category}</span>}
                      {t.size && <span>· {t.size}</span>}
                      <span>· {t.artist.name}</span>
                      {t.artist.city && <span>· 📍 {t.artist.city}</span>}
                    </div>
                    {t.price && (
                      <p style={{ color: "var(--gold)", fontWeight: 500, fontSize: "0.95rem", marginTop: "8px" }}>
                        {formatPrice(t.price)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      {selected && (
        <div className="modal-backdrop" role="dialog" aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: "520px" }}>
            <button className="modal-close" onClick={closeModal} aria-label="Fechar modal">✕</button>

            {/* Imagem com zoom */}
            <div
              style={{ margin: "-32px -32px 24px", overflow: "hidden", borderRadius: "16px 16px 0 0", cursor: "zoom-in" }}
              onClick={(e) => { e.stopPropagation(); setZoomImg(selected.image_url); }}
              title="Clique para ampliar">
              <img
                src={selected.image_url}
                alt={selected.label}
                style={{ width: "100%", height: "240px", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                onError={(e) => { e.target.src = "https://placehold.co/520x240/141414/c9a84c?text=Tattoo"; }}
              />
            </div>

            {/* Título e preço */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
              <h2 id="modal-title" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
                {selected.label}
              </h2>
              {selected.price && (
                <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "1.1rem", whiteSpace: "nowrap" }}>
                  {formatPrice(selected.price)}
                </span>
              )}
            </div>

            {/* Infos do tatuador */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Por <strong style={{ color: "var(--text)" }}>{selected.artist.name}</strong>
              </span>
              {selected.category && <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>· {selected.category}</span>}
              {selected.size     && <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>· {selected.size}</span>}
              {selected.artist.city && (
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>· 📍 {selected.artist.city}</span>
              )}
              {selected.artist.instagram && (
                <a href={`https://instagram.com/${selected.artist.instagram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.85rem", color: "var(--gold)" }}
                  aria-label={`Instagram de ${selected.artist.name}`}>
                  · {selected.artist.instagram.startsWith("@") ? selected.artist.instagram : `@${selected.artist.instagram}`}
                </a>
              )}
            </div>

            {selected.description && (
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "20px", lineHeight: "1.6" }}>
                {selected.description}
              </p>
            )}

            <div className="divider" />

            {reqStatus?.ok ? (
              <p className="success-msg" role="status">{reqStatus.msg}</p>
            ) : (
              <form onSubmit={handleRequest} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "1rem" }}>Entrar em contato</h3>
                {!session && (
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    Você precisa estar logado para entrar em contato.
                  </p>
                )}
                <div className="form-group">
                  <label htmlFor="req-phone" className="form-label">Telefone (opcional)</label>
                  <input id="req-phone" type="tel" className="input" placeholder="(11) 99999-9999"
                    value={reqForm.phone} onChange={(e) => setReqForm({ ...reqForm, phone: e.target.value })}
                    autoComplete="tel" />
                </div>
                <div className="form-group">
                  <label htmlFor="req-message" className="form-label">Mensagem</label>
                  <textarea id="req-message" className="input"
                    placeholder={`Olá! Vi seu trabalho "${selected.label}" e tenho interesse em uma tatuagem com este estilo. Poderia me passar mais informações?`}
                    value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })}
                    rows={4} style={{ resize: "vertical" }} />
                </div>
                {reqStatus?.ok === false && <p className="error-msg" role="alert">{reqStatus.msg}</p>}
                <button type="submit" className="btn btn-gold" disabled={requesting} aria-busy={requesting}>
                  {!session ? "Entrar para contato" : requesting ? "Enviando…" : "Enviar mensagem"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px", cursor: "zoom-out",
            animation: "fadeIn 0.2s ease",
          }}>
          <button
            onClick={() => setZoomImg(null)}
            aria-label="Fechar zoom"
            style={{
              position: "absolute", top: "20px", right: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", borderRadius: "50%",
              width: "44px", height: "44px",
              fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
            ✕
          </button>
          <img
            src={zoomImg}
            alt="Imagem ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "90vh",
              objectFit: "contain", borderRadius: "12px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              animation: "scaleIn 0.25s ease",
              cursor: "default",
            }}
            onError={(e) => { e.target.src = "https://placehold.co/800x600/141414/c9a84c?text=Tattoo"; }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}