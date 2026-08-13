const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const workspaceMemberSchema = new mongoose.Schema(
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

    userId: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["member"],
      default: "member",
    },
  },
  {
    collection: "workspace_members",
    timestamps: true,
  }
);

// Same user cannot be added twice to same workspace
workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);
