export type TaskInterface = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
};
