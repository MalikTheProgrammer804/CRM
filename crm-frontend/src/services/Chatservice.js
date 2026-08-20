import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://crm-malik-tech.vercel.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  // List of people you've messaged, with last message + unread count
  conversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data.conversations;
  },

  // Full message thread with one specific user
  getMessages: async (userId) => {
    const response = await api.get(`/chat/${userId}`);
    return response.data.messages;
  },

  // Send a message to a specific user
  sendMessage: async (userId, text) => {
    const response = await api.post(`/chat/${userId}`, { text });
    return response.data.message;
  },

  // Mark all messages from that user as read
  markRead: async (userId) => {
    const response = await api.patch(`/chat/${userId}/read`);
    return response.data;
  },

  // Delete a message for me only (stays visible to the other person)
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  },
};

export default chatService;
