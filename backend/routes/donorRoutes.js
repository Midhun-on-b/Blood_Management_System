const express = require("express");
const router = express.Router();
const db = require("../config/db");

const SETTINGS_FIELDS = {
  name: "name",
  age: "age",
  gender: "gender",
  phone_no: "phone_no",
  blood_group: "blood_group",
  last_donation_date: "last_donation_date",
  city: "city",
};

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });
}

async function fetchDonorById(donorId) {
  const results = await runQuery(
    "SELECT * FROM donor WHERE donor_id = ?",
    [donorId]
  );

  return results[0] || null;
}

function buildSettingsUpdate(body) {
  const updates = [];
  const values = [];

  Object.entries(SETTINGS_FIELDS).forEach(([field, column]) => {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      return;
    }

    let value = body[field];

    if (typeof value === "string") {
      value = value.trim();
    }

    if (field === "age") {
      const parsedAge = Number(value);

      if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
        throw new Error("Age must be a positive integer");
      }

      value = parsedAge;
    }

    if (field === "last_donation_date" && value) {
      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Last donation date must be a valid date");
      }

      value = parsedDate.toISOString().slice(0, 10);
    }

    updates.push(`${column} = ?`);
    values.push(value === "" ? null : value);
  });

  return { updates, values };
}

// 1️⃣ Get all donors
router.get("/", (req, res) => {
  db.query("SELECT * FROM donor WHERE status = 'active'", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// 2️⃣ Get single donor by ID  👈 ADD HERE
router.get("/:id", (req, res) => {
  const donorId = req.params.id;

  db.query(
    "SELECT * FROM donor WHERE donor_id = ?",
    [donorId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ message: "Donor not found" });
        } else {
          res.json(results[0]);
        }
      }
    }
  );
});

// Update donor settings
router.patch("/:id/settings", async (req, res) => {
  const donorId = req.params.id;

  let updatePayload;

  try {
    updatePayload = buildSettingsUpdate(req.body || {});
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  if (updatePayload.updates.length === 0) {
    return res.status(400).json({
      error:
        "No valid donor settings provided. Allowed fields: name, age, gender, phone_no, blood_group, last_donation_date, city",
    });
  }

  try {
    const result = await runQuery(
      `
        UPDATE donor
        SET ${updatePayload.updates.join(", ")}
        WHERE donor_id = ?
      `,
      [...updatePayload.values, donorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const updatedDonor = await fetchDonorById(donorId);

    return res.json({
      message: "Donor settings updated successfully",
      donor: updatedDonor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update donor settings" });
  }
});

// 3️⃣ Add new donor
router.post("/", (req, res) => {
  const { name, age, gender, phone_no, blood_group, last_donation_date, city } = req.body;

  const sql = `
    INSERT INTO donor 
    (name, age, gender, phone_no, blood_group, last_donation_date, city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, age, gender, phone_no, blood_group, last_donation_date, city],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add donor" });
      } else {
        res.json({ message: "Donor added successfully", donor_id: result.insertId });
      }
    }
  );
});
// Update donor
router.put("/:id", (req, res) => {
  const donorId = req.params.id;
  const { name, age, gender, phone_no, blood_group, last_donation_date, city } = req.body;

  const sql = `
    UPDATE donor
    SET name = ?, age = ?, gender = ?, phone_no = ?, 
        blood_group = ?, last_donation_date = ?, city = ?
    WHERE donor_id = ?
  `;

  db.query(
    sql,
    [name, age, gender, phone_no, blood_group, last_donation_date, city, donorId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update donor" });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ message: "Donor not found" });
        } else {
          res.json({ message: "Donor updated successfully" });
        }
      }
    }
  );
});
// Soft delete donor (mark inactive)
router.put("/deactivate/:id", (req, res) => {
  const donorId = req.params.id;

  db.query(
    "UPDATE donor SET status = 'inactive' WHERE donor_id = ?",
    [donorId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to deactivate donor" });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ message: "Donor not found" });
        } else {
          res.json({ message: "Donor deactivated successfully" });
        }
      }
    }
  );
});
module.exports = router;
