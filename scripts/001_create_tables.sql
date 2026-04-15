-- ServiceSphere Database Schema
-- AI-Based SLA & Vendor Performance Management System

-- Drop existing types if they exist (for clean setup)
DO $$ BEGIN
  DROP TYPE IF EXISTS user_role CASCADE;
  DROP TYPE IF EXISTS company_type CASCADE;
  DROP TYPE IF EXISTS contract_status CASCADE;
  DROP TYPE IF EXISTS issue_status CASCADE;
  DROP TYPE IF EXISTS issue_priority CASCADE;
  DROP TYPE IF EXISTS penalty_type CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create enum types
CREATE TYPE user_role AS ENUM ('company', 'vendor');
CREATE TYPE company_type AS ENUM ('product', 'service');
CREATE TYPE contract_status AS ENUM ('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled');
CREATE TYPE issue_status AS ENUM ('raised', 'accepted', 'in_progress', 'resolved', 'completed', 'reopened');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE penalty_type AS ENUM ('warning', 'penalty', 'rating_decrease', 'flagged');

-- Users/Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'company',
  company_type company_type,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_issues_handled INTEGER DEFAULT 0,
  sla_success_rate DECIMAL(5,2) DEFAULT 100.00,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table (vendors offer services)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  status contract_status DEFAULT 'pending',
  duration_months INTEGER NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority issue_priority DEFAULT 'medium',
  status issue_status DEFAULT 'raised',
  service_type TEXT,
  ai_response_time_minutes INTEGER,
  ai_resolution_time_minutes INTEGER,
  actual_response_time_minutes INTEGER,
  actual_resolution_time_minutes INTEGER,
  raised_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reopened_at TIMESTAMPTZ,
  vendor_notes TEXT,
  client_feedback TEXT,
  sla_violated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance records table
CREATE TABLE IF NOT EXISTS public.performance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  response_time_score DECIMAL(5,2),
  resolution_time_score DECIMAL(5,2),
  sla_compliance_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Penalties table
CREATE TABLE IF NOT EXISTS public.penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  penalty_type penalty_type NOT NULL,
  reason TEXT NOT NULL,
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true OR vendor_id = auth.uid());
CREATE POLICY "Vendors can manage own services" ON public.services FOR ALL USING (vendor_id = auth.uid());

-- RLS Policies for contracts
CREATE POLICY "Users can view own contracts" ON public.contracts FOR SELECT USING (client_id = auth.uid() OR vendor_id = auth.uid());
CREATE POLICY "Clients can create contracts" ON public.contracts FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Contract parties can update" ON public.contracts FOR UPDATE USING (client_id = auth.uid() OR vendor_id = auth.uid());

-- RLS Policies for issues
CREATE POLICY "Users can view own issues" ON public.issues FOR SELECT USING (client_id = auth.uid() OR vendor_id = auth.uid());
CREATE POLICY "Clients can create issues" ON public.issues FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Issue parties can update" ON public.issues FOR UPDATE USING (client_id = auth.uid() OR vendor_id = auth.uid());

-- RLS Policies for performance_records
CREATE POLICY "Vendors can view own performance" ON public.performance_records FOR SELECT USING (vendor_id = auth.uid());
CREATE POLICY "System can insert performance" ON public.performance_records FOR INSERT WITH CHECK (true);

-- RLS Policies for penalties
CREATE POLICY "Vendors can view own penalties" ON public.penalties FOR SELECT USING (vendor_id = auth.uid());
CREATE POLICY "System can insert penalties" ON public.penalties FOR INSERT WITH CHECK (true);

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Clients can insert ratings" ON public.ratings FOR INSERT WITH CHECK (client_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_vendor ON public.services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON public.contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_issues_contract ON public.issues(contract_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_vendor ON public.penalties(vendor_id);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name, role, company_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'company_name', 'Unknown Company'),
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'company'),
    CASE 
      WHEN new.raw_user_meta_data ->> 'company_type' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'company_type')::company_type
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
DROP TRIGGER IF EXISTS update_issues_updated_at ON public.issues;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
