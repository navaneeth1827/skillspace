export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          freelancer_id: string | null
          id: string
          job_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_all_day: boolean
          location: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          degree: string
          id: string
          school: string
          updated_at: string | null
          user_id: string
          year_range: string
        }
        Insert: {
          created_at?: string | null
          degree: string
          id?: string
          school: string
          updated_at?: string | null
          user_id: string
          year_range: string
        }
        Update: {
          created_at?: string | null
          degree?: string
          id?: string
          school?: string
          updated_at?: string | null
          user_id?: string
          year_range?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_application_status_history: {
        Row: {
          application_id: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          application_id?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status: string
        }
        Update: {
          application_id?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          availability_date: string | null
          cover_letter: string | null
          created_at: string | null
          expected_salary: string | null
          id: string
          interview_date: string | null
          job_id: string
          portfolio_url: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_date?: string | null
          cover_letter?: string | null
          created_at?: string | null
          expected_salary?: string | null
          id?: string
          interview_date?: string | null
          job_id: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_date?: string | null
          cover_letter?: string | null
          created_at?: string | null
          expected_salary?: string | null
          id?: string
          interview_date?: string | null
          job_id?: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_count: number | null
          application_instructions: string | null
          budget_max: number | null
          budget_min: number | null
          category: string
          company: string
          created_at: string | null
          deadline: string | null
          description: string
          id: string
          job_type: string
          location: string
          recruiter_id: string | null
          requirements: string | null
          salary: string
          skills: string[]
          status: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          application_count?: number | null
          application_instructions?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          company?: string
          created_at?: string | null
          deadline?: string | null
          description: string
          id?: string
          job_type?: string
          location?: string
          recruiter_id?: string | null
          requirements?: string | null
          salary?: string
          skills?: string[]
          status?: string | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          application_count?: number | null
          application_instructions?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          company?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          id?: string
          job_type?: string
          location?: string
          recruiter_id?: string | null
          requirements?: string | null
          salary?: string
          skills?: string[]
          status?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          link: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          location: string | null
          skills: string[] | null
          title: string | null
          updated_at: string | null
          user_type: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name: string
          hourly_rate?: number | null
          id: string
          location?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_type: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          location?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_type?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          completed_date: string | null
          created_at: string | null
          freelancer_id: string
          id: string
          job_title: string
          rating: number
          review_text: string | null
        }
        Insert: {
          client_id: string
          completed_date?: string | null
          created_at?: string | null
          freelancer_id: string
          id?: string
          job_title: string
          rating: number
          review_text?: string | null
        }
        Update: {
          client_id?: string
          completed_date?: string | null
          created_at?: string | null
          freelancer_id?: string
          id?: string
          job_title?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          project?: string | null
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          skill_id: string
          user_id: string
        }
        Insert: {
          skill_id: string
          user_id: string
        }
        Update: {
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recommended_jobs: {
        Args: {
          p_user_id: string
        }
        Returns: {
          application_count: number | null
          application_instructions: string | null
          budget_max: number | null
          budget_min: number | null
          category: string
          company: string
          created_at: string | null
          deadline: string | null
          description: string
          id: string
          job_type: string
          location: string
          recruiter_id: string | null
          requirements: string | null
          salary: string
          skills: string[]
          status: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
