export type ColumnInterface = {
  id: string;
  title: string;
  order: number;
  boardId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};
