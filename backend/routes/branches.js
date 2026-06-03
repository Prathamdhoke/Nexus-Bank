const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*,
             COUNT(DISTINCT e.employee_id) AS employee_count,
             COUNT(DISTINCT a.account_id) AS account_count,
             COALESCE(SUM(a.balance),0) AS total_balance
      FROM branches b
      LEFT JOIN employees e ON b.branch_id=e.branch_id AND e.status='Active'
      LEFT JOIN accounts a ON b.branch_id=a.branch_id AND a.status='Active'
      GROUP BY b.branch_id
      ORDER BY b.branch_id
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [branches] = await db.query('SELECT * FROM branches WHERE branch_id=?', [req.params.id]);
    if (!branches.length) return res.status(404).json({ success: false, error: 'Branch not found' });
    const [employees] = await db.query('SELECT * FROM employees WHERE branch_id=?', [req.params.id]);
    const [accounts] = await db.query(
      `SELECT a.*, CONCAT(c.first_name,' ',c.last_name) AS customer_name
       FROM accounts a JOIN customers c ON a.customer_id=c.customer_id
       WHERE a.branch_id=?`,
      [req.params.id]
    );
    res.json({ success: true, data: { ...branches[0], employees, accounts } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { branch_name, branch_code, IFSC_Code, city, state, manager_name, contact_number } = req.body;
    if (!branch_name || !branch_code || !IFSC_Code || !city || !state) {
      return res.status(400).json({ success: false, error: 'branch_name, branch_code, IFSC_Code, city, state required' });
    }
    const [result] = await db.query(
      'INSERT INTO branches (branch_name, branch_code, IFSC_Code, city, state, manager_name, contact_number) VALUES (?,?,?,?,?,?,?)',
      [branch_name, branch_code, IFSC_Code, city, state, manager_name || null, contact_number || null]
    );
    const [rows] = await db.query('SELECT * FROM branches WHERE branch_id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Branch code or IFSC already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { branch_name, city, state, manager_name, contact_number } = req.body;
    await db.query(
      'UPDATE branches SET branch_name=?, city=?, state=?, manager_name=?, contact_number=? WHERE branch_id=?',
      [branch_name, city, state, manager_name, contact_number, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM branches WHERE branch_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Branch not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
