const express = require("express");
const router = express.Router();
const db = require("../config/db");


// =============================
// GET ALL PATIENTS
// =============================
router.get("/", (req, res) => {

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

  const { hospital_id, name, age, gender, blood_group } = req.body;

  const query = `
    INSERT INTO patient
    (hospital_id, name, age, gender, blood_group)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [hospital_id, name, age, gender, blood_group],
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


module.exports = router;