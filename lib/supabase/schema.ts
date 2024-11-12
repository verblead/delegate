// Add to existing types
export interface DirectMessage {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectMessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
}