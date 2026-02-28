import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { useAuth } from "@/contexts/AuthContext";

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
  fetchOrganizationBySlug: (slug: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch organization based on logged-in user's profile
  useEffect(() => {
    const loadUserOrganization = async () => {
      if (!profile?.organization_id) {
        setOrganization(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.organization_id)
          .single();

        if (error) {
          throw error;
        }

        setOrganization(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading user organization:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserOrganization();
  }, [profile?.organization_id]);

  const fetchOrganizationBySlug = async (slug: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        throw error;
      }

      setOrganization(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching organization by slug:", err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        isLoading,
        error,
        fetchOrganizationBySlug,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
