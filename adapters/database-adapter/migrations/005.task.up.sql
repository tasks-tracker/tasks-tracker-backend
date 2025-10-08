CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_number INT NOT NULL,
  column_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_column_owner FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT fk_column_id FOREIGN KEY (column_id) REFERENCES columns(id)
);