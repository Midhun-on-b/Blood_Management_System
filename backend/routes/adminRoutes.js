
const express = require("express");
const router = express.Router();
const db = require("../config/db");
console.log("Admin routes loaded");

router.get("/hello", (req, res) => {
  res.send("Admin route works");
});

// Admin Dashboard Statistics
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

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(result[0]);

  });

});

module.exports = router;