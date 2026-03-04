const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/payments", (req, res) => {

    const query = `
        SELECT 
            p.payment_id,
            p.payment_date,
            p.amount,
            p.payment_status,
            b.bank_name
        FROM payment p
        JOIN blood_bank b 
        ON p.bank_id = b.bank_id
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json(results);

    });

});

module.exports = router;