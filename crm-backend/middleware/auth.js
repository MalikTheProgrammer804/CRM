const { verifyToken } = require("../utils/token");

const {
  User,
  Workspace,
  WorkspaceMember,
} = require("../models");


// =====================================================
// AUTHENTICATION
// =====================================================
async function protect(req, res, next) {
  const authHeader =
    req.headers.authorization;

  // ------------------------------------------
  // Token required
  // ------------------------------------------
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message:
        "Not authorized. No token provided.",
    });
  }

  try {
    // ------------------------------------------
    // Get token
    // ------------------------------------------
    const token =
      authHeader.split(" ")[1];

    const decoded =
      verifyToken(token);

    // ------------------------------------------
    // Get current user
    // ------------------------------------------
    const user =
      await User.findOne({
        id: decoded.userId,
      }).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        message:
          "User no longer exists.",
      });
    }

    req.user = user;

    // =================================================
    // DETERMINE ACTIVE WORKSPACE
    // =================================================

    let workspaceId =
      decoded.workspaceId ||
      null;

    // ------------------------------------------
    // If token has no workspace,
    // use user's own workspace
    // ------------------------------------------
    if (!workspaceId && user.workspaceId) {
      workspaceId =
        user.workspaceId;
    }

    // ------------------------------------------
    // If still no workspace,
    // find membership
    // ------------------------------------------
    if (!workspaceId) {
      const membership =
        await WorkspaceMember.findOne({
          userId: user.id,
        })
          .sort({
            createdAt: 1,
          })
          .lean();

      if (membership) {
        workspaceId =
          membership.workspaceId;
      }
    }

    // ------------------------------------------
    // Verify workspace actually exists
    // ------------------------------------------
    let workspace = null;

    if (workspaceId) {
      workspace =
        await Workspace.findOne({
          id: workspaceId,
        }).lean();
    }

    // ------------------------------------------
    // Workspace doesn't exist
    // ------------------------------------------
    if (!workspace) {
      return res.status(403).json({
        message:
          "No valid workspace is assigned to this account.",
      });
    }

    // =================================================
    // VERIFY USER HAS ACCESS TO ACTIVE WORKSPACE
    // =================================================

    const isOwner =
      workspace.ownerId ===
      user.id;

    let membership = null;

    if (!isOwner) {
      membership =
        await WorkspaceMember.findOne({
          workspaceId:
            workspace.id,

          userId:
            user.id,
        }).lean();

      // ------------------------------------------
      // User is neither owner nor member
      // ------------------------------------------
      if (!membership) {
        return res.status(403).json({
          message:
            "You do not have access to this workspace.",
        });
      }
    }

    // =================================================
    // SET REQUEST WORKSPACE DATA
    // =================================================

    req.workspaceId =
      workspace.id;

    req.workspace =
      workspace;

    // ------------------------------------------
    // Actual role inside ACTIVE workspace
    // ------------------------------------------
    req.role = isOwner
      ? "admin"
      : membership?.role || "member";

    req.workspaceRole =
      req.role;

    // ------------------------------------------
    // Continue
    // ------------------------------------------
    next();

  } catch (err) {
    console.error(
      "Authentication error:",
      err.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
}


// =====================================================
// ADMIN ONLY
// =====================================================
async function requireAdmin(
  req,
  res,
  next
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Not authorized.",
      });
    }

    if (!req.workspace) {
      return res.status(403).json({
        message:
          "No active workspace selected.",
      });
    }

    // ------------------------------------------
    // IMPORTANT:
    // Admin means OWNER OF THIS WORKSPACE
    // ------------------------------------------
    if (
      req.workspace.ownerId !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "Only the workspace admin can perform this action.",
      });
    }

    // ------------------------------------------
    // Set role
    // ------------------------------------------
    req.role = "admin";

    req.workspaceRole =
      "admin";

    next();

  } catch (error) {
    console.error(
      "Admin authorization error:",
      error.message
    );

    return res.status(403).json({
      message:
        "Admin authorization failed.",
    });
  }
}


// =====================================================
// EXPORT
// =====================================================
module.exports = protect;

module.exports.requireAdmin =
  requireAdmin;
