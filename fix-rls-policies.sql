-- Fix RLS Policies for Bodega Academy
-- Run this script to fix the infinite recursion issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
DROP POLICY IF EXISTS "Admins can read all progress" ON user_progress;

-- Create fixed User Profiles RLS Policies
CREATE POLICY "Users can read all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to check if current user is admin/hr (avoiding recursion)
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get the role directly from auth.users metadata first
    SELECT COALESCE(
        (auth.jwt() ->> 'user_metadata')::json ->> 'role',
        'employee'
    ) INTO user_role;
    
    -- If not found in metadata, check if it's the admin email
    IF user_role = 'employee' AND auth.jwt() ->> 'email' = 'admin@bodega-academy.com' THEN
        user_role := 'admin';
    END IF;
    
    RETURN user_role IN ('admin', 'hr');
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed Modules RLS Policies
CREATE POLICY "Everyone can read active modules" ON modules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage modules" ON modules
    FOR ALL USING (public.is_admin_or_hr());

-- Fixed User Progress RLS Policies  
CREATE POLICY "Users can read their own progress" ON user_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can read all progress" ON user_progress
    FOR SELECT USING (public.is_admin_or_hr());

CREATE POLICY "Admins can manage all progress" ON user_progress
    FOR ALL USING (public.is_admin_or_hr());

-- Update the user creation function to also update the JWT metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Determine the user role
    user_role := CASE 
        WHEN NEW.email = 'admin@bodega-academy.com' THEN 'admin'
        ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    END;
    
    -- Insert into user_profiles
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        user_role
    );
    
    -- Update the user metadata to include the role for easy access
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', user_role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully!';
    RAISE NOTICE 'The infinite recursion issue has been resolved.';
END $$;