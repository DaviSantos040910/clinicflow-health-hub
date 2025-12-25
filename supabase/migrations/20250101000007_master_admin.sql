-- Migration: Master Admin Backoffice Support
-- Created by Jules

-- 1. Add Super Admin Flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 2. RPC: Get Master Metrics (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_master_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_clinics INT;
  active_subscriptions INT; -- Proxy for MRR count
  total_patients INT;
BEGIN
  -- Check permission
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT COUNT(*) INTO total_clinics FROM public.organizations;
  SELECT COUNT(*) INTO active_subscriptions FROM public.organizations WHERE subscription_status = 'active';
  SELECT COUNT(*) INTO total_patients FROM public.patients;

  RETURN jsonb_build_object(
    'total_clinics', total_clinics,
    'active_subscriptions', active_subscriptions,
    'total_patients', total_patients
  );
END;
$$;

-- 3. RPC: Get All Tenants (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_all_tenants()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  owner_email TEXT,
  subscription_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permission
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    p.email as owner_email,
    o.subscription_status::TEXT,
    o.created_at,
    CASE WHEN o.subscription_status = 'canceled' THEN true ELSE false END as is_blocked -- Mock logic for block, real block column ideally needed
  FROM public.organizations o
  LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'owner';
END;
$$;

-- 4. RPC: Toggle Tenant Status (Simplification: Just cancel subscription to block)
CREATE OR REPLACE FUNCTION public.admin_toggle_tenant_status(target_org_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permission
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  -- We cast the text to the enum type
  UPDATE public.organizations
  SET subscription_status = new_status::public.subscription_status
  WHERE id = target_org_id;
END;
$$;
