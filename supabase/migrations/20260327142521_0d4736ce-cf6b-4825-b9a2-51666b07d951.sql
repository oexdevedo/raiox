-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  profession TEXT NOT NULL DEFAULT '',
  contact_status TEXT NOT NULL DEFAULT 'Pendente',
  last_contact_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Incomes table
CREATE TABLE public.incomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own incomes" ON public.incomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own incomes" ON public.incomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own incomes" ON public.incomes FOR DELETE USING (auth.uid() = user_id);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Behavioral answers table
CREATE TABLE public.behavioral_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER NOT NULL DEFAULT 0,
  total_percentage INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.behavioral_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own behavioral answers" ON public.behavioral_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own behavioral answers" ON public.behavioral_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own behavioral answers" ON public.behavioral_answers FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_behavioral_answers_updated_at BEFORE UPDATE ON public.behavioral_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin role setup
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all incomes" ON public.incomes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all expenses" ON public.expenses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all behavioral answers" ON public.behavioral_answers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, region, birth_date, whatsapp, profession)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'region', ''),
    COALESCE(NEW.raw_user_meta_data->>'birthDate', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data->>'profession', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Custom Buttons table
CREATE TABLE public.custom_buttons (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE public.custom_buttons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for custom buttons" ON public.custom_buttons FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Admins can update custom buttons" ON public.custom_buttons FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert custom buttons" ON public.custom_buttons FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Interactions table
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own interactions" ON public.interactions FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Admins can view interactions" ON public.interactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Seed default custom buttons
INSERT INTO public.custom_buttons (id, config) 
VALUES (1, '{"negative":{"visible":false,"label":"","url":"","message":""},"neutral":{"visible":false,"label":"","url":"","message":""},"positive":{"visible":false,"label":"","url":"","message":""}}')
ON CONFLICT (id) DO NOTHING;