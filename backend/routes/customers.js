const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM customers';
    const params = [];
    if (search) {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    query += ' ORDER BY customer_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM customers');
    res.json({ success: true, data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Customer not found' });
    const [accounts] = await db.query(
      'SELECT a.*, b.branch_name FROM accounts a JOIN branches b ON a.branch_id=b.branch_id WHERE a.customer_id=?',
      [req.params.id]
    );
    const [loans] = await db.query('SELECT * FROM loans WHERE customer_id=?', [req.params.id]);
    res.json({ success: true, data: { ...rows[0], accounts, loans } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, dob, address } = req.body;
    if (!first_name || !email || !phone) {
      return res.status(400).json({ success: false, error: 'first_name, email and phone are required' });
    }
    const [result] = await db.query(
      'INSERT INTO customers (first_name, last_name, email, phone, dob, address) VALUES (?,?,?,?,?,?)',
      [first_name, last_name || null, email, phone, dob || null, address || null]
    );
    const [rows] = await db.query('SELECT * FROM customers WHERE customer_id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Email or phone already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, dob, address } = req.body;
    await db.query(
      'UPDATE customers SET first_name=?, last_name=?, email=?, phone=?, dob=?, address=? WHERE customer_id=?',
      [first_name, last_name, email, phone, dob, address, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM customers WHERE customer_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Email or phone already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM customers WHERE customer_id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
