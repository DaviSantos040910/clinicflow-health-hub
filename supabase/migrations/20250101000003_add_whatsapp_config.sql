-- Migration: Add WhatsApp Configuration Table
-- Created by Jules

CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  instance_id TEXT,
  api_key TEXT,
  is_active BOOLEAN DEFAULT false,
  bot_welcome_message TEXT DEFAULT 'Olá! Bem-vindo à nossa clínica. Como podemos ajudar?',
  bot_fallback_message TEXT DEFAULT 'Desculpe, não entendi. Escolha uma das opções do menu.',
  trigger_menu JSONB DEFAULT '{"1": "Agendar Consulta", "2": "Meus Agendamentos", "3": "Falar com Atendente"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure one config per organization
  CONSTRAINT whatsapp_configs_organization_id_key UNIQUE (organization_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. View: Only users belonging to the organization can view
CREATE POLICY "Users can view own organization whatsapp config"
ON public.whatsapp_configs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.whatsapp_configs.organization_id
    AND role IN ('owner', 'admin') -- Only admins/owners should see configs
  )
);

-- 2. Insert: Only admins/owners of the organization
CREATE POLICY "Admins can insert whatsapp config"
ON public.whatsapp_configs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.whatsapp_configs.organization_id
    AND role IN ('owner', 'admin')
  )
);

-- 3. Update: Only admins/owners of the organization
CREATE POLICY "Admins can update whatsapp config"
ON public.whatsapp_configs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = public.whatsapp_configs.organization_id
    AND role IN ('owner', 'admin')
  )
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_configs_timestamp
    BEFORE UPDATE ON public.whatsapp_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_configs_updated_at();
