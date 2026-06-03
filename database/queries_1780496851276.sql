USE banking_system;

-- Top 5 Richest Customers 

SELECT

    c.customer_id,

    CONCAT(
        c.first_name,
        ' ',
        c.last_name
    ) AS customer_name,

    SUM(a.balance) AS total_balance

FROM customers c

JOIN accounts a
ON c.customer_id = a.customer_id

GROUP BY c.customer_id

ORDER BY total_balance DESC

LIMIT 5;

-- Branch With Highest Deposits 

SELECT

    b.branch_name,

    SUM(a.balance) AS total_branch_balance

FROM branches b

JOIN accounts a
ON b.branch_id = a.branch_id

GROUP BY b.branch_id

ORDER BY total_branch_balance DESC;

-- Customers With Multiple Accounts 

SELECT

    customer_id,

    COUNT(*) AS total_accounts

FROM accounts

GROUP BY customer_id

HAVING COUNT(*) > 1;

--  Frozen or Closed Accounts

SELECT *

FROM accounts

WHERE status IN ('Frozen', 'Closed');

-- High Value Transactions 

SELECT *

FROM transactions

WHERE amount > 100000;

-- Loan Approval Analytics 

SELECT

    loan_status,

    COUNT(*) AS total_loans

FROM loans

GROUP BY loan_status;

-- Branch-Wise Employee Count 

SELECT

    b.branch_name,

    COUNT(e.employee_id) AS employee_count

FROM branches b

LEFT JOIN employees e
ON b.branch_id = e.branch_id

GROUP BY b.branch_id;

-- Audit Log History 

SELECT *

FROM audit_logs

ORDER BY updated_at DESC;