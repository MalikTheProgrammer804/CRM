const {
  Task,
  Lead,
  User,
} = require("../models");

const scope = (req) => ({
  workspaceId: req.workspaceId,
});


// LIST TASKS
exports.list = async (req, res, next) => {
  try {
    const tasks = await Task.find(
      scope(req)
    ).sort({
      dueAt: 1,
      createdAt: -1,
    });

    // Get related leads/users manually because
    // our IDs are UUID strings rather than Mongo ObjectIds.
    const leadIds = tasks
      .map((task) => task.leadId)
      .filter(Boolean);

    const userIds = tasks
      .flatMap((task) => [
        task.assignedToId,
        task.createdById,
      ])
      .filter(Boolean);

    const [leads, users] =
      await Promise.all([
        Lead.find({
          id: { $in: leadIds },
        }).select(
          "id businessName phone email status"
        ),

        User.find({
          id: { $in: userIds },
        }).select(
          "id fullName email"
        ),
      ]);

    const leadMap = new Map(
      leads.map((lead) => [
        lead.id,
        lead,
      ])
    );

    const userMap = new Map(
      users.map((user) => [
        user.id,
        user,
      ])
    );

    const result = tasks.map((task) => ({
      ...task.toObject(),

      lead: task.leadId
        ? leadMap.get(task.leadId) || null
        : null,

      assignee: task.assignedToId
        ? userMap.get(
            task.assignedToId
          ) || null
        : null,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};


// CREATE TASK
exports.create = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      leadId,
      assignedToId,
      category,
      description,
      dueAt,
      priority,
      reminderEnabled,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message:
          "Task title is required.",
      });
    }

    if (leadId) {
      const lead = await Lead.findOne({
        id: leadId,
        workspaceId:
          req.workspaceId,
      });

      if (!lead) {
        return res.status(400).json({
          message:
            "Selected lead does not belong to this workspace.",
        });
      }
    }

    const task = await Task.create({
      workspaceId:
        req.workspaceId,

      createdById:
        req.user.id,

      title: title.trim(),

      leadId:
        leadId || null,

      assignedToId:
        assignedToId ||
        req.user.id,

      category:
        category || "Call",

      description:
        description || null,

      dueAt:
        dueAt || null,

      priority:
        priority || "Medium",

      reminderEnabled:
        reminderEnabled !== undefined
          ? reminderEnabled
          : true,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};


// UPDATE TASK
exports.update = async (
  req,
  res,
  next
) => {
  try {
    const task =
      await Task.findOne({
        id: req.params.id,
        ...scope(req),
      });

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found.",
      });
    }

    const allowed = [
      "title",
      "leadId",
      "assignedToId",
      "category",
      "description",
      "dueAt",
      "priority",
      "status",
      "reminderEnabled",
    ];

    const changes =
      Object.fromEntries(
        Object.entries(req.body)
          .filter(([key]) =>
            allowed.includes(key)
          )
      );

    Object.assign(
      task,
      changes
    );

    await task.save();

    res.json(task);
  } catch (error) {
    next(error);
  }
};


// DELETE TASK
exports.remove = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await Task.deleteOne({
        id: req.params.id,
        ...scope(req),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message:
          "Task not found.",
      });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};