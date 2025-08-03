export interface BoardSchema {
  id: string;
  title: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}
