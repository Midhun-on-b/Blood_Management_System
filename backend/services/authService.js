const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query } = require("../utils/dbQuery");

const ACCESS_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!ACCESS_SECRET) {
  throw new Error("JWT_SECRET is required");
}

function parseDurationToMs(value) {
  if (!value) return 7 * 24 * 60 * 60 * 1000;

  const match = String(value).trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return Number(value) || 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMs[unit];
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user) {
  return jwt.sign(
    {
      role: user.role,
      entity_id: user.entity_id,
      account_status: user.account_status,
    },
    ACCESS_SECRET,
    {
      subject: String(user.user_id),
      expiresIn: ACCESS_EXPIRES_IN,
    }
  );
}

function decodeAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  };
}

function normalizeEntityId(userRow) {
  return (
    userRow.linked_donor_id ||
    userRow.linked_hospital_id ||
    userRow.linked_bank_id ||
    null
  );
}

async function findUserByEmail(email, role) {
  let sql = `
    SELECT au.*, 
           d.name as donor_name, d.blood_group, d.city as donor_city, d.status as donor_status,
           h.hospital_name, h.city as hospital_city,
           bb.bank_name, bb.city as bank_city, bb.contact_no as bank_contact
    FROM auth_users au
    LEFT JOIN donor d ON au.linked_donor_id = d.donor_id
    LEFT JOIN hospital h ON au.linked_hospital_id = h.hospital_id
    LEFT JOIN blood_bank bb ON au.linked_bank_id = bb.bank_id
    WHERE au.email = ?
  `;
  const params = [email];

  if (role) {
    sql += " AND au.role = ?";
    params.push(role);
  }

  const rows = await query(sql, params);
  return rows[0] || null;
}

async function findUserById(userId) {
  const sql = `
    SELECT au.*, 
           d.name as donor_name, d.blood_group as d_bg, d.city as donor_city, d.status as donor_status,
           h.hospital_name, h.city as hospital_city,
           bb.bank_name, bb.city as bank_city, bb.contact_no as bank_contact
    FROM auth_users au
    LEFT JOIN donor d ON au.linked_donor_id = d.donor_id
    LEFT JOIN hospital h ON au.linked_hospital_id = h.hospital_id
    LEFT JOIN blood_bank bb ON au.linked_bank_id = bb.bank_id
    WHERE au.user_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [userId]);
  if (rows[0]) {
    require('fs').appendFileSync(require('path').join(__dirname, 'debug.log'), `[findUserById] FOUND: ${JSON.stringify(rows[0])}\n`);
  } else {
    require('fs').appendFileSync(require('path').join(__dirname, 'debug.log'), `[findUserById] MISSING: ${userId}\n`);
    console.warn(`[findUserById] User not found for ID: ${userId}`);
    return null;
  }
  return rows[0];
}

async function createRefreshTokenSession(userId, metadata = {}) {
  const refreshToken = crypto.randomBytes(48).toString("hex");
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationToMs(REFRESH_EXPIRES_IN));

  const result = await query(
    `
      INSERT INTO auth_refresh_tokens
      (user_id, token_hash, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      userId,
      refreshTokenHash,
      expiresAt,
      metadata.ip || null,
      metadata.userAgent || null,
    ]
  );

  return {
    refreshToken,
    tokenId: result.insertId,
    expiresAt,
  };
}

async function revokeRefreshTokenByHash(tokenHash) {
  await query(
    `
      UPDATE auth_refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = ? AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}

async function rotateRefreshToken(oldToken, metadata = {}) {
  const oldHash = hashToken(oldToken);
  const rows = await query(
    `
      SELECT *
      FROM auth_refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [oldHash]
  );

  const session = rows[0];
  if (!session) {
    return null;
  }

  if (session.revoked_at || new Date(session.expires_at).getTime() <= Date.now()) {
    return null;
  }

  await query(
    "UPDATE auth_refresh_tokens SET revoked_at = NOW() WHERE token_id = ?",
    [session.token_id]
  );

  const next = await createRefreshTokenSession(session.user_id, metadata);
  await query(
    "UPDATE auth_refresh_tokens SET rotated_from = ? WHERE token_id = ?",
    [session.token_id, next.tokenId]
  );

  return {
    userId: session.user_id,
    refreshToken: next.refreshToken,
    expiresAt: next.expiresAt,
  };
}

async function createAuthUser({
  role,
  email,
  password,
  accountStatus,
  linkedDonorId = null,
  linkedHospitalId = null,
  linkedBankId = null,
}) {
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await query(
    `
      INSERT INTO auth_users
      (role, email, password_hash, account_status, linked_donor_id, linked_hospital_id, linked_bank_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      role,
      email.toLowerCase(),
      passwordHash,
      accountStatus,
      linkedDonorId,
      linkedHospitalId,
      linkedBankId,
    ]
  );

  const created = await findUserById(result.insertId);
  return created;
}

async function ensureSeedAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    return { created: false, reason: "ADMIN_EMAIL or ADMIN_PASSWORD not set" };
  }

  const existing = await findUserByEmail(email, "admin");
  if (existing) {
    return { created: false, reason: "Admin already exists" };
  }

  await createAuthUser({
    role: "admin",
    email,
    password,
    accountStatus: "active",
  });

  return { created: true };
}

async function ensureAuthSchema() {
  await query(
    `
      CREATE TABLE IF NOT EXISTS auth_users (
        user_id INT NOT NULL AUTO_INCREMENT,
        role ENUM('donor', 'hospital', 'blood_bank', 'admin') NOT NULL,
        email VARCHAR(150) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        account_status ENUM('pending', 'active', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
        linked_donor_id INT NULL,
        linked_hospital_id INT NULL,
        linked_bank_id INT NULL,
        last_login_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        UNIQUE KEY uq_auth_users_email (email),
        UNIQUE KEY uq_auth_users_linked_donor (linked_donor_id),
        UNIQUE KEY uq_auth_users_linked_hospital (linked_hospital_id),
        UNIQUE KEY uq_auth_users_linked_bank (linked_bank_id),
        FOREIGN KEY (linked_donor_id) REFERENCES donor(donor_id),
        FOREIGN KEY (linked_hospital_id) REFERENCES hospital(hospital_id),
        FOREIGN KEY (linked_bank_id) REFERENCES blood_bank(bank_id)
      )
    `
  );

  await query(
    `
      CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
        token_id BIGINT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked_at DATETIME NULL,
        rotated_from BIGINT NULL,
        ip_address VARCHAR(64) NULL,
        user_agent VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (token_id),
        UNIQUE KEY uq_auth_refresh_tokens_hash (token_hash),
        KEY idx_auth_refresh_tokens_user (user_id),
        KEY idx_auth_refresh_tokens_expires_at (expires_at),
        FOREIGN KEY (user_id) REFERENCES auth_users(user_id),
        FOREIGN KEY (rotated_from) REFERENCES auth_refresh_tokens(token_id)
      )
    `
  );
}

function toAuthPayload(userRow) {
  if (!userRow) return null;
  require('fs').appendFileSync(require('path').join(__dirname, 'debug.log'), `[toAuthPayload] ${Date.now()} ${JSON.stringify(userRow)}\n`);

  const payload = {
    user_id: userRow.user_id,
    role: userRow.role,
    account_status: userRow.account_status,
    email: userRow.email,
    entity_id: normalizeEntityId(userRow),
  };

  if (userRow.role === 'donor') {
    payload.name = userRow.donor_name || 'Donor';
    payload.blood_group = userRow.d_bg || userRow.blood_group;
    payload.city = userRow.donor_city;
    payload.status = userRow.donor_status;
  } else if (userRow.role === 'hospital') {
    payload.name = userRow.hospital_name || 'Hospital';
    payload.city = userRow.hospital_city;
  } else if (userRow.role === 'blood_bank') {
    payload.name = userRow.bank_name || 'Blood Bank';
    payload.city = userRow.bank_city;
    payload.contact_no = userRow.bank_contact;
  } else if (userRow.role === 'admin') {
    payload.name = 'System Administrator';
  }

  return payload;
}

module.exports = {
  createAccessToken,
  decodeAccessToken,
  getCookieOptions,
  findUserByEmail,
  findUserById,
  createAuthUser,
  createRefreshTokenSession,
  revokeRefreshTokenByHash,
  rotateRefreshToken,
  toAuthPayload,
  hashToken,
  ensureSeedAdminUser,
  ensureAuthSchema,
};
