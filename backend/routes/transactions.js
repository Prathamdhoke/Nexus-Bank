const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { type, status, mode, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT t.*,
                        sa.account_number AS sender_account_number,
                        ra.account_number AS receiver_account_number,
                        CONCAT(sc.first_name,' ',sc.last_name) AS sender_name,
                        CONCAT(rc.first_name,' ',rc.last_name) AS receiver_name
                 FROM transactions t
                 LEFT JOIN accounts sa ON t.sender_account_id=sa.account_id
                 LEFT JOIN accounts ra ON t.receiver_account_id=ra.account_id
                 LEFT JOIN customers sc ON sa.customer_id=sc.customer_id
                 LEFT JOIN customers rc ON ra.customer_id=rc.customer_id
                 WHERE 1=1`;
    const params = [];
    if (type) { query += ' AND t.transaction_type=?'; params.push(type); }
    if (status) { query += ' AND t.status=?'; params.push(status); }
    if (mode) { query += ' AND t.transaction_mode=?'; params.push(mode); }
    if (search) {
      query += ' AND (t.transaction_reference LIKE ? OR sa.account_number LIKE ? OR ra.account_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY t.transaction_time DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM transactions');
    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*,
              sa.account_number AS sender_account_number,
              ra.account_number AS receiver_account_number
       FROM transactions t
       LEFT JOIN accounts sa ON t.sender_account_id=sa.account_id
       LEFT JOIN accounts ra ON t.receiver_account_id=ra.account_id
       WHERE t.transaction_id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transfer', async (req, res) => {
  try {
    const { sender_account_id, receiver_account_id, amount, mode } = req.body;
    if (!sender_account_id || !receiver_account_id || !amount || !mode) {
      return res.status(400).json({ success: false, error: 'sender_account_id, receiver_account_id, amount, mode are required' });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
    }
    if (sender_account_id === receiver_account_id) {
      return res.status(400).json({ success: false, error: 'Sender and receiver cannot be the same account' });
    }
    await db.query('CALL TransferMoney(?, ?, ?, ?)', [
      sender_account_id,
      receiver_account_id,
      Number(amount),
      mode,
    ]);
    const [rows] = await db.query(
      'SELECT * FROM transactions ORDER BY transaction_id DESC LIMIT 1'
    );
    res.status(201).json({ success: true, message: 'Transfer successful', data: rows[0] });
  } catch (err) {
    const msg = err.sqlMessage || err.message;
    res.status(400).json({ success: false, error: msg });
  }
});

router.post('/deposit', async (req, res) => {
  try {
    const { account_id, amount, mode, remarks } = req.body;
    if (!account_id || !amount || !mode) {
      return res.status(400).json({ success: false, error: 'account_id, amount, mode required' });
    }
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('UPDATE accounts SET balance = balance + ? WHERE account_id=?', [amount, account_id]);
      const ref = `TXN${Date.now()}`;
      await conn.query(
        `INSERT INTO transactions (transaction_reference, receiver_account_id, amount, transaction_type, transaction_mode, status, remarks)
         VALUES (?,?,?,'Deposit',?,'Success',?)`,
        [ref, account_id, amount, mode, remarks || 'Deposit']
      );
      await conn.commit();
      const [rows] = await conn.query('SELECT * FROM transactions WHERE transaction_reference=?', [ref]);
      res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/withdraw', async (req, res) => {
  try {
    const { account_id, amount, mode, remarks } = req.body;
    if (!account_id || !amount || !mode) {
      return res.status(400).json({ success: false, error: 'account_id, amount, mode required' });
    }
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [[acc]] = await conn.query('SELECT balance, status FROM accounts WHERE account_id=?', [account_id]);
      if (!acc) throw new Error('Account not found');
      if (acc.status !== 'Active') throw new Error('Account is not active');
      if (acc.balance < amount) throw new Error('Insufficient balance');
      await conn.query('UPDATE accounts SET balance = balance - ? WHERE account_id=?', [amount, account_id]);
      const ref = `TXN${Date.now()}`;
      await conn.query(
        `INSERT INTO transactions (transaction_reference, sender_account_id, amount, transaction_type, transaction_mode, status, remarks)
         VALUES (?,?,?,'Withdraw',?,'Success',?)`,
        [ref, account_id, amount, mode, remarks || 'Withdrawal']
      );
      await conn.commit();
      const [rows] = await conn.query('SELECT * FROM transactions WHERE transaction_reference=?', [ref]);
      res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
      await conn.rollback();
      res.status(400).json({ success: false, error: e.message });
      return;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
