import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const leadDiscoveryService = {
  async search({ query, category, location }) {
    const { data } = await api.get("/lead-discovery/search", {
      params: { query, category, location },
    });
    return data.results;
  },

  async suggest(input) {
    const { data } = await api.get("/lead-discovery/suggest", {
      params: { input },
    });
    return data.suggestions;
  },
};

export default leadDiscoveryService;