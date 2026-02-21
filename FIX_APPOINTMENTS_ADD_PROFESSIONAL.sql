-- ==========================================
-- ADICIONAR PROFESSIONAL_ID EM APPOINTMENTS
-- ==========================================
-- Execute este arquivo no Supabase SQL Editor

-- Adicionar coluna professional_id na tabela appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL;

-- Criar índice para professional_id
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);

-- ==========================================
-- VERIFICAÇÃO
-- ==========================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'appointments';
