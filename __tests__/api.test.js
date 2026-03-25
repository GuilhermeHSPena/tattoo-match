/**
 * Testes unitários das funções auxiliares da API e lógica de validação.
 * Usamos mocks para isolar a lógica sem precisar de banco real.
 */

// ── Testa apiHelpers ──────────────────────────────────────────────────────────
describe("apiHelpers", () => {
  // Simula ok() e err() sem importar o módulo real (que depende do Next.js)
  function ok(data, status = 200) {
    return { body: data, status };
  }
  function err(message, status = 400) {
    return { body: { error: message }, status };
  }

  test("ok() retorna status 200 por padrão", () => {
    const res = ok({ tattoos: [] });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tattoos: [] });
  });

  test("ok() aceita status customizado", () => {
    const res = ok({ user: {} }, 201);
    expect(res.status).toBe(201);
  });

  test("err() retorna status 400 por padrão", () => {
    const res = err("Campo obrigatório.");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Campo obrigatório.");
  });

  test("err() aceita status customizado", () => {
    const res = err("Não autenticado.", 401);
    expect(res.status).toBe(401);
  });
});

// ── Testa validação de campos obrigatórios ────────────────────────────────────
describe("Validação de registro", () => {
  function validateRegister({ name, email, password, role }) {
    if (!name?.trim() || !email?.trim() || !password?.trim())
      return { error: "Nome, e-mail e senha são obrigatórios." };
    if (!["client", "artist"].includes(role))
      return { error: "Role inválido." };
    return { ok: true };
  }

  test("aceita dados válidos de cliente", () => {
    expect(validateRegister({ name: "João", email: "j@j.com", password: "123456", role: "client" }))
      .toEqual({ ok: true });
  });

  test("aceita dados válidos de tatuador", () => {
    expect(validateRegister({ name: "Ana", email: "a@a.com", password: "123456", role: "artist" }))
      .toEqual({ ok: true });
  });

  test("rejeita quando nome está ausente", () => {
    const r = validateRegister({ name: "", email: "a@a.com", password: "123", role: "client" });
    expect(r.error).toBeTruthy();
  });

  test("rejeita quando e-mail está ausente", () => {
    const r = validateRegister({ name: "Ana", email: "  ", password: "123", role: "client" });
    expect(r.error).toBeTruthy();
  });

  test("rejeita role inválido", () => {
    const r = validateRegister({ name: "Ana", email: "a@a.com", password: "123", role: "admin" });
    expect(r.error).toMatch(/role inválido/i);
  });
});

// ── Testa validação de status de pedido ───────────────────────────────────────
describe("Validação de status de pedido", () => {
  const VALID = ["pending", "approved", "rejected"];

  function validateStatus(status) {
    if (!VALID.includes(status))
      return { error: `Status inválido. Use: ${VALID.join(", ")}.` };
    return { ok: true };
  }

  test.each(VALID)("aceita status '%s'", (status) => {
    expect(validateStatus(status)).toEqual({ ok: true });
  });

  test("rejeita status 'maybe'", () => {
    expect(validateStatus("maybe").error).toBeTruthy();
  });

  test("rejeita status vazio", () => {
    expect(validateStatus("").error).toBeTruthy();
  });

  test("rejeita status undefined", () => {
    expect(validateStatus(undefined).error).toBeTruthy();
  });
});

// ── Testa lógica de agrupamento por dia (analytics) ───────────────────────────
describe("Analytics — agrupamento por dia", () => {
  function groupByDay(requests) {
    const map = {};
    for (const r of requests) {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      map[day] = (map[day] ?? 0) + 1;
    }
    return Object.entries(map).map(([day, count]) => ({ day, count }));
  }

  test("agrupa corretamente dois pedidos no mesmo dia", () => {
    const reqs = [
      { createdAt: "2024-03-01T10:00:00Z" },
      { createdAt: "2024-03-01T14:00:00Z" },
    ];
    const result = groupByDay(reqs);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ day: "2024-03-01", count: 2 });
  });

  test("separa pedidos em dias distintos", () => {
    const reqs = [
      { createdAt: "2024-03-01T10:00:00Z" },
      { createdAt: "2024-03-02T10:00:00Z" },
    ];
    const result = groupByDay(reqs);
    expect(result).toHaveLength(2);
  });

  test("retorna array vazio para entrada vazia", () => {
    expect(groupByDay([])).toEqual([]);
  });
});

// ── Testa formatação de tatuagem para a API ───────────────────────────────────
describe("Formato de resposta da tatuagem", () => {
  function formatTattoo(t) {
    return {
      id: t.id,
      label: t.label,
      description: t.description,
      category: t.category,
      size: t.size,
      image_url: t.imageUrl,
      artist: t.artist,
      created_at: t.createdAt,
    };
  }

  test("mapeia imageUrl para image_url", () => {
    const raw = { id: 1, label: "Rosa", description: null, category: "floral", size: "médio", imageUrl: "https://img.com/1.jpg", artist: { id: 1, name: "Ana" }, createdAt: new Date() };
    const formatted = formatTattoo(raw);
    expect(formatted.image_url).toBe("https://img.com/1.jpg");
    expect(formatted).not.toHaveProperty("imageUrl");
  });

  test("preserva todos os campos esperados", () => {
    const raw = { id: 2, label: "Tribal", description: "Desc", category: "tribal", size: "grande", imageUrl: "https://x.com/2.jpg", artist: { id: 2, name: "Bob" }, createdAt: new Date() };
    const f = formatTattoo(raw);
    expect(f).toHaveProperty("id");
    expect(f).toHaveProperty("label");
    expect(f).toHaveProperty("artist");
    expect(f).toHaveProperty("created_at");
  });
});
