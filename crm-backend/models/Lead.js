const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const leadSchema = new mongoose.Schema(
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

    businessName: {
      type: String,
      required: true,
    },

    ownerName: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    website: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    facebook: {
      type: String,
      default: null,
    },

    instagram: {
      type: String,
      default: null,
    },

    linkedin: {
      type: String,
      default: null,
    },

    group: {
      type: String,
      default: null,
    },

    assignedTo: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      default: "New",
    },

    source: {
      type: String,
      default: "Google Maps",
    },

    googlePlaceId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    googleMapsLink: {
      type: String,
      default: null,
    },

    rating: {
      type: Number,
      default: null,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "leads",
    timestamps: true,
  }
);

// Every lead query in the app filters by workspaceId (multi-tenant
// isolation), and the main "All Leads" list sorts by createdAt — this
// compound index covers both in one shot instead of a full collection
// scan as the leads table grows.
leadSchema.index({ workspaceId: 1, createdAt: -1 });

// Speeds up the search/filter bar (AllLeads.jsx matches against these
// fields) and the assigned-to / status column filters.
leadSchema.index({ workspaceId: 1, status: 1 });
leadSchema.index({ workspaceId: 1, assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });

module.exports = mongoose.model("Lead", leadSchema);