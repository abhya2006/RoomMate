ALTER TABLE users
    ADD COLUMN full_name VARCHAR(120) NULL,
    ADD COLUMN phone_number VARCHAR(15) NULL,
    ADD COLUMN aadhaar_hash VARCHAR(64) NULL,
    ADD COLUMN aadhaar_last_four VARCHAR(4) NULL,
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN digilocker_verified BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users
SET full_name = username,
    phone_number = CONCAT('000000', LPAD(id, 4, '0')),
    aadhaar_hash = SHA2(CONCAT('legacy:', id), 256),
    aadhaar_last_four = '0000'
WHERE full_name IS NULL;

ALTER TABLE users
    MODIFY full_name VARCHAR(120) NOT NULL,
    MODIFY phone_number VARCHAR(15) NOT NULL,
    MODIFY aadhaar_hash VARCHAR(64) NOT NULL,
    MODIFY aadhaar_last_four VARCHAR(4) NOT NULL,
    ADD CONSTRAINT uk_users_phone_number UNIQUE (phone_number),
    ADD CONSTRAINT uk_users_aadhaar_hash UNIQUE (aadhaar_hash);
