-- Добавляем CASCADE DELETE для внешних ключей

-- Удаляем старые внешние ключи
ALTER TABLE columns DROP CONSTRAINT IF EXISTS fk_board_id;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_column_id;

-- Добавляем новые внешние ключи с CASCADE DELETE
ALTER TABLE columns 
ADD CONSTRAINT fk_board_id 
FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;

ALTER TABLE tasks 
ADD CONSTRAINT fk_column_id 
FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE;
