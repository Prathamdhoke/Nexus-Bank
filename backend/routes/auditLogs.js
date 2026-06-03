const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { account_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT al.*,
                        a.account_number,
                        CONCAT(c.first_name,' ',c.last_name) AS customer_name
                 FROM audit_logs al
                 LEFT JOIN accounts a ON al.account_id=a.account_id
                 LEFT JOIN customers c ON a.customer_id=c.customer_id
                 WHERE 1=1`;
    const params = [];
    if (account_id) { query += ' AND al.account_id=?'; params.push(account_id); }
    query += ' ORDER BY al.updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM audit_logs');
    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
