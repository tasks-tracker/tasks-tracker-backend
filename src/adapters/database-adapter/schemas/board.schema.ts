export interface BoardSchema {
  id: string;
  title: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface ColumnSchema {
  id: string;
  title: string;
  order_number: number;
  board_id: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface TaskSchema {
  id: string;
  title: string;
  description: string;
  order_number: number;
  column_id: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  is_removed: boolean;
}
