USE banking_system;

-- =========================================
-- SCHEMA VERIFICATION QUERIES
-- =========================================

SHOW TABLES;

DESC customers;

DESC accounts;

DESC transactions;

SHOW CREATE TABLE accounts;

SHOW CREATE TABLE transactions;

-- =========================================
-- TRANSACTION VERIFICATION QUERIES
-- =========================================

SELECT
    account_id,
    account_number,
    balance
FROM accounts
WHERE account_id IN (1,2);

SELECT
    transaction_reference,
    sender_account_id,
    receiver_account_id,
    amount,
    status,
    transaction_time
FROM transactions
ORDER BY transaction_id DESC;

-- =========================================
-- TRIGGER VERIFICATION QUERIES
-- =========================================

SHOW TRIGGERS;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 1;

SELECT
    account_id,
    old_balance,
    new_balance,
    action_type,
    updated_at
FROM audit_logs
ORDER BY log_id DESC;

-- =========================================
-- STORED PROCEDURE TEST
-- =========================================

CALL TransferMoney(
    1,
    2,
    3000,
    'UPI'
);

-- Verify updated balances

SELECT
    account_id,
    account_number,
    balance
FROM accounts
WHERE account_id IN (1,2);

-- Verify transaction log entry

SELECT
    transaction_reference,
    sender_account_id,
    receiver_account_id,
    amount,
    transaction_type,
    transaction_mode,
    status,
    transaction_time
FROM transactions
ORDER BY transaction_id DESC
LIMIT 1;