export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      arguments: {
        Row: {
          created_at: string
          example: string | null
          id: string
          reasoning: string | null
          source: string | null
          subject: string
          tags: string[]
          thesis: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          example?: string | null
          id?: string
          reasoning?: string | null
          source?: string | null
          subject: string
          tags?: string[]
          thesis: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          example?: string | null
          id?: string
          reasoning?: string | null
          source?: string | null
          subject?: string
          tags?: string[]
          thesis?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brain_dumps: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      editorial_topics: {
        Row: {
          created_at: string
          freshness: string
          id: string
          last_reviewed_at: string | null
          subject: string
          subtopic: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          freshness?: string
          id?: string
          last_reviewed_at?: string | null
          subject: string
          subtopic?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          freshness?: string
          id?: string
          last_reviewed_at?: string | null
          subject?: string
          subtopic?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      error_entries: {
        Row: {
          alt_a: string | null
          alt_b: string | null
          alt_c: string | null
          alt_d: string | null
          alt_e: string | null
          answer_mirror: string | null
          comments: string | null
          correct_answer: string | null
          created_at: string
          enunciation: string
          error_tags: string[]
          id: string
          last_reviewed_at: string | null
          question_type: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alt_a?: string | null
          alt_b?: string | null
          alt_c?: string | null
          alt_d?: string | null
          alt_e?: string | null
          answer_mirror?: string | null
          comments?: string | null
          correct_answer?: string | null
          created_at?: string
          enunciation: string
          error_tags?: string[]
          id?: string
          last_reviewed_at?: string | null
          question_type: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alt_a?: string | null
          alt_b?: string | null
          alt_c?: string | null
          alt_d?: string | null
          alt_e?: string | null
          answer_mirror?: string | null
          comments?: string | null
          correct_answer?: string | null
          created_at?: string
          enunciation?: string
          error_tags?: string[]
          id?: string
          last_reviewed_at?: string | null
          question_type?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          alternatives: Json
          correct_answer: string | null
          created_at: string
          difficulty: string
          enunciation: string
          exam_name: string | null
          explanation: string | null
          id: string
          last_answered_at: string | null
          subject: string
          times_answered: number
          times_correct: number
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          alternatives?: Json
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          enunciation: string
          exam_name?: string | null
          explanation?: string | null
          id?: string
          last_answered_at?: string | null
          subject: string
          times_answered?: number
          times_correct?: number
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          alternatives?: Json
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          enunciation?: string
          exam_name?: string | null
          explanation?: string | null
          id?: string
          last_answered_at?: string | null
          subject?: string
          times_answered?: number
          times_correct?: number
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      gamification: {
        Row: {
          badges: string[]
          current_streak: number
          last_activity_date: string | null
          level: number
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges?: string[]
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges?: string[]
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      productivity_records: {
        Row: {
          created_at: string
          duration_seconds: number
          ended_at: string
          focus: string | null
          id: string
          session_name: string
          started_at: string
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          ended_at?: string
          focus?: string | null
          id?: string
          session_name: string
          started_at?: string
          status: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string
          focus?: string | null
          id?: string
          session_name?: string
          started_at?: string
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      smart_review_questions: {
        Row: {
          answer: string
          created_at: string
          id: string
          last_reviewed_at: string | null
          question: string
          subject: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          question: string
          subject: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          question?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      study_calendar: {
        Row: {
          day: string
          duration_seconds: number
          id: string
          user_id: string
        }
        Insert: {
          day: string
          duration_seconds?: number
          id?: string
          user_id: string
        }
        Update: {
          day?: string
          duration_seconds?: number
          id?: string
          user_id?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
