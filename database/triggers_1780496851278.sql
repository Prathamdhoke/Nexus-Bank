USE banking_system;

DELIMITER //

CREATE TRIGGER prevent_negative_balance

BEFORE UPDATE
ON accounts

FOR EACH ROW

BEGIN 
	
    IF NEW.balance < 0 THEN
		
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Balance cannot be negative';
        
	END IF;
    
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER account_audit_trigger

AFTER UPDATE
ON accounts

FOR EACH ROW

BEGIN

    INSERT INTO audit_logs (

        account_id,
        old_balance,
        new_balance,
        action_type

    )
    VALUES (

        OLD.account_id,
        OLD.balance,
        NEW.balance,
        'BALANCE_UPDATE'

    );

END //

DELIMITER ;

