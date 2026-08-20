const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      unique: true,
    },

    workspaceId: {
      type: String,
      required: true,
      index: true,
    },

    senderId: {
      type: String,
      required: true,
      index: true,
    },

    receiverId: {
      type: String,
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // "Delete for me" - like WhatsApp, deleting only hides the message
    // from the user who deleted it. The message stays in the database
    // and the other person still sees it, permanently, unless they
    // delete it too.
    deletedBy: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

// Fast lookup of a 1:1 thread between two users in a workspace
messageSchema.index({ workspaceId: 1, senderId: 1, receiverId: 1 });
messageSchema.index({ workspaceId: 1, receiverId: 1, senderId: 1 });

module.exports = mongoose.model("Message", messageSchema);
