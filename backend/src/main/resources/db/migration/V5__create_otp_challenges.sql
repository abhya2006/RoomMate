CREATE TABLE otp_challenges (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    email_otp_hash VARCHAR(64) NOT NULL,
    phone_otp_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    verified_at TIMESTAMP NULL,
    CONSTRAINT fk_otp_challenge_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_otp_challenge_user_id ON otp_challenges (user_id);
