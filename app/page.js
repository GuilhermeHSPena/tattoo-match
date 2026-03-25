import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="container" style={{ textAlign: "center" }}>
            <p className="fade-up" style={{ fontSize: "0.8rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px" }}>
              Arte na pele
            </p>
            <h1 className="fade-up-d1" style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", marginBottom: "24px" }}>
              Encontre o tatuador <br />
              <em style={{ color: "var(--gold)" }}>ideal para você</em>
            </h1>
            <p className="fade-up-d2" style={{ fontSize: "1.1rem", color: "var(--muted)", maxWidth: "540px", margin: "0 auto 40px" }}>
              Explore portfólios, escolha seu estilo e conecte-se diretamente com
              tatuadores talentosos.
            </p>
            <div className="fade-up-d3" style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/gallery" className="btn btn-gold" aria-label="Explorar galeria de tatuagens">
                Explorar galeria
              </Link>
              <Link href="/register" className="btn btn-outline">
                Sou tatuador
              </Link>
            </div>
          </div>
        </section>

        <section style={{ padding: "80px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
              {[
                { icon: "🎨", title: "Portfólios reais", desc: "Veja o trabalho autêntico de cada tatuador antes de decidir." },
                { icon: "⚡", title: "Contato direto", desc: "Faça seu pedido e receba a confirmação diretamente do artista." },
                { icon: "🔒", title: "Seguro e simples", desc: "Cadastro rápido, sem complicação." },
              ].map((f) => (
                <div key={f.title} className="card" style={{ padding: "28px 24px" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "14px" }} aria-hidden="true">{f.icon}</div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 0", textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} Tattoo Match — Projeto acadêmico UNIVESP
        </p>
      </footer>
    </>
  );
}
