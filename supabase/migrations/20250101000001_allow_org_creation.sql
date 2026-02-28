-- Migration: Allow Organization Creation by Authenticated Users
-- Created by Jules

-- Allow authenticated users to create organizations
-- This is necessary for the "New Clinic" wizard flow where a user signs up first, then creates the org.
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Also ensure they can update their own profile to set the organization_id (already covered by "Users can update their own profile", but good to verify context)
-- Existing policy: "Users can update their own profile" USING (auth.uid() = id) - This is sufficient.
