const bcrypt = require("bcryptjs");
const { User, Workspace } = require("../models");
const { generateToken, verifyToken } = require("../utils/token");
const generatePassword = require("../utils/generatePassword");
const sendEmail = require("../utils/sendEmail");

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { companyName, fullName, email, phoneNumber, password } = req.body;

    if (!companyName || !fullName || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const workspace = await Workspace.create({
      companyName,
    });

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      phoneNumber,
      passwordHash,
      role: "admin",
      workspaceId: workspace.id,
    });

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to Nexora - Verify your email",
        html: `
          <p>Hi ${fullName},</p>
          <p>Welcome to Nexora! Your workspace
          <strong>${companyName}</strong> is ready.</p>
        `,
      });
    } catch (emailErr) {
      console.error(
        "Signup email failed to send:",
        emailErr.message
      );
    }

    const token = generateToken({
      userId: user.id,
      workspaceId: workspace.id,
      role: user.role,
    });

    return res.status(201).json({
      token,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        workspaceId: workspace.id,
      },

      workspace: {
        id: workspace.id,
        companyName: workspace.companyName,
      },
    });
  } catch (err) {
    next(err);
  }
}


// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(
      {
        userId: user.id,
        workspaceId: user.workspaceId,
        role: user.role,
      },
      rememberMe
    );

    return res.status(200).json({
      token,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    next(err);
  }
}


// POST /api/auth/verify-email
async function verifyEmail(req, res, next) {
  try {
    const token =
      req.body?.token ||
      req.query?.token ||
      null;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    let userId = req.user?.id || null;

    if (!userId) {
      try {
        const decoded = verifyToken(token);
        userId = decoded.userId || decoded.id || null;
      } catch (err) {
        return res.status(401).json({
          message: "Invalid or expired verification token.",
        });
      }
    }

    if (!userId) {
      return res.status(401).json({
        message:
          "You must be signed in to verify your email.",
      });
    }

    const user = await User.findOne({
      id: userId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.isEmailVerified = true;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (err) {
    next(err);
  }
}


// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({
        message:
          "If that email exists, a new password has been sent.",
      });
    }

    const newPassword = generatePassword(10);

    user.passwordHash = await bcrypt.hash(
      newPassword,
      10
    );

    user.mustChangePassword = true;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new Nexora password",
      html: `
        <p>Hi ${user.fullName},</p>
        <p>Your password has been reset.</p>
        <p>Your new password is:</p>
        <p style="font-size:18px;font-weight:bold;">
          ${newPassword}
        </p>
        <p>Please log in and change it immediately.</p>
      `,
    });

    return res.status(200).json({
      message:
        "If that email exists, a new password has been sent.",
    });
  } catch (err) {
    next(err);
  }
}


// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const {
      fullName,
      phoneNumber,
      currentPassword,
      newPassword,
      interfacePreference,
      notificationPreferences,
    } = req.body;

    const user = await User.findOne({
      id: req.user.id,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (newPassword) {
      if (
        !currentPassword ||
        !(await bcrypt.compare(
          currentPassword,
          user.passwordHash
        ))
      ) {
        return res.status(400).json({
          message: "Current password is incorrect.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message:
            "New password must be at least 8 characters.",
        });
      }

      user.passwordHash = await bcrypt.hash(
        newPassword,
        10
      );

      user.mustChangePassword = false;
    }

    if (
      typeof fullName === "string" &&
      fullName.trim()
    ) {
      user.fullName = fullName.trim();
    }

    if (typeof phoneNumber === "string") {
      user.phoneNumber = phoneNumber;
    }

    if (
      typeof interfacePreference === "string" &&
      ["Light", "Dark"].includes(interfacePreference)
    ) {
      user.interfacePreference =
        interfacePreference;
    }

    if (
      typeof notificationPreferences === "object" &&
      notificationPreferences !== null
    ) {
      user.notificationPreferences = {
        ...(user.notificationPreferences?.toObject?.() ||
          user.notificationPreferences ||
          {}),
        ...notificationPreferences,
      };
    }

    await user.save();

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      interfacePreference:
        user.interfacePreference,
      notificationPreferences:
        user.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
}


// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await User.findOne({
      id: req.user.id,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        interfacePreference:
          user.interfacePreference,
        notificationPreferences:
          user.notificationPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  updateProfile,
  me,
};