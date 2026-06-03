const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/customer-account-summary', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customer_account_summary');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/loan-summary', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM loan_summary');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/frozen-closed-accounts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, CONCAT(c.first_name,' ',c.last_name) AS customer_name, b.branch_name
      FROM accounts a
      JOIN customers c ON a.customer_id=c.customer_id
      JOIN branches b ON a.branch_id=b.branch_id
      WHERE a.status IN ('Frozen','Closed')
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/high-value-transactions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*,
             sa.account_number AS sender_account_number,
             ra.account_number AS receiver_account_number,
             CONCAT(sc.first_name,' ',sc.last_name) AS sender_name,
             CONCAT(rc.first_name,' ',rc.last_name) AS receiver_name
      FROM transactions t
      LEFT JOIN accounts sa ON t.sender_account_id=sa.account_id
      LEFT JOIN accounts ra ON t.receiver_account_id=ra.account_id
      LEFT JOIN customers sc ON sa.customer_id=sc.customer_id
      LEFT JOIN customers rc ON ra.customer_id=rc.customer_id
      WHERE t.amount > 100000
      ORDER BY t.amount DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/branch-wise-deposits', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.branch_name, b.city, SUM(a.balance) AS total_branch_balance
      FROM branches b
      JOIN accounts a ON b.branch_id=a.branch_id
      GROUP BY b.branch_id
      ORDER BY total_branch_balance DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
