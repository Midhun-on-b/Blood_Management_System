const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    if (!["admin", "hospital", "blood_bank"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    let query = `
        SELECT 
            p.payment_id,
            p.payment_date,
            p.amount,
            p.payment_status,
            b.bank_name,
            p.hospital_id,
            p.bank_id,
            p.request_id
        FROM payment p
        JOIN blood_bank b 
        ON p.bank_id = b.bank_id
    `;
    const params = [];

    if (req.auth.role === "hospital") {
        query += " WHERE p.hospital_id = ?";
        params.push(req.auth.entityId);
    } else if (req.auth.role === "blood_bank") {
        query += " WHERE p.bank_id = ?";
        params.push(req.auth.entityId);
    }

    db.query(query, params, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json(results);

    });

});

router.put("/:id", (req, res) => {
    if (!["admin", "hospital", "blood_bank"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const paymentId = req.params.id;
    const { payment_status } = req.body;

    if (!payment_status) {
        return res.status(400).json({ message: "payment_status is required" });
    }

    const normalized = String(payment_status).trim();
    const allowed = ["Pending", "Paid", "Completed", "Overdue"];
    if (!allowed.includes(normalized)) {
        return res.status(400).json({ message: "Invalid payment_status" });
    }

    db.query("SELECT * FROM payment WHERE payment_id = ?", [paymentId], (err, payments) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server Error" });
        }
        if (!payments.length) {
            return res.status(404).json({ message: "Payment not found" });
        }

        const payment = payments[0];

        if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(payment.hospital_id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (req.auth.role === "blood_bank" && Number(req.auth.entityId) !== Number(payment.bank_id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Update payment status and optionally update request completion
        db.query(
            "UPDATE payment SET payment_status = ?, payment_date = ? WHERE payment_id = ?",
            [normalized, new Date(), paymentId],
            (err2) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ message: "Server Error" });
                }

                if (normalized === "Paid" || normalized === "Completed") {
                    // Note: Don't update blood_request status here - it should only be completed when blood is issued
                    // The payment status change just means the hospital has paid, but blood hasn't been issued yet
                }

                return res.json({ message: "Payment status updated" });
            }
        );
    });
});

router.get("/pending", (req, res) => {
    if (!["blood_bank", "admin"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden - Only blood banks and admins can view pending payments" });
    }

    let query = `
        SELECT
            p.payment_id,
            p.payment_date,
            p.amount,
            p.payment_status,
            b.bank_name,
            h.hospital_name,
            p.request_id,
            br.units_required,
            br.status as request_status
        FROM payment p
        JOIN blood_bank b ON p.bank_id = b.bank_id
        JOIN hospital h ON p.hospital_id = h.hospital_id
        JOIN blood_request br ON p.request_id = br.request_id
        WHERE p.payment_status = 'pending'
    `;
    const params = [];

    if (req.auth.role === "blood_bank") {
        query += " AND p.bank_id = ?";
        params.push(req.auth.entityId);
    }

    query += " ORDER BY p.payment_date DESC";

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json(results);
    });
});

module.exports = router;
