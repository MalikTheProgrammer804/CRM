const {
  Workspace,
  User,
  WorkspaceMember,
} = require("../models");


// =====================================================
// GET WORKSPACE
// =====================================================
exports.get = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    if (!workspaceId) {
      return res.status(404).json({
        message: "No workspace selected.",
      });
    }

    const workspace = await Workspace.findOne({
      id: workspaceId,
    }).lean();

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found.",
      });
    }

    return res.json(workspace);
  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE WORKSPACE
// =====================================================
exports.update = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    const workspace = await Workspace.findOne({
      id: workspaceId,
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found.",
      });
    }

    // ------------------------------------------
    // Only workspace owner/admin can update
    // ------------------------------------------
    if (workspace.ownerId !== req.user.id) {
      return res.status(403).json({
        message:
          "Only the workspace admin can update this workspace.",
      });
    }

    const updates = {
      companyName:
        req.body.companyName ??
        workspace.companyName,

      logoUrl:
        req.body.logoUrl ??
        workspace.logoUrl,

      timeZone:
        req.body.timeZone ??
        workspace.timeZone,

      currency:
        req.body.currency ??
        workspace.currency,

      pipelineStages:
        req.body.pipelineStages ??
        workspace.pipelineStages,

      leadScoring:
        req.body.leadScoring ??
        workspace.leadScoring,

      automatedFollowups:
        req.body.automatedFollowups ??
        workspace.automatedFollowups,

      leadSourceTags:
        req.body.leadSourceTags ??
        workspace.leadSourceTags,
    };

    Object.assign(workspace, updates);

    await workspace.save();

    return res.json(workspace);
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET CURRENT WORKSPACE TEAM MEMBERS
// =====================================================
exports.members = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    if (!workspaceId) {
      return res.status(404).json({
        message: "No workspace selected.",
      });
    }

    // ------------------------------------------
    // Get active workspace
    // ------------------------------------------
    const workspace = await Workspace.findOne({
      id: workspaceId,
    }).lean();

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found.",
      });
    }

    // ------------------------------------------
    // Get actual workspace owner/admin
    // IMPORTANT:
    // ownerId is the source of truth
    // ------------------------------------------
    const owner = await User.findOne({
      id: workspace.ownerId,
    })
      .select("-passwordHash")
      .lean();

    const result = [];

    // ------------------------------------------
    // Add workspace admin FIRST
    // ------------------------------------------
    if (owner) {
      result.push({
        ...owner,

        teamRole: "admin",

        membershipId: null,

        accessType: "owner",

        workspaceId: workspace.id,

        workspaceName:
          workspace.companyName,
      });
    }

    // ------------------------------------------
    // Get all members of CURRENT workspace
    // ------------------------------------------
    const memberships =
      await WorkspaceMember.find({
        workspaceId,
      })
        .sort({ createdAt: 1 })
        .lean();

    // ------------------------------------------
    // Get member user IDs
    // ------------------------------------------
    const memberUserIds =
      memberships.map(
        (membership) =>
          membership.userId
      );

    // ------------------------------------------
    // Get users
    // ------------------------------------------
    const memberUsers =
      memberUserIds.length > 0
        ? await User.find({
            id: {
              $in: memberUserIds,
            },
          })
            .select("-passwordHash")
            .lean()
        : [];

    // ------------------------------------------
    // Add team members
    // ------------------------------------------
    for (const membership of memberships) {
      const user = memberUsers.find(
        (item) =>
          item.id ===
          membership.userId
      );

      if (!user) {
        continue;
      }

      // ------------------------------------------
      // Don't show owner twice
      // ------------------------------------------
      if (
        workspace.ownerId ===
        user.id
      ) {
        continue;
      }

      result.push({
        ...user,

        teamRole:
          membership.role ||
          "member",

        membershipId:
          membership.id,

        accessType: "member",

        workspaceId:
          workspace.id,

        workspaceName:
          workspace.companyName,
      });
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GIVE ACCESS TO EXISTING USER
// =====================================================
exports.giveAccess = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.body;

    const workspaceId =
      req.workspaceId;

    // ------------------------------------------
    // Validate email
    // ------------------------------------------
    if (
      !email ||
      !email.trim()
    ) {
      return res.status(400).json({
        message:
          "User email is required.",
      });
    }

    // ------------------------------------------
    // Workspace required
    // ------------------------------------------
    if (!workspaceId) {
      return res.status(400).json({
        message:
          "No workspace selected.",
      });
    }

    // ------------------------------------------
    // Get workspace
    // ------------------------------------------
    const workspace =
      await Workspace.findOne({
        id: workspaceId,
      });

    if (!workspace) {
      return res.status(404).json({
        message:
          "Workspace not found.",
      });
    }

    // ------------------------------------------
    // ONLY workspace owner can add members
    // ------------------------------------------
    if (
      workspace.ownerId !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "Only the workspace admin can add team members.",
      });
    }

    // ------------------------------------------
    // Normalize email
    // ------------------------------------------
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // ------------------------------------------
    // User must already have account
    // ------------------------------------------
    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email. The user must register first.",
      });
    }

    // ------------------------------------------
    // Admin cannot add himself
    // ------------------------------------------
    if (
      user.id ===
      req.user.id
    ) {
      return res.status(400).json({
        message:
          "You are already the admin of this workspace.",
      });
    }

    // ------------------------------------------
    // Check existing membership
    // ------------------------------------------
    const existingMembership =
      await WorkspaceMember.findOne({
        workspaceId,
        userId: user.id,
      });

    if (existingMembership) {
      return res.status(400).json({
        message:
          "This user already has access to your workspace.",
      });
    }

    // ------------------------------------------
    // Create membership
    // ------------------------------------------
    const membership =
      await WorkspaceMember.create({
        workspaceId,

        userId: user.id,

        role: "member",
      });

    // ------------------------------------------
    // IMPORTANT:
    // Do NOT overwrite user's workspaceId
    //
    // A member can belong to multiple teams.
    // WorkspaceMember is the source of truth.
    // ------------------------------------------

    const safeUser =
      user.toObject();

    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,

      message:
        "Workspace access granted successfully.",

      user: safeUser,

      membership,

      workspace: {
        id: workspace.id,

        companyName:
          workspace.companyName,

        ownerId:
          workspace.ownerId,
      },
    });
  } catch (error) {
    // ------------------------------------------
    // Duplicate membership protection
    // ------------------------------------------
    if (
      error.code === 11000
    ) {
      return res.status(400).json({
        message:
          "This user already has access to your workspace.",
      });
    }

    next(error);
  }
};


// =====================================================
// REVOKE WORKSPACE ACCESS
// =====================================================
exports.revokeAccess = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    const workspaceId =
      req.workspaceId;

    // ------------------------------------------
    // Workspace required
    // ------------------------------------------
    if (!workspaceId) {
      return res.status(400).json({
        message:
          "No workspace selected.",
      });
    }

    // ------------------------------------------
    // Get workspace
    // ------------------------------------------
    const workspace =
      await Workspace.findOne({
        id: workspaceId,
      });

    if (!workspace) {
      return res.status(404).json({
        message:
          "Workspace not found.",
      });
    }

    // ------------------------------------------
    // ONLY owner/admin can revoke
    // ------------------------------------------
    if (
      workspace.ownerId !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "Only the workspace admin can remove team members.",
      });
    }

    // ------------------------------------------
    // Don't allow admin to remove himself
    // ------------------------------------------
    if (
      userId ===
      req.user.id
    ) {
      return res.status(400).json({
        message:
          "You cannot revoke your own workspace access.",
      });
    }

    // ------------------------------------------
    // Remove membership
    // ------------------------------------------
    const membership =
      await WorkspaceMember.findOneAndDelete(
        {
          workspaceId,
          userId,
        }
      );

    if (!membership) {
      return res.status(404).json({
        message:
          "This user is not a member of your workspace.",
      });
    }

    return res.json({
      success: true,

      message:
        "Workspace access revoked successfully.",
    });
  } catch (error) {
    next(error);
  }
};
