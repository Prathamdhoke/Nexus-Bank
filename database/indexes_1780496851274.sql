USE banking_system;

CREATE INDEX idx_customer_email
ON customers(email);

CREATE INDEX idx_account_number
ON accounts(account_number);

CREATE INDEX idx_transaction_time
ON transactions(transaction_time);

CREATE INDEX idx_loan_status
ON loans(loan_status);

CREATE INDEX idx_branch_city
ON branches(city);

SHOW INDEX FROM customers;
SHOW INDEX FROM accounts;

EXPLAIN
SELECT *
FROM accounts
WHERE account_number = 'SBIN20260001';