const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const workspaceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    timeZone: {
      type: String,
      default: "UTC",
    },

    currency: {
      type: String,
      default: "USD",
    },
  },
  {
    collection: "workspaces",
    timestamps: true,
  }
);

module.exports = mongoose.model("Workspace", workspaceSchema);