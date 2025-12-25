import { Database } from "@/integrations/supabase/types";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"] & {
  subscription_status?: 'active' | 'past_due' | 'trial' | 'canceled' | 'incomplete';
  plan_type?: string;
  stripe_customer_id?: string;
};

export type OrganizationRole = Database["public"]["Enums"]["organization_role"];

export interface OrganizationState {
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
}
