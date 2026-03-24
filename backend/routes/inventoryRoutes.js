const express = require('express');
const router = express.Router();
const db = require('../config/db');

const VALID_ROLES = ['admin', 'blood_bank'];

function ensureRole(req, res) {
  if (!VALID_ROLES.includes(req.auth.role)) {
    res.status(403).json({ message: 'Forbidden' });
    return false;
  }
  return true;
}

router.get('/', (req, res) => {
  if (!ensureRole(req, res)) return;

  let sql = `
    SELECT bs.stock_id, bs.bank_id, bs.blood_group, bs.available_units, bs.last_updated,
      bb.bank_name, bb.city
    FROM blood_stock bs
    LEFT JOIN blood_bank bb ON bs.bank_id = bb.bank_id
  `;
  const params = [];

  if (req.auth.role === 'blood_bank') {
    sql += ' WHERE bs.bank_id = ?';
    params.push(req.auth.entityId);
  }

  sql += ' ORDER BY bs.blood_group, bs.stock_id DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('INVENTORY GET ERROR:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  if (!ensureRole(req, res)) return;

  const stockId = Number(req.params.id);
  if (!Number.isInteger(stockId)) {
    return res.status(400).json({ message: 'Invalid stock_id' });
  }

  db.query('SELECT * FROM blood_stock WHERE stock_id = ?', [stockId], (err, rows) => {
    if (err) {
      console.error('INVENTORY GET BY ID ERROR:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    if (!rows.length) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    const record = rows[0];
    if (req.auth.role === 'blood_bank' && Number(record.bank_id) !== Number(req.auth.entityId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(record);
  });
});

router.post('/', (req, res) => {
  if (!ensureRole(req, res)) return;

  const { bank_id, blood_group, available_units } = req.body;
  const resolvedBankId = req.auth.role === 'blood_bank' ? req.auth.entityId : bank_id;

  if (!resolvedBankId || !blood_group || available_units == null) {
    return res.status(400).json({ message: 'bank_id, blood_group, and available_units are required' });
  }

  const sql = `
    INSERT INTO blood_stock (bank_id, blood_group, available_units, last_updated)
    VALUES (?, ?, ?, CURDATE())
  `;

  db.query(sql, [resolvedBankId, blood_group, available_units], (err, result) => {
    if (err) {
      console.error('INVENTORY POST ERROR:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    res.status(201).json({ message: 'Inventory record created', stock_id: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  if (!ensureRole(req, res)) return;

  const stockId = Number(req.params.id);
  if (!Number.isInteger(stockId)) {
    return res.status(400).json({ message: 'Invalid stock_id' });
  }

  const { blood_group, available_units } = req.body;
  if (blood_group == null && available_units == null) {
    return res.status(400).json({ message: 'At least one of blood_group or available_units is required' });
  }

  db.query('SELECT * FROM blood_stock WHERE stock_id = ?', [stockId], (err, rows) => {
    if (err) {
      console.error('INVENTORY PUT READ ERROR:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    if (!rows.length) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    const record = rows[0];
    if (req.auth.role === 'blood_bank' && Number(record.bank_id) !== Number(req.auth.entityId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = [];
    const params = [];

    if (blood_group != null) {
      updates.push('blood_group = ?');
      params.push(blood_group);
    }
    if (available_units != null) {
      updates.push('available_units = ?');
      params.push(available_units);
    }

    updates.push('last_updated = CURDATE()');

    const q = `UPDATE blood_stock SET ${updates.join(', ')} WHERE stock_id = ?`;
    params.push(stockId);

    db.query(q, params, (updateErr) => {
      if (updateErr) {
        console.error('INVENTORY PUT UPDATE ERROR:', updateErr);
        return res.status(500).json({ message: 'Server Error' });
      }

      res.json({ message: 'Inventory record updated' });
    });
  });
});

router.delete('/:id', (req, res) => {
  if (req.auth.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const stockId = Number(req.params.id);
  if (!Number.isInteger(stockId)) {
    return res.status(400).json({ message: 'Invalid stock_id' });
  }

  db.query('DELETE FROM blood_stock WHERE stock_id = ?', [stockId], (err, result) => {
    if (err) {
      console.error('INVENTORY DELETE ERROR:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    res.json({ message: 'Inventory record deleted' });
  });
});

module.exports = router;
