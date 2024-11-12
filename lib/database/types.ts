export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: string;
  phone: string | null;
  age: number | null;
  marital_status: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  created_by: string;
}