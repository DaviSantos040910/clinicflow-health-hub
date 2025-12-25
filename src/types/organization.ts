import { Database } from "@/integrations/supabase/types";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export type OrganizationRole = Database["public"]["Enums"]["organization_role"];

export interface OrganizationState {
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
}
