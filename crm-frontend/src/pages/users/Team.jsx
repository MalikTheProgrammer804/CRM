import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  MoreVertical,
  X,
  UserRound,
  Users,
  MessageCircle,
} from "lucide-react";

import { workspaceService } from "../../services/workspaceService";
import chatService from "../../services/Chatservice";
import authService from "../../services/authService";
import ChatWindow from "../../components/Chatwindow";

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [meId, setMeId] = useState(null);
  const [chatMember, setChatMember] = useState(null);
  const [unreadByUser, setUnreadByUser] = useState({});

  // ==========================================
  // LOAD MEMBERS
  // ==========================================
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await workspaceService.members();

      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load members error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load workspace members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();

    authService.me().then((u) => setMeId(u.id)).catch(() => {});

    chatService
      .conversations()
      .then((conversations) => {
        const map = {};
        conversations.forEach((c) => {
          map[c.otherUserId] = c.unreadCount;
        });
        setUnreadByUser(map);
      })
      .catch(() => {});
  }, []);

  const openChat = (member) => {
    setChatMember(member);
    setUnreadByUser((prev) => ({ ...prev, [member.id]: 0 }));
  };

  // ==========================================
  // FILTER MEMBERS
  // ==========================================
  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        (member.fullName || "")
          .toLowerCase()
          .includes(query) ||
        (member.email || "")
          .toLowerCase()
          .includes(query);

      const role =
        member.teamRole ||
        member.role ||
        "member";

      const matchesRole =
        roleFilter === "All" ||
        role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  // ==========================================
  // INITIALS
  // ==========================================
  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return parts[0][0].toUpperCase();
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // ==========================================
  // GIVE ACCESS
  // ==========================================
  const handleGiveAccess = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter an email address.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      const response =
        await workspaceService.giveAccess(cleanEmail);

      setSuccess(
        response?.message ||
          "Access granted successfully."
      );

      setEmail("");
      setShowAccessModal(false);

      await loadMembers();
    } catch (err) {
      console.error("Give access error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to give workspace access."
      );
    } finally {
      setAdding(false);
    }
  };

  // ==========================================
  // REVOKE ACCESS
  // ==========================================
  const handleRevokeAccess = async (
    userId,
    userName
  ) => {
    const confirmed = window.confirm(
      `Remove ${
        userName || "this user"
      } from your workspace?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(userId);
      setError("");
      setSuccess("");

      const response =
        await workspaceService.revokeAccess(userId);

      setSuccess(
        response?.message ||
          "Workspace access revoked."
      );

      await loadMembers();
    } catch (err) {
      console.error("Revoke access error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to revoke workspace access."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-full space-y-6 pb-10">

      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT SIDE */}
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="crm-page-title text-2xl font-bold text-[#12345b]">
              User & Team Management
            </h1>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {members.length}{" "}
              {members.length === 1
                ? "member"
                : "members"}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage who has access to your workspace.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative z-10 flex items-center gap-3">

          {/* SEARCH */}
          <div className="relative w-64">

            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200/70
                bg-transparent
                px-3
                pl-10
                text-sm
                text-[red] 
                placeholder-slate-400
                outline-none
                shadow-none
                transition
                focus:border-[#0e8e86]
                focus:bg-transparent
                focus:ring-2
                focus:ring-[#0e8e86]/10
              "
            />
          </div>

          {/* GIVE ACCESS */}
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setEmail("");
              setShowAccessModal(true);
            }}
            className="
              inline-flex
              h-11
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#0e8e86]
              bg-transparent
              px-5
              text-sm
              font-bold
              text-black
              shadow-sm
              transition
              hover:bg-[#0a756f]
              active:scale-[0.98]
            "
          >
            <UserPlus size={18} />
            Give Access
          </button>
        </div>
      </div>

      {/* ==========================================
          ALERTS
      ========================================== */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="rounded p-1 hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ==========================================
          FILTER BAR
      ========================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">

        <div className="flex items-center gap-3">

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="
              h-10
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-xs
              font-bold
              text-slate-700
              shadow-sm
              outline-none
              focus:border-[#0e8e86]
            "
          >
            <option value="All">
              Role: All
            </option>

            <option value="admin">
              Role: Admin
            </option>

            <option value="member">
              Role: Team Member
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users size={15} />

          <span>
            Showing{" "}
            <strong className="text-slate-600">
              {filteredMembers.length}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-600">
              {members.length}
            </strong>
          </span>
        </div>
      </div>

      {/* ==========================================
          TABLE
      ========================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left text-sm">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">

                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4 text-center">
                  Role
                </th>

                <th className="px-5 py-4 text-center">
                  Assigned Leads
                </th>

                <th className="px-5 py-4 text-center">
                  Converted
                </th>

                <th className="px-5 py-4 text-center">
                  Status
                </th>

                <th className="px-5 py-4">
                  Date Joined
                </th>

                <th className="w-12 px-3 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-14 text-center"
                  >
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#0e8e86] border-t-transparent" />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading team members...
                    </p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (

                /* EMPTY */
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-14 text-center"
                  >
                    <UserRound
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No team members found.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Give access to a registered
                      user to add them here.
                    </p>
                  </td>
                </tr>

              ) : (

                /* MEMBERS */
                filteredMembers.map((member) => {

                  const role =
                    member.teamRole ||
                    member.role ||
                    "member";

                  const isAdmin =
                    role.toLowerCase() === "admin";

                  const isRemoving =
                    removingId === member.id;

                  return (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >

                      {/* USER */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0e8e86] text-xs font-bold text-white">
                              {getInitials(
                                member.fullName
                              )}
                            </div>
                          )}

                          <div className="min-w-0">

                            <p className="truncate font-bold text-[blue]">
                              {member.fullName ||
                                "Unknown User"}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {member.email}
                            </p>

                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4 text-center">

                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0e8e86] px-3 py-1 text-[11px] font-bold text-white">
                            <ShieldCheck size={13} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600">
                            Team Member
                          </span>
                        )}

                      </td>

                      {/* ASSIGNED LEADS */}
                      <td className="px-5 py-4 text-center font-bold text-[#12345b]">
                        {member.assignedLeads ?? "—"}
                      </td>

                      {/* CONVERTED */}
                      <td className="px-5 py-4 text-center font-bold text-[#00A389]">
                        {member.conversionRate
                          ? `${member.conversionRate}%`
                          : "—"}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          Active
                        </span>

                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 font-medium text-slate-500">
                        {formatDate(member.createdAt)}
                      </td>

                      {/* ACTION */}
                      <td className="px-3 py-4">

                        <div className="flex items-center justify-center gap-1.5">

                          {/* CHAT */}
                          {member.id !== meId && (
                            <button
                              type="button"
                              onClick={() => openChat(member)}
                              className="relative rounded-lg p-2 text-slate-400 transition hover:bg-[#0e8e86]/10 hover:text-[#0e8e86]"
                              title={`Chat with ${member.fullName || "this user"}`}
                            >
                              <MessageCircle size={17} />
                              {!!unreadByUser[member.id] && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                  {unreadByUser[member.id] > 9 ? "9+" : unreadByUser[member.id]}
                                </span>
                              )}
                            </button>
                          )}

                        {!isAdmin && (
                          <div className="group relative inline-block">

                            <button
                              type="button"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreVertical size={17} />
                            </button>

                            <div className="
                              invisible
                              absolute
                              right-0
                              top-full
                              z-30
                              mt-1
                              w-40
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              p-1
                              text-left
                              shadow-lg
                              opacity-0
                              transition
                              group-hover:visible
                              group-hover:opacity-100
                            ">

                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() =>
                                  handleRevokeAccess(
                                    member.id,
                                    member.fullName
                                  )
                                }
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {isRemoving
                                  ? "Removing..."
                                  : "Revoke Access"}
                              </button>

                            </div>
                          </div>
                        )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}
        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <span>
            Showing{" "}
            <strong className="text-slate-700">
              {filteredMembers.length}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-700">
              {members.length}
            </strong>{" "}
            members
          </span>

          <span className="font-medium text-slate-400">
            Workspace access is managed by admins.
          </span>

        </div>
      </div>

      {/* ==========================================
          GIVE ACCESS MODAL
      ========================================== */}
      {showAccessModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setShowAccessModal(false)
          }
        >

          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="mb-6 flex items-start justify-between">

              <div>

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0e8e86]/10 text-[#0e8e86]">
                  <UserPlus size={21} />
                </div>

                <h2 className="text-xl font-bold text-[#12345b]">
                  Give Workspace Access
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Enter the email of an existing
                  Wessmaa account.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAccessModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={handleGiveAccess}>

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Registered User Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="user@example.com"
                autoFocus
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#0e8e86]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#0e8e86]/10
                "
              />

              <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                Only users who already have a
                registered Wessmaa account can be
                given workspace access.
              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowAccessModal(false)
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    adding ||
                    !email.trim()
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#0e8e86]
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-[#0a756f]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <UserPlus size={17} />

                  {adding
                    ? "Giving Access..."
                    : "Give Access"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {chatMember && (
        <ChatWindow member={chatMember} onClose={() => setChatMember(null)} />
      )}
    </div>
  );
}
