const {
  Workspace,
  User,
} = require("../models");


// GET WORKSPACE
exports.get = async (
  req,
  res,
  next
) => {
  try {
    const workspace =
      await Workspace.findOne({
        id: req.workspaceId,
      });

    if (!workspace) {
      return res.status(404).json({
        message:
          "Workspace not found.",
      });
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};


// UPDATE WORKSPACE
exports.update = async (
  req,
  res,
  next
) => {
  try {
    const workspace =
      await Workspace.findOne({
        id: req.workspaceId,
      });

    if (!workspace) {
      return res.status(404).json({
        message:
          "Workspace not found.",
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

    Object.assign(
      workspace,
      updates
    );

    await workspace.save();

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};


// GET WORKSPACE MEMBERS
exports.members = async (
  req,
  res,
  next
) => {
  try {
    const users =
      await User.find({
        workspaceId:
          req.workspaceId,
      })
        .select("-passwordHash")
        .sort({
          createdAt: 1,
        });

    res.json(users);
  } catch (error) {
    next(error);
  }
};