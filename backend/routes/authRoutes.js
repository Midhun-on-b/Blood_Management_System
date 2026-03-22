const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { query } = require("../utils/dbQuery");
const {
  createAccessToken,
  getCookieOptions,
  findUserByEmail,
  createRefreshTokenSession,
  rotateRefreshToken,
  revokeRefreshTokenByHash,
  toAuthPayload,
  findUserById,
  hashToken,
} = require("../services/authService");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function validatePassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8 || password.length > 72) return false;
  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function normalizePhone(phone) {
  if (phone === undefined || phone === null || phone === "") return null;

  const raw = String(phone).trim();
  const withOptionalPlus = raw.replace(/[^\d+]/g, "");
  const hasLeadingPlus = withOptionalPlus.startsWith("+");
  const digits = withOptionalPlus.replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) return null;
  return hasLeadingPlus ? `+${digits}` : digits;
}

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

function validateBloodGroup(group) {
  return /^(A|B|AB|O)[+-]$/i.test(String(group || "").trim());
}

function validateAge(age) {
  if (age === undefined || age === null || age === "") return true;
  const n = Number(age);
  return Number.isInteger(n) && n >= 18 && n <= 65;
}

function normalizeGender(gender) {
  if (gender === undefined || gender === null || gender === "") return null;
  const key = String(gender).trim().toLowerCase();
  const map = {
    male: "Male",
    female: "Female",
    other: "Other",
    "prefer not to say": "Prefer not",
    "prefer not": "Prefer not",
  };

  return map[key] || null;
}

async function runInTransaction(handler) {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const result = await handler(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

function setRefreshCookie(res, refreshToken) {
  res.cookie("refresh_token", refreshToken, getCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie("refresh_token", getCookieOptions());
}

async function loginAndIssueSession({
  email,
  password,
  role,
  ip,
  userAgent,
}) {
  const user = await findUserByEmail(email.toLowerCase(), role);
  if (!user) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  if (user.account_status !== "active") {
    return {
      error: {
        status: 403,
        message: `Account is ${user.account_status}`,
        account_status: user.account_status,
      },
    };
  }

  await query("UPDATE auth_users SET last_login_at = NOW() WHERE user_id = ?", [
    user.user_id,
  ]);

  const payload = toAuthPayload(user);
  const accessToken = createAccessToken(payload);
  const refreshSession = await createRefreshTokenSession(user.user_id, {
    ip,
    userAgent,
  });

  return {
    accessToken,
    refreshToken: refreshSession.refreshToken,
    user: payload,
  };
}

router.post("/register/donor", async (req, res) => {
  try {
    const { name, age, gender, phone_no, blood_group, city, email, password } = req.body || {};

    if (!name || !email || !password || !blood_group) {
      return res.status(400).json({
        message: "name, email, password and blood_group are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-72 chars and include uppercase, lowercase, number and special character",
      });
    }

    const normalizedPhone = normalizePhone(phone_no);
    if (phone_no && !normalizedPhone) {
      return res.status(400).json({ message: "Invalid phone_no" });
    }

    if (!validateBloodGroup(blood_group)) {
      return res.status(400).json({ message: "Invalid blood_group" });
    }

    if (!validateAge(age)) {
      return res.status(400).json({ message: "Invalid age. Expected 18-65" });
    }

    const normalizedGender = normalizeGender(gender);
    if (gender && !normalizedGender) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const createdUser = await runInTransaction(async (conn) => {
      const [donorResult] = await conn.query(
        `
          INSERT INTO donor (name, age, gender, phone_no, blood_group, city, status)
          VALUES (?, ?, ?, ?, ?, ?, 'active')
        `,
        [
          String(name).trim(),
          age || null,
          normalizedGender,
          normalizedPhone,
          String(blood_group).trim().toUpperCase(),
          normalizeText(city),
        ]
      );

      const passwordHash = await bcrypt.hash(password, 12);
      const [authResult] = await conn.query(
        `
          INSERT INTO auth_users
          (role, email, password_hash, account_status, linked_donor_id)
          VALUES (?, ?, ?, ?, ?)
        `,
        ["donor", String(email).trim().toLowerCase(), passwordHash, "active", donorResult.insertId]
      );

      return {
        user_id: authResult.insertId,
        role: "donor",
        account_status: "active",
        email: String(email).trim().toLowerCase(),
        linked_donor_id: donorResult.insertId,
        linked_hospital_id: null,
        linked_bank_id: null,
      };
    });

    return res.status(201).json({
      message: "Donor account created",
      user: toAuthPayload(createdUser),
    });
  } catch (error) {
    console.error("register donor failed:", error.code || "", error.message || error);
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate account data" });
    }

    return res.status(500).json({ message: "Failed to register donor" });
  }
});

router.post("/register/hospital", async (req, res) => {
  try {
    const { hospital_name, city, contact_no, email, password } = req.body || {};

    if (!hospital_name || !email || !password) {
      return res.status(400).json({
        message: "hospital_name, email and password are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-72 chars and include uppercase, lowercase, number and special character",
      });
    }

    const normalizedPhone = normalizePhone(contact_no);
    if (contact_no && !normalizedPhone) {
      return res.status(400).json({ message: "Invalid contact_no" });
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const createdUser = await runInTransaction(async (conn) => {
      const [hospitalResult] = await conn.query(
        `
          INSERT INTO hospital (hospital_name, city, contact_no)
          VALUES (?, ?, ?)
        `,
        [String(hospital_name).trim(), normalizeText(city), normalizedPhone]
      );

      const passwordHash = await bcrypt.hash(password, 12);
      const [authResult] = await conn.query(
        `
          INSERT INTO auth_users
          (role, email, password_hash, account_status, linked_hospital_id)
          VALUES (?, ?, ?, ?, ?)
        `,
        ["hospital", String(email).trim().toLowerCase(), passwordHash, "pending", hospitalResult.insertId]
      );

      return {
        user_id: authResult.insertId,
        role: "hospital",
        account_status: "pending",
        email: String(email).trim().toLowerCase(),
        linked_donor_id: null,
        linked_hospital_id: hospitalResult.insertId,
        linked_bank_id: null,
      };
    });

    return res.status(201).json({
      message: "Hospital registration submitted for approval",
      user: toAuthPayload(createdUser),
    });
  } catch (error) {
    console.error("register hospital failed:", error.code || "", error.message || error);
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate account data" });
    }

    return res.status(500).json({ message: "Failed to register hospital" });
  }
});

router.post("/register/blood-bank", async (req, res) => {
  try {
    const { bank_name, city, contact_no, email, password } = req.body || {};

    if (!bank_name || !email || !password) {
      return res.status(400).json({
        message: "bank_name, email and password are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-72 chars and include uppercase, lowercase, number and special character",
      });
    }

    const normalizedPhone = normalizePhone(contact_no);
    if (contact_no && !normalizedPhone) {
      return res.status(400).json({ message: "Invalid contact_no" });
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const createdUser = await runInTransaction(async (conn) => {
      const [bankResult] = await conn.query(
        `
          INSERT INTO blood_bank (bank_name, city, contact_no)
          VALUES (?, ?, ?)
        `,
        [String(bank_name).trim(), normalizeText(city), normalizedPhone]
      );

      const passwordHash = await bcrypt.hash(password, 12);
      const [authResult] = await conn.query(
        `
          INSERT INTO auth_users
          (role, email, password_hash, account_status, linked_bank_id)
          VALUES (?, ?, ?, ?, ?)
        `,
        ["blood_bank", String(email).trim().toLowerCase(), passwordHash, "pending", bankResult.insertId]
      );

      return {
        user_id: authResult.insertId,
        role: "blood_bank",
        account_status: "pending",
        email: String(email).trim().toLowerCase(),
        linked_donor_id: null,
        linked_hospital_id: null,
        linked_bank_id: bankResult.insertId,
      };
    });

    return res.status(201).json({
      message: "Blood bank registration submitted for approval",
      user: toAuthPayload(createdUser),
    });
  } catch (error) {
    console.error("register blood bank failed:", error.code || "", error.message || error);
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate account data" });
    }

    return res.status(500).json({ message: "Failed to register blood bank" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password and role are required" });
    }

    // Validate role
    const validRoles = ['admin', 'hospital', 'blood_bank', 'donor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const result = await loginAndIssueSession({
      email,
      password,
      role,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    if (result.error) {
      const { status, ...payload } = result.error;
      return res.status(status).json(payload);
    }

    setRefreshCookie(res, result.refreshToken);

    return res.json({
      access_token: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies && req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const rotated = await rotateRefreshToken(refreshToken, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    if (!rotated) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await findUserById(rotated.userId);
    if (!user || user.account_status !== "active") {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "User not active" });
    }

    const payload = toAuthPayload(user);
    const accessToken = createAccessToken(payload);
    setRefreshCookie(res, rotated.refreshToken);

    return res.json({
      access_token: accessToken,
      user: payload,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies && req.cookies.refresh_token;
    if (refreshToken) {
      await revokeRefreshTokenByHash(hashToken(refreshToken));
    }

    clearRefreshCookie(res);
    return res.json({ message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to logout" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.auth.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: toAuthPayload(user) });
});

router.get(
  "/pending-accounts",
  requireAuth,
  requireRoles("admin"),
  async (_req, res) => {
    try {
      const rows = await query(
        `
        SELECT user_id, role, email, account_status, created_at,
               linked_hospital_id, linked_bank_id
        FROM auth_users
        WHERE account_status = 'pending' AND role IN ('hospital', 'blood_bank')
        ORDER BY created_at DESC
      `
      );

      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch pending accounts" });
    }
  }
);

router.put(
  "/accounts/:userId/approval",
  requireAuth,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const action = String(req.body?.action || "").toLowerCase();

      if (!Number.isInteger(userId) || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Invalid userId or action" });
      }

      const nextStatus = action === "approve" ? "active" : "rejected";
      const result = await query(
        `
        UPDATE auth_users
        SET account_status = ?
        WHERE user_id = ? AND role IN ('hospital', 'blood_bank')
      `,
        [nextStatus, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pending account not found" });
      }

      return res.json({
        message: `Account ${nextStatus}`,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update account status" });
    }
  }
);

module.exports = router;
