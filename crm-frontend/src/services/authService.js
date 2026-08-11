import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  async login({ email, password, rememberMe }) {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      rememberMe,
    });
    return data; // { token, user }
  },

  async signup(payload) {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  },

  // Backend generates a new random password and emails it directly to the user
  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  // Called from the Verify Email page (token comes from the emailed verification link)
  async verifyEmail(token) {
    const { data } = await api.post("/auth/verify-email", { token });
    return data;
  },

  // "Resend verification email" button on the Verify Email page
  async resendVerification(email) {
    const { data } = await api.post("/auth/resend-verification", { email });
    return data;
  },

  async logout() {
    localStorage.removeItem("token");
  },
  async me() { return (await api.get("/auth/me")).data.user; },
  async updateProfile(payload) { return (await api.put("/auth/me", payload)).data; },
};

export default authService;