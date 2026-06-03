const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT a.*, CONCAT(c.first_name,' ',c.last_name) AS customer_name, b.branch_name
                 FROM accounts a
                 JOIN customers c ON a.customer_id=c.customer_id
                 JOIN branches b ON a.branch_id=b.branch_id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND a.status=?'; params.push(status); }
    if (type) { query += ' AND a.account_type=?'; params.push(type); }
    if (search) {
      query += ' AND (a.account_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY a.account_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM accounts');
    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, CONCAT(c.first_name,' ',c.last_name) AS customer_name,
              c.email, c.phone, b.branch_name, b.city, b.IFSC_Code
       FROM accounts a
       JOIN customers c ON a.customer_id=c.customer_id
       JOIN branches b ON a.branch_id=b.branch_id
       WHERE a.account_id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Account not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT t.*,
              sa.account_number AS sender_account_number,
              ra.account_number AS receiver_account_number
       FROM transactions t
       LEFT JOIN accounts sa ON t.sender_account_id=sa.account_id
       LEFT JOIN accounts ra ON t.receiver_account_id=ra.account_id
       WHERE t.sender_account_id=? OR t.receiver_account_id=?
       ORDER BY t.transaction_time DESC LIMIT ? OFFSET ?`,
      [req.params.id, req.params.id, Number(limit), Number(offset)]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { account_number, customer_id, branch_id, account_type, balance, minimum_balance, status } = req.body;
    if (!account_number || !customer_id || !branch_id || !account_type) {
      return res.status(400).json({ success: false, error: 'account_number, customer_id, branch_id, account_type required' });
    }
    const [result] = await db.query(
      'INSERT INTO accounts (account_number, customer_id, branch_id, account_type, balance, minimum_balance, status) VALUES (?,?,?,?,?,?,?)',
      [account_number, customer_id, branch_id, account_type, balance || 0, minimum_balance || 1000, status || 'Active']
    );
    const [rows] = await db.query('SELECT * FROM accounts WHERE account_id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Account number already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, minimum_balance } = req.body;
    await db.query(
      'UPDATE accounts SET status=?, minimum_balance=? WHERE account_id=?',
      [status, minimum_balance, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM accounts WHERE account_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Account not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
