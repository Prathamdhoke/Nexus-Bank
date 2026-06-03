USE banking_system;

CREATE VIEW customer_account_summary AS

SELECT 
	
    c.customer_id,
    
    CONCAT(
		c.first_name,
        ' ',
        c.last_name
    )AS customer_name,
    
    a.account_number,
    a.account_type,
    a.balance,
    a.status,
    b.branch_name,
    b.city
    
FROM customers c

JOIN accounts a
ON c.customer_id = a.customer_id

JOIN branches b
ON a.branch_id = b.branch_id;

CREATE VIEW loan_summary AS

SELECT

    l.loan_reference,

    CONCAT(
        c.first_name,
        ' ',
        c.last_name
    ) AS customer_name,

    l.loan_type,

    l.principal_amount,

    l.interest_rate,

    l.loan_status,

    CONCAT(
        e.first_name,
        ' ',
        e.last_name
    ) AS approved_by

FROM loans l

JOIN customers c
ON l.customer_id = c.customer_id

LEFT JOIN employees e
ON l.approved_by = e.employee_id;


SELECT * FROM customer_account_summary;
SELECT * FROM loan_summary;