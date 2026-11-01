CREATE TABLE app_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schema_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_metadata (schema_version)
VALUES ('1');
