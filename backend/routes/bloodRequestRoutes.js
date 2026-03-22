const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { query } = require("../utils/dbQuery");

async function canAccessBloodRequest(auth, requestId) {
  if (auth.role === "admin") return true;

  const rows = await query(
    "SELECT hospital_id, bank_id FROM blood_request WHERE request_id = ? LIMIT 1",
    [requestId]
  );
  if (!rows.length) return false;

  if (auth.role === "hospital") {
    return Number(rows[0].hospital_id) === Number(auth.entityId);
  }

  if (auth.role === "blood_bank") {
    return Number(rows[0].bank_id) === Number(auth.entityId);
  }

  return false;
}

router.get("/", (req, res) => {
  if (!["admin", "hospital", "blood_bank"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let sql = `
    SELECT 
      br.request_id,
      br.hospital_id,
      br.patient_id,
      br.bank_id,
      br.request_date,
      br.units_required,
      br.status,
      h.hospital_name,
      p.name AS patient_name,
      p.blood_group,
      bb.bank_name
    FROM blood_request br
    LEFT JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    LEFT JOIN blood_bank bb ON br.bank_id = bb.bank_id
  `;
  const params = [];

  if (req.auth.role === "hospital") {
    sql += " WHERE br.hospital_id = ?";
    params.push(req.auth.entityId);
  } else if (req.auth.role === "blood_bank") {
    sql += " WHERE br.bank_id = ?";
    params.push(req.auth.entityId);
  }

  sql += " ORDER BY br.request_date DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("GET REQUESTS ERROR:", err);
      return res.status(500).json({ message: "Server Error" });
    }

    return res.json(results);
  });
});

router.post("/", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { hospital_id, patient_id, bank_id, units_required } = req.body;
  const effectiveHospitalId =
    req.auth.role === "hospital" ? req.auth.entityId : hospital_id;

  if (!effectiveHospitalId || !patient_id || !bank_id || !units_required) {
    return res.status(400).json({
      message: "hospital_id, patient_id, bank_id, units_required are required",
    });
  }

  const sql = `
    INSERT INTO blood_request
    (hospital_id, patient_id, bank_id, request_date, units_required, status)
    VALUES (?, ?, ?, CURDATE(), ?, 'pending')
  `;

  db.query(
    sql,
    [effectiveHospitalId, patient_id, bank_id, units_required],
    (err, result) => {
      if (err) {
        console.error("POST ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      return res.status(201).json({
        message: "Blood request created successfully",
        request_id: result.insertId,
      });
    }
  );
});

router.get("/simple/:hospitalId", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (
    req.auth.role === "hospital" &&
    Number(req.auth.entityId) !== Number(req.params.hospitalId)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hospitalId = req.params.hospitalId;
  const sql = `
    SELECT 
      br.request_id,
      h.hospital_name,
      br.patient_id,
      p.name AS patient_name,
      br.bank_id,
      p.blood_group,
      br.units_required,
      br.request_date,
      br.status,
      'Routine' AS priority
    FROM blood_request br
    JOIN hospital h ON br.hospital_id = h.hospital_id
    JOIN patient p ON br.patient_id = p.patient_id
    WHERE br.hospital_id = ?
    ORDER BY br.request_date DESC
  `;

  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("GET SIMPLE ERROR:", err);
      return res.status(500).json({ message: "Server Error" });
    }

    return res.json(results);
  });
});

router.get("/detailed/:hospitalId", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (
    req.auth.role === "hospital" &&
    Number(req.auth.entityId) !== Number(req.params.hospitalId)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hospitalId = req.params.hospitalId;
  const sql = `
    SELECT 
      br.request_id,
      br.hospital_id,
      br.patient_id,
      br.bank_id,
      br.units_required,
      CONCAT(UCASE(LEFT(br.status, 1)), LCASE(SUBSTRING(br.status, 2))) AS status,
      br.request_date,
      h.hospital_name,
      h.city AS hospital_city,
      p.name AS patient_name,
      p.blood_group,
      'General' AS ward,
      bb.bank_name,
      bb.city AS bank_city,
      'Normal' AS priority
    FROM blood_request br
    LEFT JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    LEFT JOIN blood_bank bb ON br.bank_id = bb.bank_id
    WHERE br.hospital_id = ?
    ORDER BY br.request_date DESC
  `;

  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("GET DETAILED ERROR:", err);
      return res.status(500).json({ message: "Server Error" });
    }

    return res.json(results);
  });
});

router.get("/detailed", (req, res) => {
  if (req.auth.role !== "hospital") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hospitalId = req.auth.entityId;
  const sql = `
    SELECT 
      br.request_id,
      br.hospital_id,
      br.patient_id,
      br.bank_id,
      br.units_required,
      CONCAT(UCASE(LEFT(br.status, 1)), LCASE(SUBSTRING(br.status, 2))) AS status,
      br.request_date,
      h.hospital_name,
      h.city AS hospital_city,
      p.name AS patient_name,
      p.blood_group,
      'General' AS ward,
      bb.bank_name,
      bb.city AS bank_city,
      'Normal' AS priority
    FROM blood_request br
    LEFT JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    LEFT JOIN blood_bank bb ON br.bank_id = bb.bank_id
    WHERE br.hospital_id = ?
    ORDER BY br.request_date DESC
  `;

  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("GET DETAILED ERROR:", err);
      return res.status(500).json({ message: "Server Error" });
    }

    return res.json(results);
  });
});

router.put("/:id", async (req, res) => {
  if (!["admin", "hospital", "blood_bank"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { status } = req.body;
  const requestId = req.params.id;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const allowed = await canAccessBloodRequest(req.auth, requestId);
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const sql = `
      UPDATE blood_request
      SET status = ?
      WHERE request_id = ?
    `;

    db.query(sql, [status.toLowerCase(), requestId], (err) => {
      if (err) {
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      return res.json({ message: `Request ${status} successfully` });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
});

router.put("/approve/:id", (req, res) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const requestId = req.params.id;
  db.query(
    "UPDATE blood_request SET status='approved' WHERE request_id=?",
    [requestId],
    (err) => {
      if (err) {
        console.error("APPROVE ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      return res.json({ message: "Approved successfully" });
    }
  );
});

router.put("/reject/:id", (req, res) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const requestId = req.params.id;
  db.query(
    "UPDATE blood_request SET status='rejected' WHERE request_id=?",
    [requestId],
    (err) => {
      if (err) {
        console.error("REJECT ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      return res.json({ message: "Rejected successfully" });
    }
  );
});

module.exports = router;

