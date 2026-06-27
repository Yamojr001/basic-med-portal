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
      academic_calendar: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_archived: boolean
          session: string | null
          start_date: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_archived?: boolean
          session?: string | null
          start_date: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_archived?: boolean
          session?: string | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          is_archived: boolean
          is_pinned: boolean
          publish_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          publish_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          publish_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credit_unit: number
          department_id: string
          description: string | null
          id: string
          lecturer: string | null
          level: number
          objectives: string | null
          semester: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credit_unit?: number
          department_id: string
          description?: string | null
          id?: string
          lecturer?: string | null
          level: number
          objectives?: string | null
          semester: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credit_unit?: number
          department_id?: string
          description?: string | null
          id?: string
          lecturer?: string | null
          level?: number
          objectives?: string | null
          semester?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          head_of_department: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          head_of_department?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          head_of_department?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          image_url: string | null
          title: string
          venue: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      exam_timetable: {
        Row: {
          course_code: string
          course_title: string | null
          created_at: string
          department_id: string
          end_time: string
          exam_date: string
          id: string
          level: number
          semester: string
          start_time: string
          venue: string | null
        }
        Insert: {
          course_code: string
          course_title?: string | null
          created_at?: string
          department_id: string
          end_time: string
          exam_date: string
          id?: string
          level: number
          semester: string
          start_time: string
          venue?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string | null
          created_at?: string
          department_id?: string
          end_time?: string
          exam_date?: string
          id?: string
          level?: number
          semester?: string
          start_time?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_timetable_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      lecture_timetable: {
        Row: {
          course_code: string
          course_title: string | null
          created_at: string
          day_of_week: string
          department_id: string
          end_time: string
          id: string
          lecturer: string | null
          level: number
          semester: string
          start_time: string
          venue: string | null
        }
        Insert: {
          course_code: string
          course_title?: string | null
          created_at?: string
          day_of_week: string
          department_id: string
          end_time: string
          id?: string
          lecturer?: string | null
          level: number
          semester: string
          start_time: string
          venue?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string | null
          created_at?: string
          day_of_week?: string
          department_id?: string
          end_time?: string
          id?: string
          lecturer?: string | null
          level?: number
          semester?: string
          start_time?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecture_timetable_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          matric_number: string | null
          passed: boolean
          percentage: number
          quiz_id: string
          score: number
          student_name: string | null
          total_points: number
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          matric_number?: string | null
          passed: boolean
          percentage: number
          quiz_id: string
          score: number
          student_name?: string | null
          total_points: number
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          matric_number?: string | null
          passed?: boolean
          percentage?: number
          quiz_id?: string
          score?: number
          student_name?: string | null
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          id: string
          options: Json | null
          points: number
          question_text: string
          question_type: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          correct_answer: string
          id?: string
          options?: Json | null
          points?: number
          question_text: string
          question_type: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          correct_answer?: string
          id?: string
          options?: Json | null
          points?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_published: boolean
          level: number | null
          passing_score: number
          semester: string | null
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          level?: number | null
          passing_score?: number
          semester?: string | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          level?: number | null
          passing_score?: number
          semester?: string | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          course_id: string
          created_at: string
          description: string | null
          download_count: number
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          course_id: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          course_id?: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          about: string | null
          address: string | null
          banner_url: string | null
          contact_email: string | null
          contact_phone: string | null
          dean_image_url: string | null
          dean_message: string | null
          dean_name: string | null
          dean_title: string | null
          faculty_name: string
          footer_text: string | null
          history: string | null
          id: number
          logo_url: string | null
          mission: string | null
          seo_description: string | null
          seo_title: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          university_name: string
          updated_at: string
          vision: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          dean_image_url?: string | null
          dean_message?: string | null
          dean_name?: string | null
          dean_title?: string | null
          faculty_name?: string
          footer_text?: string | null
          history?: string | null
          id?: number
          logo_url?: string | null
          mission?: string | null
          seo_description?: string | null
          seo_title?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          university_name?: string
          updated_at?: string
          vision?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          dean_image_url?: string | null
          dean_message?: string | null
          dean_name?: string | null
          dean_title?: string | null
          faculty_name?: string
          footer_text?: string | null
          history?: string | null
          id?: number
          logo_url?: string | null
          mission?: string | null
          seo_description?: string | null
          seo_title?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          university_name?: string
          updated_at?: string
          vision?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      quiz_questions_public: {
        Row: {
          id: string | null
          options: Json | null
          points: number | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string | null
          options?: Json | null
          points?: number | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string | null
          options?: Json | null
          points?: number | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
