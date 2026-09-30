-- 1. Sequences for Auto-incrementing Custom IDs
CREATE SEQUENCE IF NOT EXISTS worker_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS client_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS task_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS submission_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS payment_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS withdrawal_id_seq START WITH 1 INCREMENT BY 1;

-- 2. Function to generate sequential padded ID (e.g., TB-W-000001)
CREATE OR REPLACE FUNCTION generate_custom_tb_id(prefix TEXT, seq_name TEXT) 
RETURNS TEXT AS $$
DECLARE
  next_val INT;
BEGIN
  EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_val;
  RETURN prefix || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Profiles Table (Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  custom_id TEXT UNIQUE NOT NULL, -- e.g., TB-W-000001 or TB-C-000001
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('WORKER', 'CLIENT', 'ADMIN')) DEFAULT 'WORKER',
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT UNIQUE NOT NULL, -- e.g., TB-T-000001
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  reward DECIMAL(10,2) NOT NULL,
  required_workers INT DEFAULT 1,
  status TEXT DEFAULT 'PUBLISHED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Submissions Table
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT UNIQUE NOT NULL, -- e.g., TB-S-000001
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_data TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Payments Table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT UNIQUE NOT NULL, -- e.g., TB-P-000001
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'COMPLETED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Withdrawals Table
CREATE TABLE public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  withdrawal_id TEXT UNIQUE NOT NULL, -- e.g., TB-WD-000001
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);