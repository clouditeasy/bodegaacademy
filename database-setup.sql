-- Bodega Academy Database Setup Script
-- Execute this script in your Supabase SQL editor to create the complete database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'hr')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modules Table
CREATE TABLE modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    pdf_url TEXT,
    quiz_questions JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. User Progress Table
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_modules_active ON modules(is_active);
CREATE INDEX idx_modules_created_by ON modules(created_by);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_completed_at ON user_progress(completed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE 
            WHEN NEW.email = 'admin@bodega-academy.com' THEN 'admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can read all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

-- Modules RLS Policies
CREATE POLICY "Everyone can read active modules" ON modules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage modules" ON modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

-- User Progress RLS Policies
CREATE POLICY "Users can read their own progress" ON user_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress records" ON user_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can read all progress" ON user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

-- Insert sample data (optional)
-- Uncomment these lines if you want some initial test data

/*
-- Sample modules
INSERT INTO modules (title, description, content, quiz_questions, created_by) 
SELECT 
    'Welcome to Bodega Academy',
    'Introduction to our learning management system',
    '<h1>Welcome!</h1><p>This is your first module in Bodega Academy.</p>',
    '[{"question": "What is the name of our academy?", "options": ["Bodega Academy", "Other Academy", "Test Academy"], "correct": 0}]'::jsonb,
    id
FROM user_profiles 
WHERE role = 'admin' 
LIMIT 1;

INSERT INTO modules (title, description, content, quiz_questions, created_by)
SELECT 
    'Safety Procedures',
    'Essential safety guidelines for all employees',
    '<h1>Safety First</h1><p>Learn about our safety procedures and protocols.</p>',
    '[{"question": "What should you do in case of emergency?", "options": ["Run", "Follow emergency procedures", "Ignore"], "correct": 1}]'::jsonb,
    id
FROM user_profiles 
WHERE role = 'admin' 
LIMIT 1;
*/

-- Create a function to get user progress statistics (useful for analytics)
CREATE OR REPLACE FUNCTION get_user_progress_stats(user_uuid UUID)
RETURNS TABLE (
    total_modules BIGINT,
    completed_modules BIGINT,
    in_progress_modules BIGINT,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM modules WHERE is_active = true) as total_modules,
        (SELECT COUNT(*) FROM user_progress WHERE user_id = user_uuid AND status = 'completed') as completed_modules,
        (SELECT COUNT(*) FROM user_progress WHERE user_id = user_uuid AND status = 'in_progress') as in_progress_modules,
        ROUND(
            (SELECT COUNT(*) FROM user_progress WHERE user_id = user_uuid AND status = 'completed')::NUMERIC * 100.0 / 
            NULLIF((SELECT COUNT(*) FROM modules WHERE is_active = true), 0), 
            2
        ) as completion_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Bodega Academy database schema created successfully!';
    RAISE NOTICE 'Admin account: admin@bodega-academy.com';
    RAISE NOTICE 'Remember to set up your environment variables in .env';
END $$;