-- Safe Fix for RLS Policies - Bodega Academy
-- This script safely handles existing policies and fixes the recursion issue

-- First, drop ALL existing policies to start clean
DO $$ 
BEGIN
    -- Drop all policies for user_profiles
    DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    
    -- Drop all policies for modules
    DROP POLICY IF EXISTS "Everyone can read active modules" ON modules;
    DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
    
    -- Drop all policies for user_progress
    DROP POLICY IF EXISTS "Users can read their own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can update their own progress records" ON user_progress;
    DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
    DROP POLICY IF EXISTS "Admins can read all progress" ON user_progress;
    DROP POLICY IF EXISTS "Admins can manage all progress" ON user_progress;
    
    RAISE NOTICE 'All existing policies dropped successfully';
END $$;

-- Create the admin check function (avoiding recursion)
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
    user_role TEXT;
BEGIN
    -- Get email from JWT
    user_email := auth.jwt() ->> 'email';
    
    -- Check if it's the admin email first
    IF user_email = 'admin@bodega-academy.com' THEN
        RETURN true;
    END IF;
    
    -- Otherwise check role from JWT metadata
    user_role := COALESCE(
        (auth.jwt() ->> 'user_metadata')::json ->> 'role',
        'employee'
    );
    
    RETURN user_role IN ('admin', 'hr');
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create NEW User Profiles RLS Policies
CREATE POLICY "allow_select_profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "allow_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "allow_insert_own_profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create NEW Modules RLS Policies
CREATE POLICY "allow_read_active_modules" ON modules
    FOR SELECT USING (is_active = true);

CREATE POLICY "allow_admin_manage_modules" ON modules
    FOR ALL USING (public.is_admin_or_hr());

-- Create NEW User Progress RLS Policies  
CREATE POLICY "allow_read_own_progress" ON user_progress
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_hr());

CREATE POLICY "allow_insert_own_progress" ON user_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_update_own_progress" ON user_progress
    FOR UPDATE USING (user_id = auth.uid());

-- Update the user creation function
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
    
    -- Update the user metadata to include the role
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', user_role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (in case it needs updating)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=================================';
    RAISE NOTICE 'RLS policies fixed successfully!';
    RAISE NOTICE 'Infinite recursion issue resolved';
    RAISE NOTICE 'Admin email: admin@bodega-academy.com';
    RAISE NOTICE '=================================';
END $$;