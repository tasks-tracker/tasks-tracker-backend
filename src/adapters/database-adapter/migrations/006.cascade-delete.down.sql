-- Откат CASCADE DELETE для внешних ключей

-- Удаляем новые внешние ключи с CASCADE
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_column_id;
ALTER TABLE columns DROP CONSTRAINT IF EXISTS fk_board_id;

-- Восстанавливаем старые внешние ключи без CASCADE
ALTER TABLE columns 
ADD CONSTRAINT fk_board_id 
FOREIGN KEY (board_id) REFERENCES boards(id);

ALTER TABLE tasks 
ADD CONSTRAINT fk_column_id 
FOREIGN KEY (column_id) REFERENCES columns(id);
