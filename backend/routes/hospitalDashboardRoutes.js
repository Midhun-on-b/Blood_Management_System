const express = require('express');
const router = express.Router();
const db = require('../config/db');


// =============================
// GET HOSPITAL DASHBOARD STATS
// =============================
router.get('/:id/stats', (req, res) => {

    const hospitalId = req.params.id;

    const query = `
        SELECT
        (SELECT COUNT(*) FROM patient WHERE hospital_id = ?) AS patients,
        (SELECT COUNT(*) FROM blood_request WHERE hospital_id = ?) AS requests,
        (SELECT COUNT(*) FROM payment WHERE hospital_id = ?) AS payments
    `;

    db.query(query, [hospitalId, hospitalId, hospitalId], (err, result) => {

        if (err) {
            console.error("Dashboard SQL Error:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json(result[0]);

    });

});

module.exports = router;