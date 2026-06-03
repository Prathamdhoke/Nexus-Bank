USE banking_system;

START TRANSACTION;

UPDATE accounts
SET balance = balance - 5000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 5000
WHERE account_id = 2;

INSERT INTO transactions (
    transaction_reference,
    sender_account_id,
    receiver_account_id,
    amount,
    transaction_type,
    transaction_mode,
    status,
    remark
)
VALUES (
    'TXN20260001',
    1,
    2,
    5000,
    'Transfer',
    'UPI',
    'Success',
    'Initial fund transfer'
);

COMMIT;

