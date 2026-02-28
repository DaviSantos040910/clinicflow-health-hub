-- Migration: Enhance Master Admin & Impersonation
-- Created by Jules

-- 1. Helper function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND is_super_admin = true
  );
$$;

-- 2. Update RLS Policies to allow Super Admin access
-- We need to update policies for: organizations, patients, appointments, professionals, patient_bills, whatsapp_configs

-- Organizations (Already readable public/auth, but let's ensure full access for updates if needed)
CREATE POLICY "Super Admins can manage all organizations"
ON public.organizations
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Patients
CREATE POLICY "Super Admins can manage all patients"
ON public.patients
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Appointments
CREATE POLICY "Super Admins can manage all appointments"
ON public.appointments
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Professionals
CREATE POLICY "Super Admins can manage all professionals"
ON public.professionals
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Patient Bills
CREATE POLICY "Super Admins can manage all bills"
ON public.patient_bills
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Whatsapp Configs
CREATE POLICY "Super Admins can manage all whatsapp configs"
ON public.whatsapp_configs
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Profiles (To read owner info across tenants)
CREATE POLICY "Super Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (public.is_super_admin(auth.uid()));


-- 3. Update Master Metrics RPC to include "Inadimplentes" (Defaulting/Canceled)
CREATE OR REPLACE FUNCTION public.get_master_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_clinics INT;
  active_subscriptions INT;
  defaulting_clinics INT; -- Inadimplentes/Cancelados/Past Due
  total_patients INT;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT COUNT(*) INTO total_clinics FROM public.organizations;

  SELECT COUNT(*) INTO active_subscriptions
  FROM public.organizations
  WHERE subscription_status = 'active' OR subscription_status = 'trial';

  SELECT COUNT(*) INTO defaulting_clinics
  FROM public.organizations
  WHERE subscription_status IN ('past_due', 'canceled', 'incomplete');

  SELECT COUNT(*) INTO total_patients FROM public.patients;

  RETURN jsonb_build_object(
    'total_clinics', total_clinics,
    'active_subscriptions', active_subscriptions,
    'defaulting_clinics', defaulting_clinics,
    'total_patients', total_patients
  );
END;
$$;

-- 4. Update Get All Tenants RPC to include Logo URL
DROP FUNCTION IF EXISTS public.get_all_tenants();
CREATE OR REPLACE FUNCTION public.get_all_tenants()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
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
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    p.email as owner_email,
    o.subscription_status::TEXT,
    o.created_at,
    CASE WHEN o.subscription_status = 'canceled' THEN true ELSE false END as is_blocked
  FROM public.organizations o
  LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'owner';
END;
$$;
