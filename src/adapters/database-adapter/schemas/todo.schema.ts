export interface TodoSchema {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  is_deleted: boolean;
  deadline: Date | null;
  owner_id: string;
}
