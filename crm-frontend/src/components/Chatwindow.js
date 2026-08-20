import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import chatService from "../../services/Chatservice";
import authService from "../../services/authService";

const POLL_INTERVAL_MS = 4000;

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// 1:1 chat panel. Messages are permanent (like WhatsApp) - "delete" only
// hides a message for the person who deleted it, the DB copy stays.
export default function ChatWindow({ member, onClose }) {
  const { isDark } = useTheme();
  const [meId, setMeId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!member) return;
    try {
      const data = await chatService.getMessages(member.id);
      setMessages(data);
      chatService.markRead(member.id).catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't load messages.");
    } finally {
      setLoading(false);
    }
  }, [member]);

  useEffect(() => {
    authService.me().then((u) => setMeId(u.id)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!member) return;
    setLoading(true);
    loadMessages();

    pollRef.current = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [member, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !member) return;

    setSending(true);
    setText("");
    try {
      const newMessage = await chatService.sendMessage(member.id, trimmed);
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't send message.");
      setText(trimmed); // give it back so they don't lose what they typed
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      // silently ignore - not critical if a delete click fails
    }
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative flex h-full w-full max-w-md flex-col shadow-2xl transition-colors ${
          isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-3">
            {member.avatar ? (
              <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0e8e86] text-xs font-bold text-white">
                {getInitials(member.fullName)}
              </div>
            )}
            <div>
              <p className="font-bold">{member.fullName || "Unknown User"}</p>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{member.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-2 transition ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0e8e86] border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <p className={`text-center text-sm mt-10 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              No messages yet. Say hello to {member.fullName?.split(" ")[0] || "them"}!
            </p>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === meId;
              return (
                <div key={m.id} className={`group flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-1.5 max-w-[75%]">
                    {isMine && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className={`opacity-0 group-hover:opacity-100 transition p-1 ${isDark ? "text-slate-500 hover:text-red-400" : "text-slate-300 hover:text-red-500"}`}
                        title="Delete for me"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? "bg-[#0e8e86] text-white rounded-br-sm"
                          : isDark
                            ? "bg-slate-800 text-slate-100 rounded-bl-sm"
                            : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={`mt-1 text-[10px] ${isMine ? "text-teal-100" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="px-4 pb-2">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className={`flex items-center gap-2 border-t p-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:border-[#0e8e86]"
                : "border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:border-[#0e8e86]"
            }`}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e8e86] text-white transition hover:bg-[#0a756f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
