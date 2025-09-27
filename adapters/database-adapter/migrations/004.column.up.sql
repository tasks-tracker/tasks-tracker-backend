CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  order_number INT NOT NULL,
  board_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_board_owner FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT fk_board_id FOREIGN KEY (board_id) REFERENCES boards(id)
);