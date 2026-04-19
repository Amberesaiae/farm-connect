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
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: number
          metadata: Json
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: number
          metadata?: Json
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: number
          metadata?: Json
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      agro_vendor_stores: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          badge_tier: string
          blurb: string | null
          business_hours: Json
          business_name: string
          business_reg_number: string | null
          cover_path: string | null
          created_at: string
          delivers: boolean
          delivery_regions: string[]
          district: string | null
          email: string | null
          id: string
          is_active: boolean
          licence_doc_path: string | null
          listing_count: number
          logo_path: string | null
          min_order_ghs: number | null
          owner_id: string
          phone_e164: string | null
          pillar: string
          region: string
          rejection_reason: string | null
          slug: string
          status: Database["public"]["Enums"]["agro_store_status"]
          updated_at: string
          vsd_licence_number: string | null
          whatsapp_e164: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          badge_tier?: string
          blurb?: string | null
          business_hours?: Json
          business_name: string
          business_reg_number?: string | null
          cover_path?: string | null
          created_at?: string
          delivers?: boolean
          delivery_regions?: string[]
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          licence_doc_path?: string | null
          listing_count?: number
          logo_path?: string | null
          min_order_ghs?: number | null
          owner_id: string
          phone_e164?: string | null
          pillar: string
          region: string
          rejection_reason?: string | null
          slug: string
          status?: Database["public"]["Enums"]["agro_store_status"]
          updated_at?: string
          vsd_licence_number?: string | null
          whatsapp_e164?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          badge_tier?: string
          blurb?: string | null
          business_hours?: Json
          business_name?: string
          business_reg_number?: string | null
          cover_path?: string | null
          created_at?: string
          delivers?: boolean
          delivery_regions?: string[]
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          licence_doc_path?: string | null
          listing_count?: number
          logo_path?: string | null
          min_order_ghs?: number | null
          owner_id?: string
          phone_e164?: string | null
          pillar?: string
          region?: string
          rejection_reason?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["agro_store_status"]
          updated_at?: string
          vsd_licence_number?: string | null
          whatsapp_e164?: string | null
        }
        Relationships: []
      }
      batch_reservations: {
        Row: {
          batch_id: string
          buyer_contact: string | null
          buyer_id: string
          buyer_note: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          confirmed_qty: number | null
          created_at: string
          delivery_address: string | null
          fulfilled_at: string | null
          fulfilment: Database["public"]["Enums"]["fulfilment_mode"]
          hatchery_note: string | null
          id: string
          idempotency_key: string | null
          pickup_date: string | null
          requested_qty: number
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          batch_id: string
          buyer_contact?: string | null
          buyer_id: string
          buyer_note?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          confirmed_qty?: number | null
          created_at?: string
          delivery_address?: string | null
          fulfilled_at?: string | null
          fulfilment?: Database["public"]["Enums"]["fulfilment_mode"]
          hatchery_note?: string | null
          id?: string
          idempotency_key?: string | null
          pickup_date?: string | null
          requested_qty: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          batch_id?: string
          buyer_contact?: string | null
          buyer_id?: string
          buyer_note?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          confirmed_qty?: number | null
          created_at?: string
          delivery_address?: string | null
          fulfilled_at?: string | null
          fulfilment?: Database["public"]["Enums"]["fulfilment_mode"]
          hatchery_note?: string | null
          id?: string
          idempotency_key?: string | null
          pickup_date?: string | null
          requested_qty?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_reservations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "hatchery_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      hatcheries: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          blurb: string | null
          business_hours: Json
          capacity_per_cycle: number | null
          category: Database["public"]["Enums"]["hatchery_category"]
          cover_path: string | null
          created_at: string
          district: string | null
          id: string
          logo_path: string | null
          name: string
          owner_id: string | null
          permit_authority:
            | Database["public"]["Enums"]["permit_authority"]
            | null
          permit_doc_path: string | null
          permit_number: string | null
          phone_e164: string | null
          region: string
          rejection_reason: string | null
          slug: string
          status: Database["public"]["Enums"]["hatchery_status"]
          updated_at: string
          whatsapp_e164: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          blurb?: string | null
          business_hours?: Json
          capacity_per_cycle?: number | null
          category: Database["public"]["Enums"]["hatchery_category"]
          cover_path?: string | null
          created_at?: string
          district?: string | null
          id?: string
          logo_path?: string | null
          name: string
          owner_id?: string | null
          permit_authority?:
            | Database["public"]["Enums"]["permit_authority"]
            | null
          permit_doc_path?: string | null
          permit_number?: string | null
          phone_e164?: string | null
          region: string
          rejection_reason?: string | null
          slug: string
          status?: Database["public"]["Enums"]["hatchery_status"]
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          blurb?: string | null
          business_hours?: Json
          capacity_per_cycle?: number | null
          category?: Database["public"]["Enums"]["hatchery_category"]
          cover_path?: string | null
          created_at?: string
          district?: string | null
          id?: string
          logo_path?: string | null
          name?: string
          owner_id?: string | null
          permit_authority?:
            | Database["public"]["Enums"]["permit_authority"]
            | null
          permit_doc_path?: string | null
          permit_number?: string | null
          phone_e164?: string | null
          region?: string
          rejection_reason?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hatchery_status"]
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Relationships: []
      }
      hatchery_batch_photos: {
        Row: {
          batch_id: string
          created_at: string
          display_order: number
          id: string
          is_cover: boolean
          storage_path: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_cover?: boolean
          storage_path: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_cover?: boolean
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatchery_batch_photos_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "hatchery_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      hatchery_batches: {
        Row: {
          allows_delivery: boolean
          allows_pickup: boolean
          available_quantity: number | null
          batch_type: string
          breed: string | null
          created_at: string
          hatch_date: string | null
          hatchery_id: string
          id: string
          min_order_qty: number
          notes: string | null
          pickup_end_date: string
          pickup_start_date: string
          price_per_unit: number
          region: string
          reserved_quantity: number
          status: Database["public"]["Enums"]["batch_status"]
          total_quantity: number
          unit_label: string
          updated_at: string
        }
        Insert: {
          allows_delivery?: boolean
          allows_pickup?: boolean
          available_quantity?: number | null
          batch_type: string
          breed?: string | null
          created_at?: string
          hatch_date?: string | null
          hatchery_id: string
          id?: string
          min_order_qty?: number
          notes?: string | null
          pickup_end_date: string
          pickup_start_date: string
          price_per_unit: number
          region: string
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["batch_status"]
          total_quantity: number
          unit_label?: string
          updated_at?: string
        }
        Update: {
          allows_delivery?: boolean
          allows_pickup?: boolean
          available_quantity?: number | null
          batch_type?: string
          breed?: string | null
          created_at?: string
          hatch_date?: string | null
          hatchery_id?: string
          id?: string
          min_order_qty?: number
          notes?: string | null
          pickup_end_date?: string
          pickup_start_date?: string
          price_per_unit?: number
          region?: string
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["batch_status"]
          total_quantity?: number
          unit_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatchery_batches_hatchery_id_fkey"
            columns: ["hatchery_id"]
            isOneToOne: false
            referencedRelation: "hatcheries"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["listing_event_type"]
          id: number
          listing_id: string
          metadata: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["listing_event_type"]
          id?: number
          listing_id: string
          metadata?: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["listing_event_type"]
          id?: number
          listing_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "listing_events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_cover: boolean
          listing_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_cover?: boolean
          listing_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_cover?: boolean
          listing_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          age_months: number | null
          breed: string | null
          category: string
          condition: string | null
          contact_count: number
          created_at: string
          description: string | null
          district: string | null
          expires_at: string
          expires_on: string | null
          id: string
          metadata: Json
          min_order_qty: number
          price_ghs: number
          price_unit: Database["public"]["Enums"]["price_unit"]
          quantity: number
          region: string
          save_count: number
          search_vector: unknown
          seller_id: string
          sex: string | null
          status: Database["public"]["Enums"]["listing_status"]
          stock_quantity: number | null
          subcategory_slug: string | null
          title: string
          top_category: string
          updated_at: string
          vendor_store_id: string | null
          view_count: number
          weight_kg: number | null
        }
        Insert: {
          age_months?: number | null
          breed?: string | null
          category: string
          condition?: string | null
          contact_count?: number
          created_at?: string
          description?: string | null
          district?: string | null
          expires_at?: string
          expires_on?: string | null
          id?: string
          metadata?: Json
          min_order_qty?: number
          price_ghs: number
          price_unit?: Database["public"]["Enums"]["price_unit"]
          quantity?: number
          region: string
          save_count?: number
          search_vector?: unknown
          seller_id: string
          sex?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          stock_quantity?: number | null
          subcategory_slug?: string | null
          title: string
          top_category?: string
          updated_at?: string
          vendor_store_id?: string | null
          view_count?: number
          weight_kg?: number | null
        }
        Update: {
          age_months?: number | null
          breed?: string | null
          category?: string
          condition?: string | null
          contact_count?: number
          created_at?: string
          description?: string | null
          district?: string | null
          expires_at?: string
          expires_on?: string | null
          id?: string
          metadata?: Json
          min_order_qty?: number
          price_ghs?: number
          price_unit?: Database["public"]["Enums"]["price_unit"]
          quantity?: number
          region?: string
          save_count?: number
          search_vector?: unknown
          seller_id?: string
          sex?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          stock_quantity?: number | null
          subcategory_slug?: string | null
          title?: string
          top_category?: string
          updated_at?: string
          vendor_store_id?: string | null
          view_count?: number
          weight_kg?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_role: string
          avatar_url: string | null
          badge_tier: Database["public"]["Enums"]["badge_tier"]
          created_at: string
          display_name: string
          district: string | null
          id: string
          listing_count: number
          region: string | null
          roles: string[]
          status: Database["public"]["Enums"]["user_status"]
          suspended_at: string | null
          suspension_reason: string | null
          trade_count: number
          updated_at: string
          whatsapp_e164: string | null
        }
        Insert: {
          active_role?: string
          avatar_url?: string | null
          badge_tier?: Database["public"]["Enums"]["badge_tier"]
          created_at?: string
          display_name?: string
          district?: string | null
          id: string
          listing_count?: number
          region?: string | null
          roles?: string[]
          status?: Database["public"]["Enums"]["user_status"]
          suspended_at?: string | null
          suspension_reason?: string | null
          trade_count?: number
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Update: {
          active_role?: string
          avatar_url?: string | null
          badge_tier?: Database["public"]["Enums"]["badge_tier"]
          created_at?: string
          display_name?: string
          district?: string | null
          id?: string
          listing_count?: number
          region?: string | null
          roles?: string[]
          status?: Database["public"]["Enums"]["user_status"]
          suspended_at?: string | null
          suspension_reason?: string | null
          trade_count?: number
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_profiles: {
        Row: {
          address: string | null
          badge_tier: string
          base_rate_ghs: number | null
          blurb: string | null
          business_hours: Json
          business_name: string
          category: string
          cover_path: string | null
          coverage_districts: string[]
          coverage_regions: string[]
          created_at: string
          district: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_path: string | null
          owner_id: string
          phone_e164: string | null
          pricing_model: string | null
          rating_avg: number
          rating_count: number
          region: string | null
          slug: string
          updated_at: string
          whatsapp_e164: string | null
        }
        Insert: {
          address?: string | null
          badge_tier?: string
          base_rate_ghs?: number | null
          blurb?: string | null
          business_hours?: Json
          business_name: string
          category: string
          cover_path?: string | null
          coverage_districts?: string[]
          coverage_regions?: string[]
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_path?: string | null
          owner_id: string
          phone_e164?: string | null
          pricing_model?: string | null
          rating_avg?: number
          rating_count?: number
          region?: string | null
          slug: string
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Update: {
          address?: string | null
          badge_tier?: string
          base_rate_ghs?: number | null
          blurb?: string | null
          business_hours?: Json
          business_name?: string
          category?: string
          cover_path?: string | null
          coverage_districts?: string[]
          coverage_regions?: string[]
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_path?: string | null
          owner_id?: string
          phone_e164?: string | null
          pricing_model?: string | null
          rating_avg?: number
          rating_count?: number
          region?: string | null
          slug?: string
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          budget_max_ghs: number | null
          budget_min_ghs: number | null
          buyer_contact: string | null
          buyer_id: string
          created_at: string
          district: string | null
          expires_at: string
          id: string
          idempotency_key: string | null
          notes: string | null
          preferred_date: string | null
          preferred_window: string | null
          provider_response: string | null
          provider_user_id: string
          region: string
          responded_at: string | null
          responded_price_ghs: number | null
          service_profile_id: string
          service_type: string
          status: Database["public"]["Enums"]["service_request_status"]
          updated_at: string
        }
        Insert: {
          budget_max_ghs?: number | null
          budget_min_ghs?: number | null
          buyer_contact?: string | null
          buyer_id: string
          created_at?: string
          district?: string | null
          expires_at?: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          preferred_date?: string | null
          preferred_window?: string | null
          provider_response?: string | null
          provider_user_id: string
          region: string
          responded_at?: string | null
          responded_price_ghs?: number | null
          service_profile_id: string
          service_type: string
          status?: Database["public"]["Enums"]["service_request_status"]
          updated_at?: string
        }
        Update: {
          budget_max_ghs?: number | null
          budget_min_ghs?: number | null
          buyer_contact?: string | null
          buyer_id?: string
          created_at?: string
          district?: string | null
          expires_at?: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          preferred_date?: string | null
          preferred_window?: string | null
          provider_response?: string | null
          provider_user_id?: string
          region?: string
          responded_at?: string | null
          responded_price_ghs?: number | null
          service_profile_id?: string
          service_type?: string
          status?: Database["public"]["Enums"]["service_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_profile_id_fkey"
            columns: ["service_profile_id"]
            isOneToOne: false
            referencedRelation: "service_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      verification_submissions: {
        Row: {
          created_at: string
          ghana_card_path: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_path: string
          status: Database["public"]["Enums"]["verification_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          ghana_card_path: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path: string
          status?: Database["public"]["Enums"]["verification_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          ghana_card_path?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path?: string
          status?: Database["public"]["Enums"]["verification_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vendor_stores_v: {
        Row: {
          badge_tier: string | null
          blurb: string | null
          cover_path: string | null
          created_at: string | null
          district: string | null
          id: string | null
          is_public: boolean | null
          logo_path: string | null
          name: string | null
          owner_id: string | null
          pillar_or_category: string | null
          region: string | null
          slug: string | null
          store_kind: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancel_reservation: {
        Args: { _by_hatchery?: boolean; _reservation_id: string }
        Returns: Json
      }
      confirm_reservation: {
        Args: { _confirmed_qty: number; _reservation_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hatchery_owner: {
        Args: { _hatchery_id: string; _user_id: string }
        Returns: boolean
      }
      owns_batch: {
        Args: { _batch_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agro_store_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "suspended"
        | "rejected"
      app_role: "admin" | "user"
      badge_tier: "none" | "verified" | "trusted" | "top_seller"
      batch_status: "draft" | "open" | "full" | "closed" | "cancelled"
      fulfilment_mode: "pickup" | "delivery"
      hatchery_category: "poultry" | "fish" | "breeding"
      hatchery_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "suspended"
        | "rejected"
      listing_event_type: "view" | "contact_whatsapp" | "save"
      listing_status: "draft" | "active" | "expired" | "sold" | "hidden"
      notification_type:
        | "enquiry"
        | "verification_approved"
        | "verification_rejected"
        | "listing_expiring"
        | "listing_expired"
        | "reservation_received"
        | "reservation_confirmed"
        | "reservation_waitlisted"
        | "reservation_cancelled"
        | "reservation_fulfilled"
        | "service_request_received"
        | "service_request_responded"
        | "listing_hidden_by_admin"
        | "hatchery_approved"
        | "hatchery_rejected"
        | "agro_store_approved"
        | "agro_store_rejected"
        | "agro_store_suspended"
      permit_authority:
        | "vsd"
        | "fisheries_commission"
        | "epa"
        | "district_assembly"
        | "other"
      price_unit: "per_head" | "per_kg" | "per_lb" | "lot"
      reservation_status:
        | "pending"
        | "confirmed"
        | "waitlisted"
        | "cancelled_by_buyer"
        | "cancelled_by_hatchery"
        | "fulfilled"
      service_request_status:
        | "submitted"
        | "viewed"
        | "responded"
        | "accepted"
        | "declined"
        | "expired"
      user_status: "active" | "suspended"
      verification_status: "pending" | "approved" | "rejected"
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
      agro_store_status: [
        "draft",
        "pending_review",
        "approved",
        "suspended",
        "rejected",
      ],
      app_role: ["admin", "user"],
      badge_tier: ["none", "verified", "trusted", "top_seller"],
      batch_status: ["draft", "open", "full", "closed", "cancelled"],
      fulfilment_mode: ["pickup", "delivery"],
      hatchery_category: ["poultry", "fish", "breeding"],
      hatchery_status: [
        "draft",
        "pending_review",
        "approved",
        "suspended",
        "rejected",
      ],
      listing_event_type: ["view", "contact_whatsapp", "save"],
      listing_status: ["draft", "active", "expired", "sold", "hidden"],
      notification_type: [
        "enquiry",
        "verification_approved",
        "verification_rejected",
        "listing_expiring",
        "listing_expired",
        "reservation_received",
        "reservation_confirmed",
        "reservation_waitlisted",
        "reservation_cancelled",
        "reservation_fulfilled",
        "service_request_received",
        "service_request_responded",
        "listing_hidden_by_admin",
        "hatchery_approved",
        "hatchery_rejected",
        "agro_store_approved",
        "agro_store_rejected",
        "agro_store_suspended",
      ],
      permit_authority: [
        "vsd",
        "fisheries_commission",
        "epa",
        "district_assembly",
        "other",
      ],
      price_unit: ["per_head", "per_kg", "per_lb", "lot"],
      reservation_status: [
        "pending",
        "confirmed",
        "waitlisted",
        "cancelled_by_buyer",
        "cancelled_by_hatchery",
        "fulfilled",
      ],
      service_request_status: [
        "submitted",
        "viewed",
        "responded",
        "accepted",
        "declined",
        "expired",
      ],
      user_status: ["active", "suspended"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
