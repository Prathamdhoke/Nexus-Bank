const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT l.*,
                        CONCAT(c.first_name,' ',c.last_name) AS customer_name,
                        c.email AS customer_email,
                        CONCAT(e.first_name,' ',e.last_name) AS approved_by_name
                 FROM loans l
                 JOIN customers c ON l.customer_id=c.customer_id
                 LEFT JOIN employees e ON l.approved_by=e.employee_id
                 WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND l.loan_status=?'; params.push(status); }
    if (type) { query += ' AND l.loan_type=?'; params.push(type); }
    if (search) {
      query += ' AND (l.loan_reference LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY l.loan_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM loans');
    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*,
              CONCAT(c.first_name,' ',c.last_name) AS customer_name,
              c.email, c.phone,
              CONCAT(e.first_name,' ',e.last_name) AS approved_by_name
       FROM loans l
       JOIN customers c ON l.customer_id=c.customer_id
       LEFT JOIN employees e ON l.approved_by=e.employee_id
       WHERE l.loan_id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Loan not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { loan_reference, customer_id, loan_type, principal_amount, interest_rate, tenure_months, monthly_emi, remaining_balance } = req.body;
    if (!loan_reference || !customer_id || !loan_type || !principal_amount || !interest_rate || !tenure_months) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const [result] = await db.query(
      `INSERT INTO loans (loan_reference, customer_id, loan_type, principal_amount, interest_rate, tenure_months, monthly_emi, remaining_balance, loan_status)
       VALUES (?,?,?,?,?,?,?,?,'Pending')`,
      [loan_reference, customer_id, loan_type, principal_amount, interest_rate, tenure_months, monthly_emi || null, remaining_balance || principal_amount]
    );
    const [rows] = await db.query('SELECT * FROM loans WHERE loan_id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Loan reference already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { loan_status, approved_by } = req.body;
    const allowed = ['Pending', 'Approved', 'Rejected', 'Closed'];
    if (!allowed.includes(loan_status)) {
      return res.status(400).json({ success: false, error: 'Invalid loan_status' });
    }
    await db.query(
      'UPDATE loans SET loan_status=?, approved_by=? WHERE loan_id=?',
      [loan_status, approved_by || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM loans WHERE loan_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Loan not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM loans WHERE loan_id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Loan not found' });
    res.json({ success: true, message: 'Loan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
