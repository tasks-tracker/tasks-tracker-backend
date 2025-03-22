export enum MigrationDirection {
  UP = 'up',
  DOWN = 'down',
}

export enum MigrationStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  UNKNOWN = 'UNKNOWN',
}

export interface Migration {
  number: number;
  name: string;
  direction: MigrationDirection;
  status: MigrationStatus;
}
