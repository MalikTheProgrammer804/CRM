const { verifyToken } = require("../utils/token");
const {
  User,
  WorkspaceMember,
} = require("../models");


/**
 * AUTHENTICATION
 */
async function protect(req, res, next) {
  const authHeader =
    req.headers.authorization;

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
    const token =
      authHeader.split(" ")[1];

    const decoded =
      verifyToken(token);

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

    // ------------------------------------------
    // Workspace from token / user's own workspace
    // ------------------------------------------
    let workspaceId =
      decoded.workspaceId ||
      user.workspaceId ||
      null;


    // ------------------------------------------
    // If user doesn't own a workspace,
    // check WorkspaceMember collection
    // ------------------------------------------
    if (!workspaceId) {
      const membership =
        await WorkspaceMember.findOne({
          userId: user.id,
        }).sort({
          createdAt: 1,
        });

      if (membership) {
        workspaceId =
          membership.workspaceId;
      }
    }


    req.workspaceId =
      workspaceId;

    req.role =
      decoded.role ||
      user.role;

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


/**
 * ADMIN ONLY
 */
function requireAdmin(
  req,
  res,
  next
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  if (
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      message:
        "Only workspace admin can perform this action.",
    });
  }

  next();
}


module.exports = protect;
module.exports.requireAdmin =
  requireAdmin;
