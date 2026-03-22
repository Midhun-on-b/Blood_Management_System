const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { requireRoles } = require("../middleware/authMiddleware");


// =============================
// GET ALL PATIENTS
// =============================
router.get("/", requireRoles("admin"), (req, res) => {

  const query = `
    SELECT * FROM patient
    ORDER BY patient_id DESC
  `;

  db.query(query, (err, results) => {

    if (err) {
      console.error("GET PATIENT ERROR:", err);
      return res.status(500).json({
        message: "Server Error"
      });
    }

    res.json(results);

  });

});


// =============================
// GET PATIENTS BY HOSPITAL
// =============================
router.get("/:hospitalId", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(req.params.hospitalId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hospitalId = req.params.hospitalId;

  const query = `
    SELECT *
    FROM patient
    WHERE hospital_id = ?
    ORDER BY patient_id DESC
  `;

  db.query(query, [hospitalId], (err, results) => {

    if (err) {
      console.error("GET PATIENT BY HOSPITAL ERROR:", err);
      return res.status(500).json({
        message: "Server Error"
      });
    }

    res.json(results);

  });

});


// =============================
// ADD NEW PATIENT
// =============================
router.post("/", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { hospital_id, name, age, gender, blood_group } = req.body;
  const hospitalId = req.auth.role === "hospital" ? req.auth.entityId : hospital_id;

  if (!hospitalId) {
    return res.status(400).json({ message: "hospital_id is required" });
  }

  const query = `
    INSERT INTO patient
    (hospital_id, name, age, gender, blood_group)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [hospitalId, name, age, gender, blood_group],
    (err, result) => {

      if (err) {
        console.error("POST PATIENT ERROR:", err);
        return res.status(500).json({
          message: "Server Error"
        });
      }

      res.json({
        message: "Patient added successfully"
      });

    }
  );

});

// =============================
// UPDATE PATIENT
// =============================
router.put("/:id", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const patientId = req.params.id;
  const { name, age, gender, blood_group } = req.body;

  // Check ownership
  db.query("SELECT hospital_id FROM patient WHERE patient_id = ?", [patientId], (err, patient) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (!patient.length) return res.status(404).json({ message: "Patient not found" });

    if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(patient[0].hospital_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const query = `
      UPDATE patient
      SET name = ?, age = ?, gender = ?, blood_group = ?
      WHERE patient_id = ?
    `;

    db.query(query, [name, age, gender, blood_group, patientId], (err) => {
      if (err) {
        console.error("UPDATE PATIENT ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      res.json({ message: "Patient updated successfully" });
    });
  });
});

// =============================
// DELETE PATIENT
// =============================
router.delete("/:id", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const patientId = req.params.id;

  // Check ownership
  db.query("SELECT hospital_id FROM patient WHERE patient_id = ?", [patientId], (err, patient) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (!patient.length) return res.status(404).json({ message: "Patient not found" });

    if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(patient[0].hospital_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const query = "DELETE FROM patient WHERE patient_id = ?";

    db.query(query, [patientId], (err) => {
      if (err) {
        console.error("DELETE PATIENT ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      res.json({ message: "Patient deleted successfully" });
    });
  });
});


module.exports = router;
