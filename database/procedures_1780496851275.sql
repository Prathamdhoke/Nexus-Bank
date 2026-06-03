USE banking_system;

DELIMITER //

CREATE PROCEDURE TransferMoney(
	IN p_sender INT,
    IN p_receiver INT,
    IN p_amount DECIMAL(12,2),
    IN p_mode VARCHAR(20)
)
BEGIN
	
    DECLARE sender_balance DECIMAL(12,2);
    
    DECLARE sender_status VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
	END;
    
    START TRANSACTION;
    
    SELECT balance,status
    INTO sender_balance,sender_status
    FROM accounts
    WHERE account_id = p_sender;
    
    IF sender_status != 'Active' THEN
		
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Sender account is not active';
        
	END IF;
    
    IF sender_balance < p_amount THEN
    
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient balance';
        
	END IF;
    
    UPDATE accounts
    SET balance = balance - p_amount
    WHERE account_id = p_sender;
    
    UPDATE accounts
    SET balance = balance + p_amount
    WHERE account_id = p_receiver;
    
    INSERT INTO transactions (
        transaction_reference,
        sender_account_id,
        receiver_account_id,
        amount,
        transaction_type,
        transaction_mode,
        status,
        remarks
    )
    VALUES (
        CONCAT('TXN', UNIX_TIMESTAMP()),
        p_sender,
        p_receiver,
        p_amount,
        'Transfer',
        p_mode,
        'Success',
        'Stored procedure transfer'
    );

    COMMIT;

END //

DELIMITER ;

