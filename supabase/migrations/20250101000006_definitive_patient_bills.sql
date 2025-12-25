-- Migration: Definitive Patient Bills Table
-- Created by Jules

-- 1. Clean up previous experimental table 'bills'
DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
DROP TRIGGER IF EXISTS set_bills_org_id ON public.bills;
DROP TABLE IF EXISTS public.bills;
DROP TYPE IF EXISTS public.bill_status;

-- 2. Create patient_bills table
CREATE TABLE IF NOT EXISTS public.patient_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'canceled', 'refunded')) DEFAULT 'pending',
    description TEXT,
    payment_method TEXT,
    payment_link_url TEXT,
    external_reference_id TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Indexes
CREATE INDEX idx_patient_bills_organization_id ON public.patient_bills(organization_id);
CREATE INDEX idx_patient_bills_status ON public.patient_bills(status);
CREATE INDEX idx_patient_bills_patient_id ON public.patient_bills(patient_id);
CREATE INDEX idx_patient_bills_appointment_id ON public.patient_bills(appointment_id);

-- 4. Enable RLS
ALTER TABLE public.patient_bills ENABLE ROW LEVEL SECURITY;

-- 5. Policies

-- VIEW: Members of the same organization
CREATE POLICY "View Organization Bills"
ON public.patient_bills
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.patient_bills.organization_id
    -- All roles (owner, admin, receptionist, doctor) can view
  )
);

-- INSERT: Owner, Admin, Receptionist (NOT Doctor)
CREATE POLICY "Generate Bills"
ON public.patient_bills
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.patient_bills.organization_id
    AND role IN ('owner', 'admin', 'receptionist')
  )
);

-- UPDATE: Owner, Admin (Receptionist can usually only create, but requirements said "Atualizar Status: Owner/Admin")
-- We'll allow Owner/Admin to update everything.
CREATE POLICY "Manage Bills (Owner/Admin)"
ON public.patient_bills
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.patient_bills.organization_id
    AND role IN ('owner', 'admin')
  )
);

-- DELETE: Owner/Admin only (optional, usually invoices aren't deleted but canceled)
CREATE POLICY "Delete Bills (Owner/Admin)"
ON public.patient_bills
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.patient_bills.organization_id
    AND role IN ('owner', 'admin')
  )
);


-- 6. Triggers

-- Auto-fill created_by
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_patient_bills_created_by
  BEFORE INSERT ON public.patient_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- Auto-assign organization_id (Consistency with other tables)
CREATE TRIGGER set_patient_bills_org_id
  BEFORE INSERT ON public.patient_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id();

-- Update updated_at
CREATE TRIGGER update_patient_bills_updated_at
  BEFORE UPDATE ON public.patient_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
