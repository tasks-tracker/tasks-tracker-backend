CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL,
  is_deleted BOOLEAN NOT NULL,
  deadline TIMESTAMP,
  owner_id UUID NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES "users"(id)
);
