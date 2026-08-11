import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const taskService = {
  list: async () => (await api.get("/tasks")).data,
  create: async (payload) => (await api.post("/tasks", payload)).data,
  update: async (id, payload) => (await api.put(`/tasks/${id}`, payload)).data,
  remove: async (id) => api.delete(`/tasks/${id}`),
};
