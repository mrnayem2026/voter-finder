/**
 * API Client for Voter Finder Backend
 */

const API_BASE_URL = "http://localhost:4000/api";

async function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const authApi = {
  login: (credentials: any) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  getProfile: () => apiFetch("/auth/profile"),
};

export const voterApi = {
  search: (params: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    return apiFetch(`/voters?${query.toString()}`);
  },
  create: (data: any) =>
    apiFetch("/voters", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiFetch(`/voters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/voters/${id}`, {
      method: "DELETE",
    }),
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch("/voters/import/csv", {
      method: "POST",
      body: formData,
    });
  },
  exportCsv: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/voters/export/csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  },
};
