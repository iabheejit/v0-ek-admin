export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          joined_date: string
          current_day: number
          current_module: number
          last_active: string
          status: string
          course: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          joined_date?: string
          current_day?: number
          current_module?: number
          last_active?: string
          status?: string
          course?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          joined_date?: string
          current_day?: number
          current_module?: number
          last_active?: string
          status?: string
          course?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      days: {
        Row: {
          id: string
          course_id: string
          day_number: number
          topic: string | null
        }
        Insert: {
          id?: string
          course_id: string
          day_number: number
          topic?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          day_number?: number
          topic?: string | null
        }
      }
      modules: {
        Row: {
          id: string
          day_id: string
          module_number: number
          title: string
          text: string | null
          question: string | null
          answer_options: Json
          correct_answer: string | null
          next_action: string
        }
        Insert: {
          id?: string
          day_id: string
          module_number: number
          title: string
          text?: string | null
          question?: string | null
          answer_options?: Json
          correct_answer?: string | null
          next_action?: string
        }
        Update: {
          id?: string
          day_id?: string
          module_number?: number
          title?: string
          text?: string | null
          question?: string | null
          answer_options?: Json
          correct_answer?: string | null
          next_action?: string
        }
      }
      media_files: {
        Row: {
          id: string
          module_id: string
          name: string
          file_path: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          name: string
          file_path: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          name?: string
          file_path?: string
          file_type?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          content: string
          timestamp: string
          is_from_user: boolean
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          timestamp?: string
          is_from_user?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          timestamp?: string
          is_from_user?: boolean
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          module_id: string | null
          day_number: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          module_id?: string | null
          day_number?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          module_id?: string | null
          day_number?: number | null
          timestamp?: string
        }
      }
      question_responses: {
        Row: {
          id: string
          user_id: string
          module_id: string
          question: string
          user_answer: string
          is_correct: boolean
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          question: string
          user_answer: string
          is_correct?: boolean
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          question?: string
          user_answer?: string
          is_correct?: boolean
          timestamp?: string
        }
      }
    }
  }
}
