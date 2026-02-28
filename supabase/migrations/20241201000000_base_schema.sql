-- Base Schema (Reconstructed for new deployments)
-- Matches src/integrations/supabase/types.ts

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birth_date DATE,
    observations TEXT,
    user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    registration_number TEXT,
    consultation_fee NUMERIC,
    schedule JSONB,
    user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL
);
