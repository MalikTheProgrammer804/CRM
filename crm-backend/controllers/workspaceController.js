const {
  Workspace,
  User,
  WorkspaceMember,
} = require("../models");


// ==========================================
// GET WORKSPACE
// ==========================================
exports.get = async (req, res, next) => {
  try {
    const workspace = await Workspace.findOne({
      id: req.workspaceId,
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found.",
      });
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};


// ==========================================
// UPDATE WORKSPACE
// ==========================================
exports.update = async (req, res, next) => {
  try {
    const workspace = await Workspace.findOne({
      id: req.workspaceId,
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found.",
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

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};


// ==========================================
// GET WORKSPACE MEMBERS
// ==========================================
exports.members = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    // ------------------------------------------
    // Workspace owner/admin
    // ------------------------------------------
    const owner = await User.findOne({
      workspaceId,
      role: "admin",
    })
      .select("-passwordHash")
      .lean();

    // ------------------------------------------
    // Workspace members
    // ------------------------------------------
    const memberships = await WorkspaceMember.find({
      workspaceId,
    })
      .sort({ createdAt: 1 })
      .lean();

    const memberUserIds = memberships.map(
      (membership) => membership.userId
    );

    const memberUsers =
      memberUserIds.length > 0
        ? await User.find({
            id: { $in: memberUserIds },
          })
            .select("-passwordHash")
            .lean()
        : [];

    // ------------------------------------------
    // Combine owner + members
    // ------------------------------------------
    const result = [];

    if (owner) {
      result.push({
        ...owner,
        teamRole: "admin",
        membershipId: null,
        accessType: "owner",
      });
    }

    for (const membership of memberships) {
      const user = memberUsers.find(
        (item) => item.id === membership.userId
      );

      if (!user) continue;

      result.push({
        ...user,
        teamRole: membership.role,
        membershipId: membership.id,
        accessType: "member",
      });
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};


// ==========================================
// GIVE ACCESS TO EXISTING USER
// ==========================================
exports.giveAccess = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "User email is required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // User MUST already have an account
    // ------------------------------------------
    const user = await User.findOne({
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
    if (user.id === req.user.id) {
      return res.status(400).json({
        message:
          "You are already the admin of this workspace.",
      });
    }

    // ------------------------------------------
    // Check duplicate membership
    // ------------------------------------------
    const existingMembership =
      await WorkspaceMember.findOne({
        workspaceId: req.workspaceId,
        userId: user.id,
      });

    if (existingMembership) {
      return res.status(400).json({
        message:
          "This user already has access to your workspace.",
      });
    }

    // ------------------------------------------
    // Create workspace membership
    // ------------------------------------------
    const membership =
      await WorkspaceMember.create({
        workspaceId: req.workspaceId,
        userId: user.id,
        role: "member",
      });

    const safeUser = user.toObject();

    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      message: "Workspace access granted successfully.",
      user: safeUser,
      membership,
    });
  } catch (error) {
    // Duplicate protection
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "This user already has access to your workspace.",
      });
    }

    next(error);
  }
};


// ==========================================
// REVOKE WORKSPACE ACCESS
// ==========================================
exports.revokeAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // ------------------------------------------
    // Don't allow admin to remove himself
    // ------------------------------------------
    if (userId === req.user.id) {
      return res.status(400).json({
        message:
          "You cannot revoke your own workspace access.",
      });
    }

    const membership =
      await WorkspaceMember.findOneAndDelete({
        workspaceId: req.workspaceId,
        userId,
      });

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
