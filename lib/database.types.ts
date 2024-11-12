export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          status: string | null
          phone: string | null
          age: number | null
          marital_status: string | null
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          status?: string | null
          phone?: string | null
          age?: number | null
          marital_status?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          status?: string | null
          phone?: string | null
          age?: number | null
          marital_status?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          channel_id: string
          parent_id: string | null
          created_at: string
          updated_at: string
          mentions: string[]
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          channel_id: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          mentions?: string[]
        }
        Update: {
          id?: string
          content?: string
          sender_id?: string
          channel_id?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          mentions?: string[]
        }
      }
      channels: {
        Row: {
          id: string
          name: string
          description: string | null
          is_private: boolean
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_private?: boolean
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_private?: boolean
          created_at?: string
          created_by?: string
        }
      }
    }
  }
}