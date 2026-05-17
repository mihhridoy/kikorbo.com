export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: 'user' | 'expert' | 'admin';
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
          is_banned?: boolean;
          role?: 'user' | 'expert' | 'admin';
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      experts: {
        Row: {
          id: string;
          user_id: string;
          tagline: string | null;
          bio: string | null;
          category: string;
          subcategory: string | null;
          languages: string[];
          total_sessions: number;
          avg_rating: number;
          total_reviews: number;
          response_rate: number;
          verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
          nid_verified: boolean;
          certificate_verified: boolean;
          is_featured: boolean;
          is_online: boolean;
          last_seen: string;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['experts']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['experts']['Insert']>;
      };
      packages: {
        Row: {
          id: string;
          expert_id: string;
          title: string;
          description: string | null;
          duration_minutes: 20 | 30 | 40;
          price_bdt: number;
          session_type: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['packages']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['packages']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          expert_id: string;
          package_id: string;
          scheduled_at: string;
          duration_minutes: number;
          price_bdt: number;
          platform_fee: number;
          expert_earnings: number;
          session_type: 'chat' | 'voice' | 'video';
          status: 'pending' | 'confirmed' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          cancellation_reason: string | null;
          cancelled_by: 'user' | 'expert' | 'admin' | null;
          payment_id: string | null;
          consultation_room_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      consultation_rooms: {
        Row: {
          id: string;
          booking_id: string;
          agora_channel: string;
          agora_token_user: string | null;
          agora_token_expert: string | null;
          started_at: string | null;
          ended_at: string | null;
          actual_duration_minutes: number | null;
          status: 'waiting' | 'active' | 'ended';
        };
        Insert: Omit<Database['public']['Tables']['consultation_rooms']['Row'], 'id'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['consultation_rooms']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string | null;
          file_url: string | null;
          file_type: string | null;
          message_type: 'text' | 'file' | 'system';
          is_read: boolean;
          sent_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'sent_at'> & {
          id?: string;
          sent_at?: string;
          is_read?: boolean;
          message_type?: 'text' | 'file' | 'system';
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      booking_messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          content: string;
          sent_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_messages']['Row'], 'id' | 'sent_at'> & {
          id?: string;
          sent_at?: string;
        };
        Update: Partial<Database['public']['Tables']['booking_messages']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          expert_id: string;
          rating: number;
          comment: string | null;
          is_moderated: boolean;
          is_hidden: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
          is_moderated?: boolean;
          is_hidden?: boolean;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          amount_bdt: number;
          gateway: 'sslcommerz' | 'bkash';
          gateway_transaction_id: string | null;
          gateway_ref: string | null;
          status: 'pending' | 'success' | 'failed' | 'refunded';
          paid_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      expert_wallets: {
        Row: {
          id: string;
          expert_id: string;
          available_balance: number;
          pending_balance: number;
          total_earned: number;
          total_withdrawn: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expert_wallets']['Row'], 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
          available_balance?: number;
          pending_balance?: number;
          total_earned?: number;
          total_withdrawn?: number;
        };
        Update: Partial<Database['public']['Tables']['expert_wallets']['Insert']>;
      };
      payout_requests: {
        Row: {
          id: string;
          expert_id: string;
          amount_bdt: number;
          method: 'bkash' | 'bank';
          account_number: string;
          account_name: string;
          status: 'pending' | 'processing' | 'paid' | 'rejected';
          admin_note: string | null;
          requested_at: string;
          processed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['payout_requests']['Row'], 'id' | 'requested_at'> & {
          id?: string;
          requested_at?: string;
          status?: 'pending' | 'processing' | 'paid' | 'rejected';
        };
        Update: Partial<Database['public']['Tables']['payout_requests']['Insert']>;
      };
      disputes: {
        Row: {
          id: string;
          booking_id: string;
          raised_by: string;
          reason: string;
          description: string | null;
          evidence_urls: string[] | null;
          status: 'open' | 'under_review' | 'resolved' | 'closed';
          resolution: string | null;
          resolved_by: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['disputes']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
          status?: 'open' | 'under_review' | 'resolved' | 'closed';
        };
        Update: Partial<Database['public']['Tables']['disputes']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: string;
          related_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      expert_documents: {
        Row: {
          id: string;
          expert_id: string;
          type: 'nid_front' | 'nid_back' | 'certificate' | 'portfolio';
          file_url: string;
          verified: boolean;
          uploaded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expert_documents']['Row'], 'id' | 'uploaded_at'> & {
          id?: string;
          uploaded_at?: string;
          verified?: boolean;
        };
        Update: Partial<Database['public']['Tables']['expert_documents']['Insert']>;
      };
      expert_skills: {
        Row: {
          id: string;
          expert_id: string;
          skill: string;
        };
        Insert: Omit<Database['public']['Tables']['expert_skills']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['expert_skills']['Insert']>;
      };
      availability_slots: {
        Row: {
          id: string;
          expert_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['availability_slots']['Row'], 'id'> & {
          id?: string;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['availability_slots']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Expert = Database['public']['Tables']['experts']['Row'];
export type Package = Database['public']['Tables']['packages']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type ConsultationRoom = Database['public']['Tables']['consultation_rooms']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type ExpertWallet = Database['public']['Tables']['expert_wallets']['Row'];
export type PayoutRequest = Database['public']['Tables']['payout_requests']['Row'];
export type Dispute = Database['public']['Tables']['disputes']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type ExpertDocument = Database['public']['Tables']['expert_documents']['Row'];
export type ExpertSkill = Database['public']['Tables']['expert_skills']['Row'];
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];
