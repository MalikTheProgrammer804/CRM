const { Message, User, WorkspaceMember } = require("../models");

// Verifies the other user is a real member of the same workspace before
// letting anyone message them (prevents messaging outside your workspace).
async function assertSameWorkspace(workspaceId, workspace, otherUserId, meId) {
  if (otherUserId === meId) {
    const err = new Error("You can't message yourself.");
    err.statusCode = 400;
    throw err;
  }

  const otherUser = await User.findOne({ id: otherUserId }).lean();
  if (!otherUser) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = workspace.ownerId === otherUserId;
  if (!isOwner) {
    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: otherUserId,
    }).lean();
    if (!membership) {
      const err = new Error("That user is not a member of your workspace.");
      err.statusCode = 403;
      throw err;
    }
  }

  return otherUser;
}

// GET /api/chat/conversations
// List of workspace members with last message + unread count, for a chat list UI.
async function getConversations(req, res, next) {
  try {
    const meId = req.user.id;
    const { workspaceId } = req;

    const messages = await Message.find({
      workspaceId,
      $or: [{ senderId: meId }, { receiverId: meId }],
      deletedBy: { $ne: meId },
    })
      .sort({ createdAt: -1 })
      .lean();

    const byUser = new Map();
    for (const m of messages) {
      const otherId = m.senderId === meId ? m.receiverId : m.senderId;
      if (!byUser.has(otherId)) {
        byUser.set(otherId, {
          otherUserId: otherId,
          lastMessage: m.text,
          lastMessageAt: m.createdAt,
          unreadCount: 0,
        });
      }
      if (m.receiverId === meId && !m.readAt) {
        byUser.get(otherId).unreadCount += 1;
      }
    }

    return res.status(200).json({ conversations: Array.from(byUser.values()) });
  } catch (err) {
    next(err);
  }
}

// GET /api/chat/:userId
// Full message thread with one specific user.
async function getMessages(req, res, next) {
  try {
    const meId = req.user.id;
    const otherUserId = req.params.userId;
    const { workspaceId, workspace } = req;

    await assertSameWorkspace(workspaceId, workspace, otherUserId, meId);

    const messages = await Message.find({
      workspaceId,
      $or: [
        { senderId: meId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: meId },
      ],
      deletedBy: { $ne: meId },
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
}

// POST /api/chat/:userId
// Send a message to a specific user.
async function sendMessage(req, res, next) {
  try {
    const meId = req.user.id;
    const otherUserId = req.params.userId;
    const { workspaceId, workspace } = req;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required." });
    }

    await assertSameWorkspace(workspaceId, workspace, otherUserId, meId);

    const message = await Message.create({
      workspaceId,
      senderId: meId,
      receiverId: otherUserId,
      text: text.trim(),
    });

    return res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/chat/:userId/read
// Mark every message FROM that user TO me as read.
async function markRead(req, res, next) {
  try {
    const meId = req.user.id;
    const otherUserId = req.params.userId;
    const { workspaceId } = req;

    await Message.updateMany(
      { workspaceId, senderId: otherUserId, receiverId: meId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return res.status(200).json({ message: "Marked as read." });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/chat/message/:messageId
// "Delete for me" - the message stays in the DB and visible to the other
// person; it's only hidden from the person who deleted it.
async function deleteMessage(req, res, next) {
  try {
    const meId = req.user.id;
    const { messageId } = req.params;
    const { workspaceId } = req;

    const message = await Message.findOne({ id: messageId, workspaceId });
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (message.senderId !== meId && message.receiverId !== meId) {
      return res.status(403).json({ message: "You can't delete this message." });
    }

    if (!message.deletedBy.includes(meId)) {
      message.deletedBy.push(meId);
      await message.save();
    }

    return res.status(200).json({ message: "Message deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversations, getMessages, sendMessage, markRead, deleteMessage };
