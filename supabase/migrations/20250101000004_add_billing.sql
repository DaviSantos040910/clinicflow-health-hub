-- Migration: Add Patient Billing Module
-- Created by Jules

-- 1. Create Status Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bill_status') THEN
        CREATE TYPE public.bill_status AS ENUM ('pending', 'paid', 'canceled');
    END IF;
END $$;

-- 2. Create Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL, -- Nullable for ad-hoc bills
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status public.bill_status DEFAULT 'pending',
    payment_link TEXT,
    payment_method TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create Secure Billing Config Table
-- We separate this from 'organizations' because 'organizations' is publicly readable (for login portal).
-- Sensitive gateway credentials must be protected.
CREATE TABLE IF NOT EXISTS public.organization_billing_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    payment_gateway_account_id TEXT, -- Stripe Connect ID or Asaas Token
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    CONSTRAINT organization_billing_configs_org_key UNIQUE (organization_id)
);

-- 4. Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_billing_configs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Bills

-- READ: Admin, Receptionist, Doctor can view bills
CREATE POLICY "Tenant Users can view bills"
ON public.bills
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.bills.organization_id
    AND role IN ('owner', 'admin', 'receptionist', 'doctor')
  )
);

-- WRITE (Insert/Update): Only Admin and Receptionist
CREATE POLICY "Admins and Receptionists can manage bills"
ON public.bills
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.bills.organization_id
    AND role IN ('owner', 'admin', 'receptionist')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.bills.organization_id
    AND role IN ('owner', 'admin', 'receptionist')
  )
);

-- 6. RLS Policies for Billing Configs (Strict)

-- Only Owner and Admin can view/manage payment credentials
CREATE POLICY "Owners and Admins can manage billing config"
ON public.organization_billing_configs
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.organization_billing_configs.organization_id
    AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.organization_billing_configs.organization_id
    AND role IN ('owner', 'admin')
  )
);

-- 7. Triggers

-- Auto-assign organization_id for Bills if missing (Safety net)
DROP TRIGGER IF EXISTS set_bills_org_id ON public.bills;
CREATE TRIGGER set_bills_org_id
  BEFORE INSERT ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

-- Update updated_at timestamp

-- Ensure function exists (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_configs_updated_at
  BEFORE UPDATE ON public.organization_billing_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
