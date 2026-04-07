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
      ad_applications: {
        Row: {
          ad_type: string
          clicks: number
          created_at: string
          id: string
          impressions: number
          spent: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_type: string
          clicks?: number
          created_at?: string
          id?: string
          impressions?: number
          spent?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_type?: string
          clicks?: number
          created_at?: string
          id?: string
          impressions?: number
          spent?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_customers: {
        Row: {
          ads_count: number
          company: string
          created_at: string
          email: string
          id: string
          join_date: string
          name: string
          notes: string | null
          phone: string
          status: string
          total_spent: number
          updated_at: string
        }
        Insert: {
          ads_count?: number
          company?: string
          created_at?: string
          email?: string
          id?: string
          join_date?: string
          name: string
          notes?: string | null
          phone?: string
          status?: string
          total_spent?: number
          updated_at?: string
        }
        Update: {
          ads_count?: number
          company?: string
          created_at?: string
          email?: string
          id?: string
          join_date?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_ads: {
        Row: {
          ad_type: string
          clicks: number
          created_at: string
          cta_text: string
          customer_name: string
          description: string
          end_date: string | null
          id: string
          image_url: string | null
          link_type: string
          link_url: string | null
          placement: string
          price: number
          start_date: string | null
          status: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          ad_type?: string
          clicks?: number
          created_at?: string
          cta_text?: string
          customer_name?: string
          description?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          link_type?: string
          link_url?: string | null
          placement?: string
          price?: number
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          ad_type?: string
          clicks?: number
          created_at?: string
          cta_text?: string
          customer_name?: string
          description?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          link_type?: string
          link_url?: string | null
          placement?: string
          price?: number
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      area_requirements: {
        Row: {
          area: string
          bedrooms: string | null
          budget: string | null
          city: string
          created_at: string
          description: string
          id: string
          name: string | null
          phone: string | null
          property_type: string
          status: string
          user_id: string
        }
        Insert: {
          area: string
          bedrooms?: string | null
          budget?: string | null
          city?: string
          created_at?: string
          description: string
          id?: string
          name?: string | null
          phone?: string | null
          property_type?: string
          status?: string
          user_id: string
        }
        Update: {
          area?: string
          bedrooms?: string | null
          budget?: string | null
          city?: string
          created_at?: string
          description?: string
          id?: string
          name?: string | null
          phone?: string | null
          property_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      broker_clients: {
        Row: {
          broker_id: string
          budget: string | null
          created_at: string
          email: string | null
          id: string
          inquiry_id: string | null
          last_contact: string | null
          name: string
          phone: string
          requirement: string | null
          status: string
        }
        Insert: {
          broker_id: string
          budget?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inquiry_id?: string | null
          last_contact?: string | null
          name: string
          phone: string
          requirement?: string | null
          status?: string
        }
        Update: {
          broker_id?: string
          budget?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inquiry_id?: string | null
          last_contact?: string | null
          name?: string
          phone?: string
          requirement?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_clients_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_clients_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "broker_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_inquiries: {
        Row: {
          area: string | null
          broker_id: string | null
          budget: string | null
          created_at: string
          id: string
          message: string | null
          name: string
          phone: string
          property_interest: string | null
          status: string
        }
        Insert: {
          area?: string | null
          broker_id?: string | null
          budget?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name: string
          phone: string
          property_interest?: string | null
          status?: string
        }
        Update: {
          area?: string | null
          broker_id?: string | null
          budget?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          property_interest?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_inquiries_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_notifications: {
        Row: {
          broker_id: string
          created_at: string
          id: string
          inquiry_id: string | null
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          id?: string
          inquiry_id?: string | null
          is_read?: boolean
          message: string
          title: string
          type?: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          id?: string
          inquiry_id?: string | null
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_notifications_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_notifications_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "broker_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_reviews: {
        Row: {
          broker_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          reviewer_name: string
          user_id: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_name?: string
          user_id: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_reviews_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          areas: string[]
          bio: string | null
          created_at: string
          email: string | null
          experience_years: number
          id: string
          name: string
          phone: string
          photo_url: string | null
          properties_sold: number
          rating: number
          specialization: string
          total_reviews: number
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          areas?: string[]
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number
          id?: string
          name: string
          phone: string
          photo_url?: string | null
          properties_sold?: number
          rating?: number
          specialization?: string
          total_reviews?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          areas?: string[]
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number
          id?: string
          name?: string
          phone?: string
          photo_url?: string | null
          properties_sold?: number
          rating?: number
          specialization?: string
          total_reviews?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      builder_inquiries: {
        Row: {
          budget: string | null
          builder_user_id: string
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string
          project_name: string
          source: string
          status: string
          unit_type: string | null
        }
        Insert: {
          budget?: string | null
          builder_user_id: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          project_name: string
          source?: string
          status?: string
          unit_type?: string | null
        }
        Update: {
          budget?: string | null
          builder_user_id?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          project_name?: string
          source?: string
          status?: string
          unit_type?: string | null
        }
        Relationships: []
      }
      builder_projects: {
        Row: {
          amenities: string[] | null
          city: string | null
          clicks: number | null
          completion_date: string | null
          completion_percent: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          inquiries: number | null
          location: string
          name: string
          price_range: string | null
          rera_number: string | null
          sold_units: number | null
          status: string | null
          total_units: number | null
          unit_types: string[] | null
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          amenities?: string[] | null
          city?: string | null
          clicks?: number | null
          completion_date?: string | null
          completion_percent?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          inquiries?: number | null
          location: string
          name: string
          price_range?: string | null
          rera_number?: string | null
          sold_units?: number | null
          status?: string | null
          total_units?: number | null
          unit_types?: string[] | null
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          amenities?: string[] | null
          city?: string | null
          clicks?: number | null
          completion_date?: string | null
          completion_percent?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          inquiries?: number | null
          location?: string
          name?: string
          price_range?: string | null
          rera_number?: string | null
          sold_units?: number | null
          status?: string | null
          total_units?: number | null
          unit_types?: string[] | null
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          area: string | null
          city: string
          content: string
          created_at: string
          id: string
          state: string
          user_avatar: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          area?: string | null
          city: string
          content: string
          created_at?: string
          id?: string
          state: string
          user_avatar?: string | null
          user_id: string
          user_name?: string
        }
        Update: {
          area?: string | null
          city?: string
          content?: string
          created_at?: string
          id?: string
          state?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string
          feature: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: string | null
          available_from: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          days_left: number | null
          deposit: string | null
          description: string | null
          furnishing: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_urgent: boolean | null
          is_verified: boolean | null
          latitude: number | null
          listing_type: string
          location: string
          longitude: number | null
          original_price: string | null
          phone: string | null
          posted_by: string | null
          price: string
          price_reduction: number | null
          property_type: string
          status: string | null
          title: string
          updated_at: string | null
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          available_from?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          days_left?: number | null
          deposit?: string | null
          description?: string | null
          furnishing?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_urgent?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          listing_type?: string
          location: string
          longitude?: number | null
          original_price?: string | null
          phone?: string | null
          posted_by?: string | null
          price: string
          price_reduction?: number | null
          property_type?: string
          status?: string | null
          title: string
          updated_at?: string | null
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          available_from?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          days_left?: number | null
          deposit?: string | null
          description?: string | null
          furnishing?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_urgent?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          listing_type?: string
          location?: string
          longitude?: number | null
          original_price?: string | null
          phone?: string | null
          posted_by?: string | null
          price?: string
          price_reduction?: number | null
          property_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      property_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string
          id: string
          invite_token: string
          invited_email: string
          invited_role: string
          property_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          invite_token?: string
          invited_email: string
          invited_role?: string
          property_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          invite_token?: string
          invited_email?: string
          invited_role?: string
          property_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_invites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
