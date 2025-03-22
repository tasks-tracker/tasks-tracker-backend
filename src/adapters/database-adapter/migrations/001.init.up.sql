CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_login UNIQUE (login),
  CONSTRAINT unique_user_email UNIQUE (email)
);
