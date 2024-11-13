export interface BaseMessage {
  id: string;
  content: string;
  sender_id: string;
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
}

export interface DirectMessage extends BaseMessage {
  recipient_id: string;
  read: boolean;
}

export type Message = ChannelMessage | DirectMessage; 