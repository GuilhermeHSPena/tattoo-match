async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.error ?? "Erro desconhecido" };
  return data;
}

export const api = {
  auth: {
    register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  },
  tattoos: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/api/tattoos${qs ? "?" + qs : ""}`);
    },
    create: (body) => request("/api/tattoos", { method: "POST", body: JSON.stringify(body) }),
    delete: (id) => request(`/api/tattoos/${id}`, { method: "DELETE" }),
  },
  requests: {
    create: (body) => request("/api/requests", { method: "POST", body: JSON.stringify(body) }),
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/api/requests${qs ? "?" + qs : ""}`);
    },
    updateStatus: (id, status) =>
      request(`/api/requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },
  analytics: {
    summary:   () => request("/api/analytics/summary"),
    overTime:  () => request("/api/analytics/over-time"),
    topTattoos:() => request("/api/analytics/top-tattoos"),
  },
};