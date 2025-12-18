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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      productions: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          production_date: string | null
          quantity_produced: number | null
          unit_production_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          product_id?: number | null
          production_date?: string | null
          quantity_produced?: number | null
          unit_production_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number | null
          production_date?: string | null
          quantity_produced?: number | null
          unit_production_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          id: number
          purchase_date: string | null
          quantity: number | null
          raw_material_id: number | null
          total_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          purchase_date?: string | null
          quantity?: number | null
          raw_material_id?: number | null
          total_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          purchase_date?: string | null
          quantity?: number | null
          raw_material_id?: number | null
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_purchases_ingredient_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          created_at: string
          id: number
          name: string | null
          unit_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          unit_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          unit_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          raw_material_id: number | null
          required_quantity: number | null
          unit_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          product_id?: number | null
          raw_material_id?: number | null
          required_quantity?: number | null
          unit_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number | null
          raw_material_id?: number | null
          required_quantity?: number | null
          unit_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_items_ingredient_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      rol: {
        Row: {
          rol_created_at: string
          rol_id: number
          rol_id_ext: string | null
          rol_name: string | null
          rol_state: string | null
        }
        Insert: {
          rol_created_at?: string
          rol_id?: number
          rol_id_ext?: string | null
          rol_name?: string | null
          rol_state?: string | null
        }
        Update: {
          rol_created_at?: string
          rol_id?: number
          rol_id_ext?: string | null
          rol_name?: string | null
          rol_state?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          quantity_sold: number | null
          sale_date: string | null
          unit_sale_price: number | null
          weighted_average_cost_at_sale: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          product_id?: number | null
          quantity_sold?: number | null
          sale_date?: string | null
          unit_sale_price?: number | null
          weighted_average_cost_at_sale?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number | null
          quantity_sold?: number | null
          sale_date?: string | null
          unit_sale_price?: number | null
          weighted_average_cost_at_sale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      units_of_measure: {
        Row: {
          created_at: string
          id: number
          name: string | null
          abbreviation: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          abbreviation?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          abbreviation?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          user_created_at: string
          user_email: string | null
          user_id: string
          user_name: string | null
          user_password: string | null
          user_state: string | null
        }
        Insert: {
          user_created_at?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          user_password?: string | null
          user_state?: string | null
        }
        Update: {
          user_created_at?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          user_password?: string | null
          user_state?: string | null
        }
        Relationships: []
      }
      user_rol: {
        Row: {
          rol_idext: string | null
          user_name: string | null
          userrol_created_at: string
          userrol_id: number
          userrol_state: string | null
        }
        Insert: {
          rol_idext?: string | null
          user_name?: string | null
          userrol_created_at?: string
          userrol_id?: number
          userrol_state?: string | null
        }
        Update: {
          rol_idext?: string | null
          user_name?: string | null
          userrol_created_at?: string
          userrol_id?: number
          userrol_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rol_rol_idext_fkey"
            columns: ["rol_idext"]
            isOneToOne: false
            referencedRelation: "rol"
            referencedColumns: ["rol_id_ext"]
          },
          {
            foreignKeyName: "user_rol_user_name_fkey"
            columns: ["user_name"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ingredient_average_cost: {
        Args: { p_ingredient_id: number }
        Returns: number
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
