const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ==========================
// GET HOSPITAL PROFILE
// ==========================

router.get("/:id", (req, res) => {

    const hospitalId = req.params.id;

    const query = `
        SELECT *
        FROM hospital
        WHERE hospital_id = ?
    `;

    db.query(query, [hospitalId], (err, results) => {

        if (err) {
            console.error("GET ERROR:", err);
            return res.status(500).json(err);
        }

        res.json(results[0]);

    });

});


router.put("/:id", (req, res) => {

    const hospitalId = req.params.id;

    const { hospital_name, city, contact_no } = req.body;

    const query = `
        UPDATE hospital
        SET hospital_name = ?, city = ?, contact_no = ?
        WHERE hospital_id = ?
    `;

    db.query(
        query,
        [hospital_name, city, contact_no, hospitalId],
        (err, result) => {

            if (err) {
                console.error("UPDATE ERROR:", err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Hospital updated successfully"
            });

        }
    );

});
module.exports = router;