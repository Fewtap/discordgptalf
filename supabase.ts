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
      messages: {
        Row: {
          created_at: string
          id: number
          message: string
          role: string | null
          userid: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          role?: string | null
          userid: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          role?: string | null
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_userid_fkey"
            columns: ["userid"]
            referencedRelation: "users"
            referencedColumns: ["userid"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          eyes: boolean
          userid: string
        }
        Insert: {
          created_at?: string
          eyes?: boolean
          userid: string
        }
        Update: {
          created_at?: string
          eyes?: boolean
          userid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
