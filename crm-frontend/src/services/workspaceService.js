import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://crm-malik-tech.vercel.app/api",
});


// ==========================================
// ATTACH JWT TOKEN
// ==========================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ==========================================
// WORKSPACE SERVICE
// ==========================================
export const workspaceService = {

  // Get workspace
  get: async () => {
    const response = await api.get("/workspace");
    return response.data;
  },


  // Update workspace
  update: async (payload) => {
    const response = await api.put(
      "/workspace",
      payload
    );

    return response.data;
  },


  // Get workspace members
  members: async () => {
    const response = await api.get(
      "/workspace/members"
    );

    return response.data;
  },


  // Give access to existing registered user
  giveAccess: async (email) => {
    const response = await api.post(
      "/workspace/members/access",
      {
        email,
      }
    );

    return response.data;
  },


  // Revoke workspace access
  revokeAccess: async (userId) => {
    const response = await api.delete(
      `/workspace/members/${userId}/access`
    );

    return response.data;
  },
};
