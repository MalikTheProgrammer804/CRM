const { Lead } = require("../models");

function getWorkspaceId(req) {
  return (
    req.workspaceId ||
    req.body?.workspaceId ||
    req.user?.workspaceId
  );
}


// CREATE LEAD
exports.createLead = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace context is required.",
      });
    }

    const lead = await Lead.create({
      ...req.body,
      workspaceId,
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error("Create lead error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// GET ALL LEADS
exports.getLeads = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    const filter = workspaceId
      ? { workspaceId }
      : {};

    const leads = await Lead.find(filter).sort({
      createdAt: -1,
    });

    res.json(leads);
  } catch (err) {
    console.error("Get leads error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// GET SINGLE LEAD
exports.getLead = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    const filter = {
      id: req.params.id,
    };

    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }

    const lead = await Lead.findOne(filter);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (err) {
    console.error("Get lead error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// UPDATE LEAD
exports.updateLead = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    const filter = {
      id: req.params.id,
    };

    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }

    const lead = await Lead.findOne(filter);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    Object.assign(lead, req.body);

    // Never allow workspace to be changed through body
    lead.workspaceId = lead.workspaceId;

    await lead.save();

    res.json(lead);
  } catch (err) {
    console.error("Update lead error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// DELETE LEAD
exports.deleteLead = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    const filter = {
      id: req.params.id,
    };

    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }

    const lead = await Lead.findOne(filter);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await Lead.deleteOne({
      id: lead.id,
    });

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (err) {
    console.error("Delete lead error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// ADD NOTE
exports.addNote = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    const filter = {
      id: req.params.id,
    };

    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }

    const lead = await Lead.findOne(filter);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    const note = req.body?.note?.trim();

    if (!note) {
      return res.status(400).json({
        message: "Note is required.",
      });
    }

    lead.notes = [lead.notes, note]
      .filter(Boolean)
      .join("\n\n");

    await lead.save();

    res.json({
      message: "Note added",
      lead,
    });
  } catch (err) {
    console.error("Add note error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// EXPORT LEADS
exports.exportLeads = async (req, res) => {
  try {
    const workspaceId = getWorkspaceId(req);

    const filter = workspaceId
      ? { workspaceId }
      : {};

    // Apply date filtering if the client requested a range (7/15/30 days)
    // or an explicit start/end date.
    const { range, startDate, endDate } = req.query;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else if (range) {
      const days = Number(range);
      if (!Number.isNaN(days) && days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        filter.createdAt = { $gte: since };
      }
    }

    const leads = await Lead.find(filter).sort({
      createdAt: -1,
    });

    const headers = [
      "Business Name",
      "Owner Name",
      "Category",
      "Phone",
      "Email",
      "Website",
      "Address",
      "Facebook",
      "Instagram",
      "LinkedIn",
      "Group",
      "Assigned To",
      "Notes",
      "Status",
      "Source",
      "Google Place ID",
      "Google Maps Link",
      "Rating",
      "Reviews Count",
      "Date Added",
    ];

    const escapeCsv = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return `"${String(value)
        .replace(/"/g, '""')
        .replace(/\r?\n/g, " ")}"`;
    };

    const rows = leads.map((lead) => [
      lead.businessName,
      lead.ownerName,
      lead.category,
      lead.phone,
      lead.email,
      lead.website,
      lead.address,
      lead.facebook,
      lead.instagram,
      lead.linkedin,
      lead.group,
      lead.assignedTo,
      lead.notes,
      lead.status,
      lead.source,
      lead.googlePlaceId,
      lead.googleMapsLink,
      lead.rating,
      lead.reviewsCount,
      lead.createdAt,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\r\n");

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="leads-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`
    );

    res.status(200).send("\uFEFF" + csv);
  } catch (err) {
    console.error("Export leads error:", err);

    res.status(500).json({
      message: "Failed to export leads",
      error: err.message,
    });
  }
};