import { Database } from "@/integrations/supabase/types";

export interface WhatsappConfig {
  id: string;
  organization_id: string;
  instance_id: string | null;
  api_key: string | null;
  is_active: boolean;
  bot_welcome_message: string;
  bot_fallback_message: string;
  trigger_menu: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// Helper to type the JSONB from Supabase which comes as generic Json
export type WhatsappConfigRow = Database['public']['Tables']['whatsapp_configs']['Row'];
