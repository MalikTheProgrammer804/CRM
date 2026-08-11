const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: null,
    },

    notificationPreferences: {
      emailAlerts: {
        type: Boolean,
        default: true,
      },

      desktopPush: {
        type: Boolean,
        default: true,
      },

      weeklySummary: {
        type: Boolean,
        default: false,
      },

      mobileSMS: {
        type: Boolean,
        default: false,
      },
    },

    interfacePreference: {
      type: String,
      enum: ["Light", "Dark"],
      default: "Light",
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "admin",
    },

    workspaceId: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

// Team page lists all users within a workspace.
userSchema.index({ workspaceId: 1 });

// Basic email format validation so junk data can't reach the DB
// (kept lenient on purpose - full RFC 5322 validation belongs at the
// controller/request-validation layer, not the schema).
userSchema.path("email").validate(function (value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}, "Please provide a valid email address.");

module.exports = mongoose.model("User", userSchema);