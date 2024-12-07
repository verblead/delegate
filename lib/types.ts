export interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at?: string;
}

export interface BaseMessage {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string;
  };
  attachments?: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    url: string;
  }[];
}

export interface ChannelMessage extends BaseMessage {
  channel_id: string;
  sender_id: string;
}

export interface DirectMessage extends BaseMessage {
  recipient_id: string;
  sender_id: string;
  read: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  // ... other achievement properties ...
}