-- Robust Seed Data for "Clínica Vida Saudável"
-- Usage: Run this in your Supabase SQL Editor or via `supabase db reset`.
-- Note: Creating auth.users requires admin privileges (service_role).

BEGIN;

DO $$
DECLARE
  -- Static UUIDs for reproducibility
  org_id UUID := 'd0613276-f571-4603-b097-f5da77202300';

  -- Users
  admin_id UUID := 'd0613276-f571-4603-b097-f5da77202301';
  receptionist_id UUID := 'd0613276-f571-4603-b097-f5da77202302';
  doc1_id_user UUID := 'd0613276-f571-4603-b097-f5da77202303';
  doc2_id_user UUID := 'd0613276-f571-4603-b097-f5da77202304';

  -- Professionals (Business Entity)
  prof1_id UUID := gen_random_uuid();
  prof2_id UUID := gen_random_uuid();

  -- Patients (We'll generate a few IDs to reference later)
  pat1_id UUID := gen_random_uuid();
  pat2_id UUID := gen_random_uuid();
  pat3_id UUID := gen_random_uuid();

  -- Encrypted Password (usually '$2a$10$...' for '123456')
  -- Using a dummy hash that might not work for real login unless Supabase hashing matches,
  -- but is sufficient for foreign keys.
  -- For local dev, supabase auth usually handles this if using `config.toml` users,
  -- but here we insert for data integrity.
  dummy_password TEXT := '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa';

BEGIN

  ---------------------------------------------------------------------------
  -- 1. AUTH USERS (Mocking Identity)
  ---------------------------------------------------------------------------
  -- Attempt to insert users if we have permission.
  -- If running in SQL Editor without superuser, this might fail, so we wrap or assume local dev.

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
  ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 'admin@vidasaudavel.com', dummy_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Doutor Gestor"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', receptionist_id, 'authenticated', 'authenticated', 'ana@vidasaudavel.com', dummy_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Paula"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', doc1_id_user, 'authenticated', 'authenticated', 'silva@vidasaudavel.com', dummy_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Silva"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', doc2_id_user, 'authenticated', 'authenticated', 'santos@vidasaudavel.com', dummy_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dra. Santos"}', now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  ---------------------------------------------------------------------------
  -- 2. ORGANIZATION
  ---------------------------------------------------------------------------
  INSERT INTO public.organizations (id, name, slug, logo_url, primary_color, subscription_status, plan_type, stripe_customer_id)
  VALUES (
    org_id,
    'Clínica Vida Saudável',
    'vida-saudavel',
    'https://placehold.co/200x200/4ade80/ffffff.png?text=VS',
    '#16a34a', -- Green-600
    'active',
    'pro',
    'cus_test_123456'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color;

  ---------------------------------------------------------------------------
  -- 3. PROFILES & ROLES
  ---------------------------------------------------------------------------

  -- Admin (Owner)
  INSERT INTO public.profiles (id, full_name, email, organization_id, role, is_super_admin)
  VALUES (admin_id, 'Doutor Gestor', 'admin@vidasaudavel.com', org_id, 'owner', true)
  ON CONFLICT (id) DO UPDATE SET organization_id = org_id, role = 'owner';

  INSERT INTO public.user_roles (user_id, role) VALUES (admin_id, 'admin') ON CONFLICT DO NOTHING;

  -- Receptionist
  INSERT INTO public.profiles (id, full_name, email, organization_id, role)
  VALUES (receptionist_id, 'Ana Paula', 'ana@vidasaudavel.com', org_id, 'receptionist')
  ON CONFLICT (id) DO UPDATE SET organization_id = org_id, role = 'receptionist';

  INSERT INTO public.user_roles (user_id, role) VALUES (receptionist_id, 'recepcionista') ON CONFLICT DO NOTHING;

  -- Doctors (Profile + Professional Entity)
  INSERT INTO public.profiles (id, full_name, email, organization_id, role)
  VALUES (doc1_id_user, 'Dr. Silva', 'silva@vidasaudavel.com', org_id, 'doctor')
  ON CONFLICT (id) DO UPDATE SET organization_id = org_id, role = 'doctor';

  INSERT INTO public.profiles (id, full_name, email, organization_id, role)
  VALUES (doc2_id_user, 'Dra. Santos', 'santos@vidasaudavel.com', org_id, 'doctor')
  ON CONFLICT (id) DO UPDATE SET organization_id = org_id, role = 'doctor';

  ---------------------------------------------------------------------------
  -- 4. PROFESSIONALS
  ---------------------------------------------------------------------------
  INSERT INTO public.professionals (id, organization_id, user_id, name, specialty, consultation_fee, registration_number)
  VALUES
  (prof1_id, org_id, doc1_id_user, 'Dr. Silva', 'Cardiologia', 350.00, 'CRM/SP 12345'),
  (prof2_id, org_id, doc2_id_user, 'Dra. Santos', 'Dermatologia', 400.00, 'CRM/SP 67890')
  ON CONFLICT DO NOTHING;

  ---------------------------------------------------------------------------
  -- 5. PATIENTS (15)
  ---------------------------------------------------------------------------
  INSERT INTO public.patients (id, organization_id, name, phone, email, birth_date)
  VALUES
  (pat1_id, org_id, 'Mariana Costa', '+5511999991111', 'mariana@email.com', '1990-05-15'),
  (pat2_id, org_id, 'Pedro Henrique', '+5511999991112', 'pedro@email.com', '1985-08-20'),
  (pat3_id, org_id, 'Lucas Ferreira', '+5511999991113', 'lucas@email.com', '1992-01-10'),
  (gen_random_uuid(), org_id, 'Camila Rocha', '+5511999991114', 'camila@email.com', '1988-11-05'),
  (gen_random_uuid(), org_id, 'Fernanda Alves', '+5511999991115', 'fernanda@email.com', '1995-03-25'),
  (gen_random_uuid(), org_id, 'Rafael Lima', '+5511999991116', 'rafael@email.com', '1980-07-30'),
  (gen_random_uuid(), org_id, 'Patricia Gomes', '+5511999991117', 'patricia@email.com', '1998-12-12'),
  (gen_random_uuid(), org_id, 'Rodrigo Martins', '+5511999991118', 'rodrigo@email.com', '1975-06-18'),
  (gen_random_uuid(), org_id, 'Juliana Mendes', '+5511999991119', 'juliana@email.com', '1991-09-09'),
  (gen_random_uuid(), org_id, 'Gustavo Silva', '+5511999991120', 'gustavo@email.com', '1983-04-04'),
  (gen_random_uuid(), org_id, 'Beatriz Souza', '+5511999991121', 'beatriz@email.com', '1996-02-28'),
  (gen_random_uuid(), org_id, 'Thiago Oliveira', '+5511999991122', 'thiago@email.com', '1989-10-15'),
  (gen_random_uuid(), org_id, 'Larissa Pereira', '+5511999991123', 'larissa@email.com', '1993-05-22'),
  (gen_random_uuid(), org_id, 'Felipe Santos', '+5511999991124', 'felipe@email.com', '1987-01-30'),
  (gen_random_uuid(), org_id, 'Amanda Rodrigues', '+5511999991125', 'amanda@email.com', '1994-08-14')
  ON CONFLICT DO NOTHING;

  ---------------------------------------------------------------------------
  -- 6. APPOINTMENTS (30)
  ---------------------------------------------------------------------------
  -- We'll use a loop to generate mixed data
  INSERT INTO public.appointments (organization_id, patient_id, professional_id, date_time, status, notes, created_at)
  SELECT
    org_id,
    id, -- patient_id from the FROM clause
    CASE WHEN random() > 0.5 THEN prof1_id ELSE prof2_id END, -- Random professional
    now() - (floor(random() * 30) || ' days')::interval + '09:00:00'::time + (floor(random() * 8) || ' hours')::interval,
    CASE
        WHEN random() < 0.2 THEN 'cancelada'
        WHEN random() < 0.6 THEN 'concluida'
        ELSE 'agendada'
    END,
    'Consulta gerada via seed',
    now() - (floor(random() * 30) || ' days')::interval
  FROM public.patients
  WHERE organization_id = org_id
  LIMIT 30; -- Postgres might cycle through patients if limit > 15, or we assume multiple inserts logic.
  -- Simpler approach: Insert multiple batches

  -- Batch 2 to ensure we hit 30
  INSERT INTO public.appointments (organization_id, patient_id, professional_id, date_time, status, notes)
  SELECT
    org_id,
    id,
    prof1_id,
    now() + (floor(random() * 15) || ' days')::interval + '14:00:00'::time,
    'agendada',
    'Retorno'
  FROM public.patients
  WHERE organization_id = org_id
  LIMIT 15;

  ---------------------------------------------------------------------------
  -- 7. BILLS (Financeiro)
  ---------------------------------------------------------------------------
  -- Generate bills for 'concluida' appointments (Paid)
  INSERT INTO public.patient_bills (
    organization_id, patient_id, appointment_id, amount, status,
    description, payment_method, paid_at, created_by, created_at
  )
  SELECT
    org_id,
    patient_id,
    id,
    350.00,
    'paid',
    'Consulta Particular',
    'credit_card',
    date_time, -- Paid at appointment time
    receptionist_id,
    created_at
  FROM public.appointments
  WHERE organization_id = org_id AND status = 'concluida'
  LIMIT 10;

  -- Generate bills for 'agendada' (Pending)
  INSERT INTO public.patient_bills (
    organization_id, patient_id, appointment_id, amount, status,
    description, created_by, created_at
  )
  SELECT
    org_id,
    patient_id,
    id,
    350.00,
    'pending',
    'Consulta Agendada',
    receptionist_id,
    created_at
  FROM public.appointments
  WHERE organization_id = org_id AND status = 'agendada'
  LIMIT 5;

  ---------------------------------------------------------------------------
  -- 8. WHATSAPP CONFIG
  ---------------------------------------------------------------------------
  INSERT INTO public.whatsapp_configs (organization_id, is_active, bot_welcome_message, trigger_menu)
  VALUES (
    org_id,
    true,
    'Olá! Seja bem-vindo à Clínica Vida Saudável. 🌿\nComo podemos cuidar de você hoje?',
    '{"1": "Agendar Consulta", "2": "Falar com Recepcionista", "3": "Endereço"}'::jsonb
  )
  ON CONFLICT (organization_id) DO NOTHING;

END $$;

COMMIT;
