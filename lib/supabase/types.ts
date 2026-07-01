export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: AppUserRow;
        Insert: AppUserInsert;
        Update: AppUserUpdate;
      };
      audits: {
        Row: AuditRow;
        Insert: AuditInsert;
        Update: AuditUpdate;
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
      };
      analytics_events: {
        Row: AnalyticsEventRow;
        Insert: AnalyticsEventInsert;
        Update: AnalyticsEventUpdate;
      };
      affiliate_clicks: {
        Row: AffiliateClickRow;
        Insert: AffiliateClickInsert;
        Update: AffiliateClickUpdate;
      };
      referrals: {
        Row: ReferralRow;
        Insert: ReferralInsert;
        Update: ReferralUpdate;
      };
      challenge_entries: {
        Row: ChallengeEntryRow;
        Insert: ChallengeEntryInsert;
        Update: ChallengeEntryUpdate;
      };
      progress_comparisons: {
        Row: ProgressComparisonRow;
        Insert: ProgressComparisonInsert;
        Update: ProgressComparisonUpdate;
      };
      product_unlocks: {
        Row: ProductUnlockRow;
        Insert: ProductUnlockInsert;
        Update: ProductUnlockUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type ProductType = "quick_fix" | "aura_report" | "dating_audit" | "glowup_plan";

/* ───────── app_users ───────── */
export interface AppUserRow {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
export interface AppUserInsert {
  id?: string;
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface AppUserUpdate {
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  updated_at?: string;
}

/* ───────── audits ───────── */
export interface AuditRow {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  audit_type: string;
  goal: string | null;
  budget_range: string | null;
  image_url: string | null;
  image_meta: Json | null;
  deep_input: Json | null;
  personalization: Json | null;
  profile_text_input: Json | null;
  free_score: number | null;
  full_score: number | null;
  report_status: string | null;
  unlock_status: string | null;
  unlocked_products: string[];
  free_result: Json | null;
  quick_fix_report: Json | null;
  full_report: Json | null;
  dating_profile_report: Json | null;
  glowup_plan: Json | null;
  twin_result: Json | null;
  created_at: string;
  updated_at: string;
}
export interface AuditInsert {
  id?: string;
  user_id?: string | null;
  anonymous_id?: string | null;
  audit_type?: string;
  goal?: string | null;
  budget_range?: string | null;
  image_url?: string | null;
  image_meta?: Json | null;
  deep_input?: Json | null;
  personalization?: Json | null;
  profile_text_input?: Json | null;
  free_score?: number | null;
  full_score?: number | null;
  report_status?: string | null;
  unlock_status?: string | null;
  unlocked_products?: string[];
  free_result?: Json | null;
  quick_fix_report?: Json | null;
  full_report?: Json | null;
  dating_profile_report?: Json | null;
  glowup_plan?: Json | null;
  twin_result?: Json | null;
  created_at?: string;
  updated_at?: string;
}
export interface AuditUpdate {
  user_id?: string | null;
  anonymous_id?: string | null;
  audit_type?: string;
  goal?: string | null;
  budget_range?: string | null;
  image_url?: string | null;
  image_meta?: Json | null;
  deep_input?: Json | null;
  personalization?: Json | null;
  profile_text_input?: Json | null;
  free_score?: number | null;
  full_score?: number | null;
  report_status?: string | null;
  unlock_status?: string | null;
  unlocked_products?: string[];
  free_result?: Json | null;
  quick_fix_report?: Json | null;
  full_report?: Json | null;
  dating_profile_report?: Json | null;
  glowup_plan?: Json | null;
  twin_result?: Json | null;
  updated_at?: string;
}

/* ───────── orders ───────── */
export interface OrderRow {
  id: string;
  audit_id: string | null;
  user_id: string | null;
  product_type: string;
  product_name: string;
  original_amount: number;
  discount_code: string | null;
  discount_amount: number;
  final_amount: number;
  currency: string;
  status: string;
  customer_name: string | null;
  customer_contact: string | null;
  upi_transaction_ref: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  generated_unlock_code: string | null;
  created_at: string;
  updated_at: string;
  unlocked_at: string | null;
}
export interface OrderInsert {
  id?: string;
  audit_id?: string | null;
  user_id?: string | null;
  product_type: string;
  product_name: string;
  original_amount: number;
  discount_code?: string | null;
  discount_amount?: number;
  final_amount: number;
  currency?: string;
  status: string;
  customer_name?: string | null;
  customer_contact?: string | null;
  upi_transaction_ref?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  generated_unlock_code?: string | null;
  created_at?: string;
  updated_at?: string;
  unlocked_at?: string | null;
}
export interface OrderUpdate {
  product_type?: string;
  product_name?: string;
  original_amount?: number;
  discount_code?: string | null;
  discount_amount?: number;
  final_amount?: number;
  currency?: string;
  status?: string;
  customer_name?: string | null;
  customer_contact?: string | null;
  upi_transaction_ref?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  generated_unlock_code?: string | null;
  updated_at?: string;
  unlocked_at?: string | null;
}

/* ───────── leads ───────── */
export interface LeadRow {
  id: string;
  name: string | null;
  contact: string | null;
  interest_product: string | null;
  note: string | null;
  source: string | null;
  status: string;
  contacted_at: string | null;
  created_at: string;
}
export interface LeadInsert {
  id?: string;
  name?: string | null;
  contact?: string | null;
  interest_product?: string | null;
  note?: string | null;
  source?: string | null;
  status?: string;
  contacted_at?: string | null;
  created_at?: string;
}
export interface LeadUpdate {
  name?: string | null;
  contact?: string | null;
  interest_product?: string | null;
  note?: string | null;
  source?: string | null;
  status?: string;
  contacted_at?: string | null;
}

/* ───────── analytics_events ───────── */
export interface AnalyticsEventRow {
  id: string;
  event_name: string;
  audit_id: string | null;
  order_id: string | null;
  product_type: string | null;
  metadata: Json | null;
  anonymous_id: string | null;
  created_at: string;
}
export interface AnalyticsEventInsert {
  id?: string;
  event_name: string;
  audit_id?: string | null;
  order_id?: string | null;
  product_type?: string | null;
  metadata?: Json | null;
  anonymous_id?: string | null;
  created_at?: string;
}
export interface AnalyticsEventUpdate {
  event_name?: string;
  audit_id?: string | null;
  order_id?: string | null;
  product_type?: string | null;
  metadata?: Json | null;
  anonymous_id?: string | null;
}

/* ───────── affiliate_clicks ───────── */
export interface AffiliateClickRow {
  id: string;
  product_id: string | null;
  audit_id: string | null;
  source: string | null;
  metadata: Json | null;
  clicked_at: string;
}
export interface AffiliateClickInsert {
  id?: string;
  product_id?: string | null;
  audit_id?: string | null;
  source?: string | null;
  metadata?: Json | null;
  clicked_at?: string;
}
export interface AffiliateClickUpdate {
  product_id?: string | null;
  audit_id?: string | null;
  source?: string | null;
  metadata?: Json | null;
}

/* ───────── referrals ───────── */
export interface ReferralRow {
  id: string;
  referral_code: string | null;
  source: string | null;
  claimed_at: string;
  metadata: Json | null;
}
export interface ReferralInsert {
  id?: string;
  referral_code?: string | null;
  source?: string | null;
  claimed_at?: string;
  metadata?: Json | null;
}
export interface ReferralUpdate {
  referral_code?: string | null;
  source?: string | null;
  metadata?: Json | null;
}

/* ───────── challenge_entries ───────── */
export interface ChallengeEntryRow {
  id: string;
  challenge_id: string | null;
  audit_id: string | null;
  aura_score: number | null;
  archetype: string | null;
  biggest_status_leak: string | null;
  share_card_data: Json | null;
  created_at: string;
}
export interface ChallengeEntryInsert {
  id?: string;
  challenge_id?: string | null;
  audit_id?: string | null;
  aura_score?: number | null;
  archetype?: string | null;
  biggest_status_leak?: string | null;
  share_card_data?: Json | null;
  created_at?: string;
}
export interface ChallengeEntryUpdate {
  challenge_id?: string | null;
  audit_id?: string | null;
  aura_score?: number | null;
  archetype?: string | null;
  biggest_status_leak?: string | null;
  share_card_data?: Json | null;
}

/* ───────── progress_comparisons ───────── */
export interface ProgressComparisonRow {
  id: string;
  before_audit_id: string | null;
  after_audit_id: string | null;
  before_score: number | null;
  after_score: number | null;
  score_delta: number | null;
  improved_signals: Json | null;
  remaining_leaks: Json | null;
  summary: string | null;
  created_at: string;
}
export interface ProgressComparisonInsert {
  id?: string;
  before_audit_id?: string | null;
  after_audit_id?: string | null;
  before_score?: number | null;
  after_score?: number | null;
  score_delta?: number | null;
  improved_signals?: Json | null;
  remaining_leaks?: Json | null;
  summary?: string | null;
  created_at?: string;
}
export interface ProgressComparisonUpdate {
  before_audit_id?: string | null;
  after_audit_id?: string | null;
  before_score?: number | null;
  after_score?: number | null;
  score_delta?: number | null;
  improved_signals?: Json | null;
  remaining_leaks?: Json | null;
  summary?: string | null;
}

/* ───────── product_unlocks ───────── */
export interface ProductUnlockRow {
  id: string;
  audit_id: string | null;
  order_id: string | null;
  product_type: string | null;
  unlock_method: string | null;
  unlock_code: string | null;
  unlocked_at: string;
}
export interface ProductUnlockInsert {
  id?: string;
  audit_id?: string | null;
  order_id?: string | null;
  product_type?: string | null;
  unlock_method?: string | null;
  unlock_code?: string | null;
  unlocked_at?: string;
}
export interface ProductUnlockUpdate {
  audit_id?: string | null;
  order_id?: string | null;
  product_type?: string | null;
  unlock_method?: string | null;
  unlock_code?: string | null;
}
