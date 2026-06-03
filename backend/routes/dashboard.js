const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/stats', async (req, res) => {
  try {
    const [[{ totalCustomers }]] = await db.query('SELECT COUNT(*) AS totalCustomers FROM customers');
    const [[{ totalAccounts }]] = await db.query('SELECT COUNT(*) AS totalAccounts FROM accounts');
    const [[{ activeAccounts }]] = await db.query("SELECT COUNT(*) AS activeAccounts FROM accounts WHERE status='Active'");
    const [[{ totalBalance }]] = await db.query('SELECT COALESCE(SUM(balance),0) AS totalBalance FROM accounts');
    const [[{ totalTransactions }]] = await db.query('SELECT COUNT(*) AS totalTransactions FROM transactions');
    const [[{ totalLoans }]] = await db.query('SELECT COUNT(*) AS totalLoans FROM loans');
    const [[{ pendingLoans }]] = await db.query("SELECT COUNT(*) AS pendingLoans FROM loans WHERE loan_status='Pending'");
    const [[{ approvedLoans }]] = await db.query("SELECT COUNT(*) AS approvedLoans FROM loans WHERE loan_status='Approved'");
    const [[{ totalLoanAmount }]] = await db.query('SELECT COALESCE(SUM(principal_amount),0) AS totalLoanAmount FROM loans');
    const [[{ totalEmployees }]] = await db.query('SELECT COUNT(*) AS totalEmployees FROM employees');
    const [[{ totalBranches }]] = await db.query('SELECT COUNT(*) AS totalBranches FROM branches');
    const [[{ todayTransactions }]] = await db.query(
      "SELECT COUNT(*) AS todayTransactions FROM transactions WHERE DATE(transaction_time)=CURDATE()"
    );
    const [[{ highValueTxn }]] = await db.query(
      "SELECT COUNT(*) AS highValueTxn FROM transactions WHERE amount > 100000"
    );

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalAccounts,
        activeAccounts,
        totalBalance: Number(totalBalance),
        totalTransactions,
        totalLoans,
        pendingLoans,
        approvedLoans,
        totalLoanAmount: Number(totalLoanAmount),
        totalEmployees,
        totalBranches,
        todayTransactions,
        highValueTxn,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/top-customers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.customer_id,
             CONCAT(c.first_name,' ',c.last_name) AS customer_name,
             c.email,
             SUM(a.balance) AS total_balance,
             COUNT(a.account_id) AS account_count
      FROM customers c
      JOIN accounts a ON c.customer_id=a.customer_id
      GROUP BY c.customer_id
      ORDER BY total_balance DESC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/transaction-trends', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(transaction_time) AS date,
             COUNT(*) AS count,
             COALESCE(SUM(amount),0) AS volume
      FROM transactions
      WHERE transaction_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(transaction_time)
      ORDER BY date ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/account-status-breakdown', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT status, COUNT(*) AS count FROM accounts GROUP BY status
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/loan-analytics', async (req, res) => {
  try {
    const [byStatus] = await db.query(`
      SELECT loan_status, COUNT(*) AS total_loans, COALESCE(SUM(principal_amount),0) AS total_amount
      FROM loans GROUP BY loan_status
    `);
    const [byType] = await db.query(`
      SELECT loan_type, COUNT(*) AS count, COALESCE(SUM(principal_amount),0) AS total_amount
      FROM loans GROUP BY loan_type
    `);
    res.json({ success: true, data: { byStatus, byType } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/branch-analytics', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.branch_name, b.city,
             COUNT(DISTINCT e.employee_id) AS employee_count,
             COUNT(DISTINCT a.account_id) AS account_count,
             COALESCE(SUM(a.balance),0) AS total_deposits
      FROM branches b
      LEFT JOIN employees e ON b.branch_id=e.branch_id AND e.status='Active'
      LEFT JOIN accounts a ON b.branch_id=a.branch_id AND a.status='Active'
      GROUP BY b.branch_id
      ORDER BY total_deposits DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/recent-transactions', async (req, res) => {
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
      ORDER BY t.transaction_time DESC LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
