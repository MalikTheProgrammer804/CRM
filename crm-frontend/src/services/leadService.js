import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const leadService = {
  async getLeads(params = {}) {
    const { data } = await api.get("/leads", { params });
    return data;
  },

  async getLead(id) {
    const { data } = await api.get(`/leads/${id}`);
    return data;
  },

  async createLead(payload) {
    const { data } = await api.post("/leads", payload);
    return data;
  },

  async updateLead(id, payload) {
    const { data } = await api.put(`/leads/${id}`, payload);
    return data;
  },

  async deleteLead(id) {
    const { data } = await api.delete(`/leads/${id}`);
    return data;
  },

  async addNote(id, note) {
    const { data } = await api.post(`/leads/${id}/notes`, {
      note,
    });
    return data;
  },

  // EXPORT LEADS
  async exportLeads(params = {}) {
    const response = await api.get("/leads/export", {
      params,
      responseType: "blob",
    });

    return response.data;
  },
};

export default leadService;