CREATE TABLE revoked_tokens (
    token_hash CHAR(64) PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);
