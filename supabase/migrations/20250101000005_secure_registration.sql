-- Migration: Secure Organization Registration Logic
-- Created by Jules

-- Create a secure function to handle organization creation and owner assignment
-- This replaces the client-side logic to prevent privilege escalation vulnerabilities
CREATE OR REPLACE FUNCTION public.create_organization_and_owner(
  org_name TEXT,
  org_slug TEXT,
  org_color TEXT,
  user_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  user_id UUID;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Insert Organization
  INSERT INTO public.organizations (name, slug, primary_color)
  VALUES (org_name, org_slug, org_color)
  RETURNING id INTO new_org_id;

  -- 2. Update Profile (Link to Org, Make Owner, Set Name)
  UPDATE public.profiles
  SET
    organization_id = new_org_id,
    role = 'owner',
    full_name = user_name
  WHERE id = user_id;

  -- 3. Return result
  RETURN jsonb_build_object(
    'organization_id', new_org_id,
    'slug', org_slug
  );
END;
$$;
