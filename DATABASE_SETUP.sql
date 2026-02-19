-- ==========================================
-- NEXAAGENDA DATABASE SETUP - COMPLETO
-- Execute este arquivo no Supabase SQL Editor
-- ==========================================
-- Data: 16 de fevereiro de 2026
-- Objetivo: Criar todas as tabelas necessárias

-- ==========================================
-- DELETAR TABELAS ANTIGAS (se existirem)
-- ==========================================
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ==========================================
-- 1. CRIAR TABELA PATIENTS (CLIENTES)
-- ==========================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para patients
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- RLS para patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own patients"
  ON patients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Permitir inserção pública (necessário para agendamento público)
DROP POLICY IF EXISTS "Allow public insert for patients" ON patients;
CREATE POLICY "Allow public insert for patients"
  ON patients
  FOR INSERT
  WITH CHECK (true);

-- ==========================================
-- 2. CRIAR TABELA SERVICES (SERVIÇOS)
-- ==========================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para services
CREATE INDEX idx_services_user_id ON services(user_id);

-- RLS para services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own services"
  ON services
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Qualquer pessoa pode VER serviços (para agendamento público)
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services"
  ON services
  FOR SELECT
  USING (true);

-- ==========================================
-- 3. CRIAR TABELA APPOINTMENTS (AGENDAMENTOS)
-- ==========================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'Pendente',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para appointments
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- RLS para appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own appointments"
  ON appointments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. CRIAR TABELA PROFILES_PUBLIC (PERFIS PÚBLICOS)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles_public (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  nome_profissional VARCHAR(255) NOT NULL,
  cor_primaria VARCHAR(20) DEFAULT '#E87A3F',
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para profiles_public (DROP antes de criar para evitar erros)
DROP INDEX IF EXISTS idx_profiles_public_user_id;
DROP INDEX IF EXISTS idx_profiles_public_slug;
CREATE INDEX idx_profiles_public_user_id ON profiles_public(user_id);
CREATE INDEX idx_profiles_public_slug ON profiles_public(slug);

-- RLS para profiles_public
ALTER TABLE profiles_public ENABLE ROW LEVEL SECURITY;

-- Drop policies existentes antes de criar
DROP POLICY IF EXISTS "Users can manage their own public profile" ON profiles_public;
DROP POLICY IF EXISTS "Anyone can view active public profiles" ON profiles_public;
DROP POLICY IF EXISTS "Authenticated users can insert their profile" ON profiles_public;

-- Criar policies
CREATE POLICY "Users can manage their own public profile"
  ON profiles_public
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active public profiles"
  ON profiles_public
  FOR SELECT
  USING (ativo = true);

CREATE POLICY "Authenticated users can insert their profile"
  ON profiles_public
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- VERIFICAÇÃO
-- ==========================================
-- Rodar após executar o script acima:
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public';
