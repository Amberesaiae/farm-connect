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
      attribute_definitions: {
        Row: {
          created_at: string
          data_type: string
          enum_values: string[]
          help_text_en: string | null
          id: string
          is_active: boolean
          key: string
          label_en: string
          label_local: Json
          reference_table: string | null
          unit_slug: string | null
          updated_at: string
          validation: Json
        }
        Insert: {
          created_at?: string
          data_type: string
          enum_values?: string[]
          help_text_en?: string | null
          id?: string
          is_active?: boolean
          key: string
          label_en: string
          label_local?: Json
          reference_table?: string | null
          unit_slug?: string | null
          updated_at?: string
          validation?: Json
        }
        Update: {
          created_at?: string
          data_type?: string
          enum_values?: string[]
          help_text_en?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label_en?: string
          label_local?: Json
          reference_table?: string | null
          unit_slug?: string | null
          updated_at?: string
          validation?: Json
        }
        Relationships: [
          {
            foreignKeyName: "attribute_definitions_unit_slug_fkey"
            columns: ["unit_slug"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["slug"]
          },
        ]
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
      breeds: {
        Row: {
          category_id: string
          created_at: string
          id: string
          label_en: string
          label_local: Json
          origin: string | null
          slug: string
          status: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          label_en: string
          label_local?: Json
          origin?: string | null
          slug: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          label_en?: string
          label_local?: Json
          origin?: string | null
          slug?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "breeds_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_attributes: {
        Row: {
          attribute_id: string
          category_id: string
          created_at: string
          default_value: Json | null
          display_order: number
          is_filterable: boolean
          is_promoted: boolean
          is_required: boolean
        }
        Insert: {
          attribute_id: string
          category_id: string
          created_at?: string
          default_value?: Json | null
          display_order?: number
          is_filterable?: boolean
          is_promoted?: boolean
          is_required?: boolean
        }
        Update: {
          attribute_id?: string
          category_id?: string
          created_at?: string
          default_value?: Json | null
          display_order?: number
          is_filterable?: boolean
          is_promoted?: boolean
          is_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "category_attributes_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attribute_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_attributes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_brands: {
        Row: {
          created_at: string
          id: string
          label_en: string
          manufacturer: string | null
          slug: string
          status: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_en: string
          manufacturer?: string | null
          slug: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label_en?: string
          manufacturer?: string | null
          slug?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hatcheries: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          attributes: Json
          blurb: string | null
          business_hours: Json
          capacity_per_cycle: number | null
          category: Database["public"]["Enums"]["hatchery_category"]
          category_id: string | null
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
          attributes?: Json
          blurb?: string | null
          business_hours?: Json
          capacity_per_cycle?: number | null
          category: Database["public"]["Enums"]["hatchery_category"]
          category_id?: string | null
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
          attributes?: Json
          blurb?: string | null
          business_hours?: Json
          capacity_per_cycle?: number | null
          category?: Database["public"]["Enums"]["hatchery_category"]
          category_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "hatcheries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
        ]
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
          attributes: Json
          breed: string | null
          category: string
          category_id: string | null
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
          price_unit_slug: string | null
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
          attributes?: Json
          breed?: string | null
          category: string
          category_id?: string | null
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
          price_unit_slug?: string | null
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
          attributes?: Json
          breed?: string | null
          category?: string
          category_id?: string | null
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
          price_unit_slug?: string | null
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
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_price_unit_slug_fkey"
            columns: ["price_unit_slug"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["slug"]
          },
        ]
      }
      market_categories: {
        Row: {
          accepts_listings: boolean
          canonical_path: string | null
          created_at: string
          description: string | null
          icon_key: string | null
          id: string
          is_active: boolean
          is_promoted: boolean
          label: string
          label_local: Json
          merged_into_id: string | null
          parent_id: string | null
          pillar_slug: string
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          accepts_listings?: boolean
          canonical_path?: string | null
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          is_promoted?: boolean
          label: string
          label_local?: Json
          merged_into_id?: string | null
          parent_id?: string | null
          pillar_slug: string
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          accepts_listings?: boolean
          canonical_path?: string | null
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          is_promoted?: boolean
          label?: string
          label_local?: Json
          merged_into_id?: string | null
          parent_id?: string | null
          pillar_slug?: string
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_categories_merged_into_id_fkey"
            columns: ["merged_into_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_categories_pillar_slug_fkey"
            columns: ["pillar_slug"]
            isOneToOne: false
            referencedRelation: "market_pillars"
            referencedColumns: ["slug"]
          },
        ]
      }
      market_category_synonyms: {
        Row: {
          alias_slug: string
          canonical_slug: string
          created_at: string
          pillar_slug: string
        }
        Insert: {
          alias_slug: string
          canonical_slug: string
          created_at?: string
          pillar_slug: string
        }
        Update: {
          alias_slug?: string
          canonical_slug?: string
          created_at?: string
          pillar_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_category_synonyms_pillar_slug_canonical_slug_fkey"
            columns: ["pillar_slug", "canonical_slug"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["pillar_slug", "slug"]
          },
          {
            foreignKeyName: "market_category_synonyms_pillar_slug_fkey"
            columns: ["pillar_slug"]
            isOneToOne: false
            referencedRelation: "market_pillars"
            referencedColumns: ["slug"]
          },
        ]
      }
      market_pillars: {
        Row: {
          accepts_vendor_stores: boolean
          allowed_units: string[]
          created_at: string
          default_unit_slug: string | null
          description: string | null
          has_directory: boolean
          icon_key: string | null
          is_active: boolean
          is_marketplace: boolean
          label: string
          label_local: Json
          requires_condition: boolean
          requires_expiry: boolean
          requires_licence: boolean
          short_label: string
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          accepts_vendor_stores?: boolean
          allowed_units?: string[]
          created_at?: string
          default_unit_slug?: string | null
          description?: string | null
          has_directory?: boolean
          icon_key?: string | null
          is_active?: boolean
          is_marketplace?: boolean
          label: string
          label_local?: Json
          requires_condition?: boolean
          requires_expiry?: boolean
          requires_licence?: boolean
          short_label: string
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          accepts_vendor_stores?: boolean
          allowed_units?: string[]
          created_at?: string
          default_unit_slug?: string | null
          description?: string | null
          has_directory?: boolean
          icon_key?: string | null
          is_active?: boolean
          is_marketplace?: boolean
          label?: string
          label_local?: Json
          requires_condition?: boolean
          requires_expiry?: boolean
          requires_licence?: boolean
          short_label?: string
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_pillars_default_unit_slug_fkey"
            columns: ["default_unit_slug"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["slug"]
          },
        ]
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
          attributes: Json
          badge_tier: string
          base_rate_ghs: number | null
          blurb: string | null
          business_hours: Json
          business_name: string
          category: string
          category_id: string | null
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
          attributes?: Json
          badge_tier?: string
          base_rate_ghs?: number | null
          blurb?: string | null
          business_hours?: Json
          business_name: string
          category: string
          category_id?: string | null
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
          attributes?: Json
          badge_tier?: string
          base_rate_ghs?: number | null
          blurb?: string | null
          business_hours?: Json
          business_name?: string
          category?: string
          category_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "service_profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
        ]
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
      taxonomy_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          id: number
          row_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: number
          row_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: number
          row_id?: string
          table_name?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          is_active: boolean
          kind: string
          label_en: string
          label_local: Json
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          kind: string
          label_en: string
          label_local?: Json
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          kind?: string
          label_en?: string
          label_local?: Json
          slug?: string
          sort_order?: number
          updated_at?: string
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
      vaccines: {
        Row: {
          created_at: string
          disease: string | null
          id: string
          label_en: string
          label_local: Json
          slug: string
          status: string
          submitted_by: string | null
          target_species: string[]
          updated_at: string
          withdrawal_days: number | null
        }
        Insert: {
          created_at?: string
          disease?: string | null
          id?: string
          label_en: string
          label_local?: Json
          slug: string
          status?: string
          submitted_by?: string | null
          target_species?: string[]
          updated_at?: string
          withdrawal_days?: number | null
        }
        Update: {
          created_at?: string
          disease?: string | null
          id?: string
          label_en?: string
          label_local?: Json
          slug?: string
          status?: string
          submitted_by?: string | null
          target_species?: string[]
          updated_at?: string
          withdrawal_days?: number | null
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
      recompute_category_path: { Args: { _id: string }; Returns: undefined }
      resolve_category_slug: {
        Args: { _pillar: string; _slug: string }
        Returns: string
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
