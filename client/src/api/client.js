// Thin API client. All network access goes through here so the rest of
// the app deals in plain data, not fetch calls.

const BASE = "/api";

async function request(path, options) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getBoard: () => request("/board"),
  getUsers: () => request("/users"),
  getLabels: () => request("/labels"),
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (data) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  moveTask: (id, columnId, position) =>
    request(`/tasks/${id}/move`, {
      method: "POST",
      body: JSON.stringify({ columnId, position }),
    }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
