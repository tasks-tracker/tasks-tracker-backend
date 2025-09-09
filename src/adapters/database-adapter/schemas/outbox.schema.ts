export interface OutboxSchema {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  event_type: string;
  event_data: string;
  created_at: Date;
  processed_at: Date | null;
  retry_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
