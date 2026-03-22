const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("Admin routes loaded");

// =============================
// TEST ROUTE
// =============================
router.get("/hello", (req, res) => {
  res.send("Admin route works");
});

// =============================
// ADMIN DASHBOARD STATISTICS
// =============================
router.get("/dashboard", (req, res) => {

  const query = `
    SELECT
      (SELECT COUNT(*) FROM donor) AS total_donors,
      (SELECT COUNT(*) FROM hospital) AS total_hospitals,
      (SELECT COUNT(*) FROM blood_bank) AS total_blood_banks,
      (SELECT COUNT(*) FROM blood_request) AS total_requests,
      (SELECT COUNT(*) FROM donation_record) AS total_donations
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

});

// =============================
// GET ALL BLOOD REQUESTS (✅ FIXED)
// =============================
router.get("/requests", (req, res) => {

  const query = `
    SELECT 
      br.request_id AS id,
      h.hospital_name AS hospital,
      bb.bank_name AS blood_bank,
      p.name AS patient_name,
      p.blood_group,
      br.units_required AS quantity,
      br.status,
      br.request_date
    FROM blood_request br
    JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    LEFT JOIN blood_bank bb ON br.bank_id = bb.bank_id
    ORDER BY br.request_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Requests error:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });

});

// =============================
// GET ALL APPROVALS
// =============================
router.get("/approvals", (req, res) => {

  const query = `
    SELECT 
      br.request_id AS id,
      br.hospital_id,
      h.hospital_name,
      p.name AS patient_name,
      br.patient_id,
      br.bank_id,
      br.request_date,
      br.units_required,
      br.status
    FROM blood_request br
    JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    ORDER BY br.request_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});

// =============================
// APPROVE REQUEST
// =============================
router.put("/approve/:id", (req, res) => {

  const query = `
    UPDATE blood_request
    SET status = 'approved'
    WHERE request_id = ?
  `;

  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Request approved successfully" });
  });

});

// =============================
// REJECT REQUEST
// =============================
router.put("/reject/:id", (req, res) => {

  const query = `
    UPDATE blood_request
    SET status = 'rejected'
    WHERE request_id = ?
  `;

  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Request rejected successfully" });
  });

});

// =============================
// GET ALL BLOOD BANKS
// =============================
router.get("/blood-banks", (req, res) => {

  const query = `
    SELECT 
      bb.bank_id,
      bb.bank_name AS name,
      bb.city,
      bb.contact_no,

      (
        SELECT COALESCE(SUM(available_units), 0)
        FROM blood_stock bs
        WHERE bs.bank_id = bb.bank_id
      ) AS units,

      (
        SELECT COUNT(*)
        FROM donation_record dr
        WHERE dr.bank_id = bb.bank_id
      ) AS donated

    FROM blood_bank bb
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});

// =============================
// INVENTORY ROUTE
// =============================
router.get("/inventory", (req, res) => {

  const query = `
    SELECT 
      bb.bank_id,
      bb.bank_name,
      bb.city,
      bs.blood_group,
      bs.available_units
    FROM blood_bank bb
    JOIN blood_stock bs ON bb.bank_id = bs.bank_id
    ORDER BY bb.bank_id
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Inventory error:", err);
      return res.status(500).json(err);
    }

    res.json(result);
  });

});

// =============================
// BLOOD UTILIZATION BY GROUP
// =============================
router.get("/blood-utilization", (req, res) => {
  const query = `
    SELECT 
      blood_group,
      SUM(available_units) AS total_stock,
      COUNT(DISTINCT bank_id) AS banks_with_stock,
      AVG(available_units) AS avg_per_bank
    FROM blood_stock
    GROUP BY blood_group
    ORDER BY total_stock DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =============================
// DONOR RETENTION RATES
// =============================
router.get("/donor-retention", (req, res) => {
  const query = `
    SELECT 
      YEAR(last_donation_date) AS year,
      COUNT(*) AS total_donors,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_donors,
      ROUND((SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS retention_rate
    FROM donor
    WHERE last_donation_date IS NOT NULL
    GROUP BY YEAR(last_donation_date)
    ORDER BY year DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =============================
// HOSPITAL DEMAND FORECASTING
// =============================
router.get("/hospital-demand", (req, res) => {
  const query = `
    SELECT 
      h.hospital_name,
      COUNT(br.request_id) AS total_requests,
      SUM(br.units_required) AS total_units_requested,
      AVG(br.units_required) AS avg_units_per_request,
      MAX(br.request_date) AS last_request_date
    FROM hospital h
    LEFT JOIN blood_request br ON h.hospital_id = br.hospital_id
    GROUP BY h.hospital_id, h.hospital_name
    ORDER BY total_requests DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =============================
// STOCK SHORTAGE INCIDENTS
// =============================
router.get("/stock-shortages", (req, res) => {
  const query = `
    SELECT 
      bb.bank_name,
      bs.blood_group,
      bs.available_units,
      CASE 
        WHEN bs.available_units < 10 THEN 'Critical'
        WHEN bs.available_units < 50 THEN 'Low'
        ELSE 'Normal'
      END AS status
    FROM blood_stock bs
    JOIN blood_bank bb ON bs.bank_id = bb.bank_id
    WHERE bs.available_units < 50
    ORDER BY bs.available_units ASC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =============================
// PAYMENT OVERDUE REPORTS
// =============================
router.get("/overdue-payments", (req, res) => {
  const query = `
    SELECT 
      py.payment_id,
      h.hospital_name,
      bb.bank_name,
      py.amount,
      py.payment_date,
      DATEDIFF(CURDATE(), py.payment_date) AS days_overdue
    FROM payment py
    JOIN hospital h ON py.hospital_id = h.hospital_id
    JOIN blood_bank bb ON py.bank_id = bb.bank_id
    WHERE py.payment_status = 'Pending' AND DATEDIFF(CURDATE(), py.payment_date) > 30
    ORDER BY days_overdue DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;