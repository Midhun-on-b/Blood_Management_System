const express = require('express');
const router = express.Router();
const db = require('../config/db');


// =============================
// CREATE BLOOD REQUEST
// =============================
router.post('/', (req, res) => {

    const { hospital_id, patient_id, bank_id, units_required } = req.body;

    const query = `
        INSERT INTO blood_request 
        (hospital_id, patient_id, bank_id, request_date, units_required, status)
        VALUES (?, ?, ?, CURDATE(), ?, 'pending')
    `;

    db.query(
        query,
        [hospital_id, patient_id, bank_id, units_required],
        (err, result) => {

            if (err) {
                console.error("POST ERROR:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            res.status(201).json({
                message: "Blood request created successfully",
                request_id: result.insertId
            });
        }
    );
});


// =============================
// GET ALL BLOOD REQUESTS
// =============================
router.get('/', (req, res) => {

    const query = `
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

        LEFT JOIN hospital h 
            ON br.hospital_id = h.hospital_id

        LEFT JOIN patient p 
            ON br.patient_id = p.patient_id

        LEFT JOIN blood_bank bb 
            ON br.bank_id = bb.bank_id

        ORDER BY br.request_date DESC
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.error("GET ERROR:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json(results);
    });
});


// =============================
// UPDATE REQUEST STATUS (MAIN ROUTE ✅)
// =============================
router.put('/:id/status', (req, res) => {

    const { status } = req.body;
    const requestId = req.params.id;

    const query = `
        UPDATE blood_request
        SET status = ?
        WHERE request_id = ?
    `;

    db.query(query, [status.toLowerCase(), requestId], (err) => {

        if (err) {
            console.error("UPDATE ERROR:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json({
            message: `Request ${status} successfully`
        });
    });
});


// =============================
// OPTIONAL: QUICK APPROVE ROUTE
// =============================
router.put('/approve/:id', (req, res) => {

    const requestId = req.params.id;

    db.query(
        "UPDATE blood_request SET status='approved' WHERE request_id=?",
        [requestId],
        (err) => {

            if (err) {
                console.error("APPROVE ERROR:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            res.json({ message: "Approved successfully" });
        }
    );
});


// =============================
// OPTIONAL: QUICK REJECT ROUTE
// =============================
router.put('/reject/:id', (req, res) => {

    const requestId = req.params.id;

    db.query(
        "UPDATE blood_request SET status='rejected' WHERE request_id=?",
        [requestId],
        (err) => {

            if (err) {
                console.error("REJECT ERROR:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            res.json({ message: "Rejected successfully" });
        }
    );
});


module.exports = router;
