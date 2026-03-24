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

async function autoRejectInsufficientStockRequests() {
  try {
    // Get all pending requests
    const pendingRequests = await query(`
      SELECT 
        br.request_id,
        br.bank_id,
        br.units_required,
        p.blood_group
      FROM blood_request br
      JOIN patient p ON br.patient_id = p.patient_id
      WHERE br.status = 'pending'
    `);

    for (const request of pendingRequests) {
      // Check stock availability for this blood group at the bank
      const stockRows = await query(`
        SELECT units_available
        FROM blood_stock
        WHERE bank_id = ? AND blood_group = ?
        LIMIT 1
      `, [request.bank_id, request.blood_group]);

      if (!stockRows.length || stockRows[0].units_available < request.units_required) {
        // Auto-reject the request
        await query(`
          UPDATE blood_request
          SET status = 'auto_rejected'
          WHERE request_id = ?
        `, [request.request_id]);

        console.log(`Auto-rejected request ${request.request_id} due to insufficient stock`);
      }
    }
  } catch (error) {
    console.error('Error in auto-rejection process:', error);
  }
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

router.get("/approved-pending-payment/:hospitalId", (req, res) => {
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
      br.units_required,
      br.request_date,
      br.status,
      h.hospital_name,
      bb.bank_name,
      p.name AS patient_name,
      p.blood_group,
      py.payment_id,
      py.amount,
      py.payment_status,
      py.payment_date AS payment_created_date
    FROM blood_request br
    LEFT JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN blood_bank bb ON br.bank_id = bb.bank_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    LEFT JOIN payment py ON br.request_id = py.request_id
    WHERE br.hospital_id = ?
      AND br.status = 'approved'
      AND (py.payment_status = 'pending' OR py.payment_status IS NULL)
    ORDER BY br.request_date DESC
  `;

  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("GET APPROVED PENDING PAYMENT ERROR:", err);
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

    // Status transitions based on role and workflow
    const normalizedStatus = String(status).trim().toLowerCase();
    const hospitalAllowed = ['pending', 'cancelled'];
    const bankAllowed = ['approved', 'processing', 'rejected'];
    const adminAllowed = ['pending', 'approved', 'processing', 'rejected', 'fulfilled', 'completed'];

    if (req.auth.role === 'hospital' && !hospitalAllowed.includes(normalizedStatus)) {
      return res.status(403).json({ message: 'Hospital cannot set this status' });
    }

    if (req.auth.role === 'blood_bank' && !bankAllowed.includes(normalizedStatus)) {
      return res.status(403).json({ message: 'Blood bank cannot set this status' });
    }

    if (req.auth.role === 'admin' && !adminAllowed.includes(normalizedStatus)) {
      return res.status(403).json({ message: 'Invalid status for admin' });
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
  if (!["blood_bank", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const requestId = req.params.id;

  // First check if the request belongs to this blood bank and get patient blood group
  db.query(
    `SELECT br.*, p.blood_group AS patient_blood_group FROM blood_request br
     JOIN patient p ON br.patient_id = p.patient_id
     WHERE br.request_id = ?`,
    [requestId],
    (err, requests) => {
      if (err) {
        console.error("APPROVE CHECK ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      if (!requests.length) {
        return res.status(404).json({ message: "Request not found" });
      }

      const request = requests[0];

      if (req.auth.role === "blood_bank" && Number(req.auth.entityId) !== Number(request.bank_id)) {
        return res.status(403).json({ message: "Forbidden - Request not for your blood bank" });
      }

      // Check stock availability
      db.query(
        "SELECT available_units FROM blood_stock WHERE bank_id = ? AND blood_group = ?",
        [request.bank_id, request.patient_blood_group || 'A+'],
        (err, stocks) => {
          if (err) {
            console.error("STOCK CHECK ERROR:", err);
            return res.status(500).json({ message: "Server Error" });
          }

          const availableUnits = stocks.length > 0 ? stocks[0].available_units : 0;

          if (availableUnits < request.units_required) {
            return res.status(400).json({
              message: `Insufficient stock. Available: ${availableUnits}, Required: ${request.units_required}`
            });
          }

          // Update request status to approved
          db.query(
            "UPDATE blood_request SET status = 'approved' WHERE request_id = ?",
            [requestId],
            (err) => {
              if (err) {
                console.error("APPROVE UPDATE ERROR:", err);
                return res.status(500).json({ message: "Server Error" });
              }

              // Create payment record
              const amount = request.units_required * 500; // ₹500 per unit
              db.query(
                `INSERT INTO payment (request_id, hospital_id, bank_id, payment_date, amount, payment_status)
                 VALUES (?, ?, ?, CURDATE(), ?, 'pending')`,
                [requestId, request.hospital_id, request.bank_id, amount],
                (err) => {
                  if (err) {
                    console.error("PAYMENT CREATION ERROR:", err);
                    // Don't fail the approval if payment creation fails
                  }

                  return res.json({
                    message: "Request approved successfully",
                    payment_initiated: !err,
                    amount: amount
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

router.put("/reject/:id", (req, res) => {
  if (!["blood_bank", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const requestId = req.params.id;

  // First check if the request belongs to this blood bank
  db.query(
    "SELECT * FROM blood_request WHERE request_id = ?",
    [requestId],
    (err, requests) => {
      if (err) {
        console.error("REJECT CHECK ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      if (!requests.length) {
        return res.status(404).json({ message: "Request not found" });
      }

      const request = requests[0];

      if (req.auth.role === "blood_bank" && Number(req.auth.entityId) !== Number(request.bank_id)) {
        return res.status(403).json({ message: "Forbidden - Request not for your blood bank" });
      }

      // Update request status to rejected
      db.query(
        "UPDATE blood_request SET status = 'rejected' WHERE request_id = ?",
        [requestId],
        (err) => {
          if (err) {
            console.error("REJECT UPDATE ERROR:", err);
            return res.status(500).json({ message: "Server Error" });
          }

          return res.json({ message: "Request rejected successfully" });
        }
      );
    }
  );
});

module.exports = router;

