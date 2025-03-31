export interface TodoSchema {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  is_deleted: boolean;
  deadline?: Date;
  owner_id: string;
}
