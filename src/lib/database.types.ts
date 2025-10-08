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
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_key: 'A' | 'B' | 'C'
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_key: 'A' | 'B' | 'C'
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_key?: 'A' | 'B' | 'C'
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          order_index: number
          default_sets: number
          default_reps: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          order_index?: number
          default_sets?: number
          default_reps?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          order_index?: number
          default_sets?: number
          default_reps?: number
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          workout_date: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          workout_date: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          workout_date?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exercise_logs: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          set_number: number
          weight: number
          reps: number
          completed: boolean
          rest_time: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          set_number: number
          weight?: number
          reps?: number
          completed?: boolean
          rest_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          set_number?: number
          weight?: number
          reps?: number
          completed?: boolean
          rest_time?: number
          created_at?: string
        }
      }
    }
  }
}
