-- Seed Data for "Clínica Modelo"
-- This script populates the database with demo data for testing and screenshots.

-- 1. Create Organization
DO $$
DECLARE
  org_id UUID := '00000000-0000-0000-0000-000000000001'; -- Fixed ID for reproducibility
  owner_id UUID := '00000000-0000-0000-0000-000000000002'; -- Dummy Owner ID (Needs matching Auth User in real dev)
  doc1_id UUID := gen_random_uuid();
  doc2_id UUID := gen_random_uuid();
  doc3_id UUID := gen_random_uuid();
BEGIN
  -- Cleanup
  DELETE FROM public.organizations WHERE id = org_id;

  -- Insert Org
  INSERT INTO public.organizations (id, name, slug, primary_color, subscription_status, plan_type)
  VALUES (
    org_id,
    'Clínica Modelo',
    'clinica-modelo',
    '#0ea5e9', -- Sky Blue
    'active',
    'pro'
  );

  -- 2. Create Professionals
  INSERT INTO public.professionals (id, organization_id, name, specialty, consultation_fee) VALUES
  (doc1_id, org_id, 'Dr. Roberto Almeida', 'Cardiologia', 350.00),
  (doc2_id, org_id, 'Dra. Juliana Costa', 'Dermatologia', 280.00),
  (doc3_id, org_id, 'Dr. Lucas Silva', 'Ortopedia', 300.00);

  -- 3. Create Patients (10)
  INSERT INTO public.patients (organization_id, name, phone, email) VALUES
  (org_id, 'Ana Silva', '+5511999990001', 'ana@email.com'),
  (org_id, 'Bruno Santos', '+5511999990002', 'bruno@email.com'),
  (org_id, 'Carla Oliveira', '+5511999990003', 'carla@email.com'),
  (org_id, 'Daniel Souza', '+5511999990004', 'daniel@email.com'),
  (org_id, 'Elena Costa', '+5511999990005', 'elena@email.com'),
  (org_id, 'Fabio Lima', '+5511999990006', 'fabio@email.com'),
  (org_id, 'Gabriela Rocha', '+5511999990007', 'gabi@email.com'),
  (org_id, 'Hugo Alves', '+5511999990008', 'hugo@email.com'),
  (org_id, 'Isabela Dias', '+5511999990009', 'isa@email.com'),
  (org_id, 'Jorge Martins', '+5511999990010', 'jorge@email.com');

  -- 4. Create Appointments (15 mixed)
  -- We use a CTE to pick patients randomly for variety
  WITH patient_ids AS (SELECT id FROM public.patients WHERE organization_id = org_id)
  INSERT INTO public.appointments (organization_id, patient_id, professional_id, date_time, status, notes)
  SELECT
    org_id,
    (SELECT id FROM patient_ids ORDER BY random() LIMIT 1),
    (ARRAY[doc1_id, doc2_id, doc3_id])[floor(random() * 3 + 1)],
    now() + (n || ' days')::interval + '09:00:00'::time,
    (ARRAY['agendada', 'confirmada', 'concluida', 'agendada'])[floor(random() * 4 + 1)],
    'Consulta de rotina'
  FROM generate_series(-5, 9) as n;

  -- 5. WhatsApp Config
  INSERT INTO public.whatsapp_configs (organization_id, is_active, bot_welcome_message, bot_fallback_message)
  VALUES (
    org_id,
    true,
    'Olá! Bem-vindo à Clínica Modelo. Digite o número da opção desejada.',
    'Desculpe, não entendi.'
  );

  -- 6. Billing (Some paid, some pending)
  INSERT INTO public.patient_bills (organization_id, patient_id, appointment_id, amount, status, description, created_at)
  SELECT
    org_id,
    patient_id,
    id,
    300.00,
    CASE WHEN status = 'concluida' THEN 'paid' ELSE 'pending' END,
    'Consulta Médica',
    created_at
  FROM public.appointments
  WHERE organization_id = org_id
  LIMIT 10;

END $$;
