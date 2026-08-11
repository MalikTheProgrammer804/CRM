const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      unique: true,
    },

    workspaceId: {
      type: String,
      required: true,
    },

    leadId: {
      type: String,
      default: null,
    },

    createdById: {
      type: String,
      required: true,
    },

    assignedToId: {
      type: String,
      default: null,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "Call",
    },

    description: {
      type: String,
      default: null,
    },

    dueAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "Completed"],
      default: "Open",
    },

    reminderEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "tasks",
    timestamps: true,
  }
);

// Follow-ups page lists tasks per workspace sorted/filtered by due date
// and status - this covers those lookups without a full scan.
taskSchema.index({ workspaceId: 1, dueAt: 1 });
taskSchema.index({ workspaceId: 1, status: 1 });
taskSchema.index({ leadId: 1 });
taskSchema.index({ assignedToId: 1 });

module.exports = mongoose.model("Task", taskSchema);