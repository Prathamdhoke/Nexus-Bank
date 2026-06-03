const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT e.*, b.branch_name, b.city
                 FROM employees e
                 JOIN branches b ON e.branch_id=b.branch_id
                 WHERE 1=1`;
    const params = [];
    if (role) { query += ' AND e.role=?'; params.push(role); }
    if (status) { query += ' AND e.status=?'; params.push(status); }
    if (search) {
      query += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.employee_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    query += ' ORDER BY e.employee_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM employees');
    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, b.branch_name, b.city, b.IFSC_Code
       FROM employees e JOIN branches b ON e.branch_id=b.branch_id
       WHERE e.employee_id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employee_code, first_name, last_name, email, phone, branch_id, role, salary, hire_date } = req.body;
    if (!employee_code || !first_name || !email || !phone || !branch_id || !role || !salary || !hire_date) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }
    const [result] = await db.query(
      'INSERT INTO employees (employee_code, first_name, last_name, email, phone, branch_id, role, salary, hire_date) VALUES (?,?,?,?,?,?,?,?,?)',
      [employee_code, first_name, last_name || null, email, phone, branch_id, role, salary, hire_date]
    );
    const [rows] = await db.query('SELECT * FROM employees WHERE employee_id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Employee code, email or phone already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, branch_id, role, salary, status } = req.body;
    await db.query(
      'UPDATE employees SET first_name=?, last_name=?, email=?, phone=?, branch_id=?, role=?, salary=?, status=? WHERE employee_id=?',
      [first_name, last_name, email, phone, branch_id, role, salary, status, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM employees WHERE employee_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM employees WHERE employee_id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
