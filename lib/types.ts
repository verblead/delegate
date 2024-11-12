export interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}