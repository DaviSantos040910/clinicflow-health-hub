-- Migration: Add Multi-tenancy
-- Created by Jules

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create organization_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_role') THEN
        CREATE TYPE public.organization_role AS ENUM ('owner', 'admin', 'doctor', 'receptionist');
    END IF;
END $$;

-- 3. Update profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role public.organization_role;

-- 4. Update business tables
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- 5. Migrate existing data
DO $$
DECLARE
  demo_org_id UUID;
BEGIN
  -- Create or get Demo Clinic
  INSERT INTO public.organizations (name, slug)
  VALUES ('Demo Clinic', 'demo-clinic')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO demo_org_id;

  -- Assign existing profiles
  UPDATE public.profiles
  SET organization_id = demo_org_id,
      role = 'admin' -- Default role for existing users
  WHERE organization_id IS NULL;

  -- Assign existing business data
  UPDATE public.patients
  SET organization_id = demo_org_id
  WHERE organization_id IS NULL;

  UPDATE public.appointments
  SET organization_id = demo_org_id
  WHERE organization_id IS NULL;

  UPDATE public.professionals
  SET organization_id = demo_org_id
  WHERE organization_id IS NULL;
END $$;

-- 6. Set NOT NULL constraints
ALTER TABLE public.patients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.professionals ALTER COLUMN organization_id SET NOT NULL;

-- 7. RLS Configuration

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;
CREATE POLICY "Anyone can view organizations" ON public.organizations
  FOR SELECT USING (true);

-- Business Tables Policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Helper function to set organization_id automatically
CREATE OR REPLACE FUNCTION public.set_organization_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM public.profiles
    WHERE id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers for auto-assignment
DROP TRIGGER IF EXISTS set_patients_org_id ON public.patients;
CREATE TRIGGER set_patients_org_id
  BEFORE INSERT ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_appointments_org_id ON public.appointments;
CREATE TRIGGER set_appointments_org_id
  BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_professionals_org_id ON public.professionals;
CREATE TRIGGER set_professionals_org_id
  BEFORE INSERT ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

-- RLS Policies (Tenant Isolation)

-- Patients
DROP POLICY IF EXISTS "Tenant Isolation for Patients" ON public.patients;
CREATE POLICY "Tenant Isolation for Patients" ON public.patients
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Appointments
DROP POLICY IF EXISTS "Tenant Isolation for Appointments" ON public.appointments;
CREATE POLICY "Tenant Isolation for Appointments" ON public.appointments
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Professionals
DROP POLICY IF EXISTS "Tenant Isolation for Professionals" ON public.professionals;
CREATE POLICY "Tenant Isolation for Professionals" ON public.professionals
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
