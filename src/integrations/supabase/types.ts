export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          bill_id: string
          bill_number: string | null
          change_hash: string | null
          committee: string | null
          committee_id: string | null
          description: string | null
          full_bill_text: string | null
          last_action: string | null
          last_action_date: string | null
          session_id: number | null
          state_link: string | null
          status: string | null
          status_date: string | null
          status_desc: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          bill_id: string
          bill_number?: string | null
          change_hash?: string | null
          committee?: string | null
          committee_id?: string | null
          description?: string | null
          full_bill_text?: string | null
          last_action?: string | null
          last_action_date?: string | null
          session_id?: number | null
          state_link?: string | null
          status?: string | null
          status_date?: string | null
          status_desc?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          bill_id?: string
          bill_number?: string | null
          change_hash?: string | null
          committee?: string | null
          committee_id?: string | null
          description?: string | null
          full_bill_text?: string | null
          last_action?: string | null
          last_action_date?: string | null
          session_id?: number | null
          state_link?: string | null
          status?: string | null
          status_date?: string | null
          status_desc?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_leg: {
        Row: {
          bill_id: string | null
          document_desc: string | null
          document_id: string
          document_mime: string | null
          document_size: number | null
          document_type: string | null
          state_link: string | null
          url: string | null
        }
        Insert: {
          bill_id?: string | null
          document_desc?: string | null
          document_id: string
          document_mime?: string | null
          document_size?: number | null
          document_type?: string | null
          state_link?: string | null
          url?: string | null
        }
        Update: {
          bill_id?: string | null
          document_desc?: string | null
          document_id?: string
          document_mime?: string | null
          document_size?: number | null
          document_type?: string | null
          state_link?: string | null
          url?: string | null
        }
        Relationships: []
      }
      history: {
        Row: {
          action: string | null
          bill_id: string | null
          chamber: string | null
          date: string | null
          history_id: number
          sequence: number | null
        }
        Insert: {
          action?: string | null
          bill_id?: string | null
          chamber?: string | null
          date?: string | null
          history_id?: number
          sequence?: number | null
        }
        Update: {
          action?: string | null
          bill_id?: string | null
          chamber?: string | null
          date?: string | null
          history_id?: number
          sequence?: number | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          ballotpedia: string | null
          committee_id: string | null
          district: string | null
          first_name: string | null
          followthemoney_eid: string | null
          knowwho_pid: string | null
          last_name: string | null
          middle_name: string | null
          name: string | null
          nickname: string | null
          opensecrets_id: string | null
          party: string | null
          party_id: string | null
          people_id: string
          role: string | null
          role_id: string | null
          suffix: string | null
          votesmart_id: string | null
        }
        Insert: {
          ballotpedia?: string | null
          committee_id?: string | null
          district?: string | null
          first_name?: string | null
          followthemoney_eid?: string | null
          knowwho_pid?: string | null
          last_name?: string | null
          middle_name?: string | null
          name?: string | null
          nickname?: string | null
          opensecrets_id?: string | null
          party?: string | null
          party_id?: string | null
          people_id: string
          role?: string | null
          role_id?: string | null
          suffix?: string | null
          votesmart_id?: string | null
        }
        Update: {
          ballotpedia?: string | null
          committee_id?: string | null
          district?: string | null
          first_name?: string | null
          followthemoney_eid?: string | null
          knowwho_pid?: string | null
          last_name?: string | null
          middle_name?: string | null
          name?: string | null
          nickname?: string | null
          opensecrets_id?: string | null
          party?: string | null
          party_id?: string | null
          people_id?: string
          role?: string | null
          role_id?: string | null
          suffix?: string | null
          votesmart_id?: string | null
        }
        Relationships: []
      }
      rollcall: {
        Row: {
          absent: number | null
          bill_id: string | null
          chamber: string | null
          date: string | null
          description: string | null
          nay: number | null
          nv: number | null
          roll_call_id: string
          total: number | null
          yea: number | null
        }
        Insert: {
          absent?: number | null
          bill_id?: string | null
          chamber?: string | null
          date?: string | null
          description?: string | null
          nay?: number | null
          nv?: number | null
          roll_call_id: string
          total?: number | null
          yea?: number | null
        }
        Update: {
          absent?: number | null
          bill_id?: string | null
          chamber?: string | null
          date?: string | null
          description?: string | null
          nay?: number | null
          nv?: number | null
          roll_call_id?: string
          total?: number | null
          yea?: number | null
        }
        Relationships: []
      }
      sponsor: {
        Row: {
          bill_id: string | null
          has_bill_id: boolean | null
          people_id: string | null
          position: string | null
          sponsor_id: number
        }
        Insert: {
          bill_id?: string | null
          has_bill_id?: boolean | null
          people_id?: string | null
          position?: string | null
          sponsor_id?: number
        }
        Update: {
          bill_id?: string | null
          has_bill_id?: boolean | null
          people_id?: string | null
          position?: string | null
          sponsor_id?: number
        }
        Relationships: []
      }
      votes: {
        Row: {
          people_id: string | null
          roll_call_id: string | null
          vote: string | null
          vote_desc: string | null
          vote_id: number
        }
        Insert: {
          people_id?: string | null
          roll_call_id?: string | null
          vote?: string | null
          vote_desc?: string | null
          vote_id?: number
        }
        Update: {
          people_id?: string | null
          roll_call_id?: string | null
          vote?: string | null
          vote_desc?: string | null
          vote_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
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
