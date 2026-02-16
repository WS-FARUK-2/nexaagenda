-- ==========================================
-- NEXAAGENDA DATABASE SETUP
-- Execute este arquivo no Supabase SQL Editor
-- ==========================================
-- Data: 16 de fevereiro de 2026
-- Objetivo: Adicionar campos faltantes e índices

-- Adicionar campos a patients se não existem
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campos a services se não existem
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campos a appointments se não existem
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Criar índices se não existem (para performance)
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- ==========================================
-- VERIFICAÇÃO
-- ==========================================
-- Rodar após executar o script acima:
-- SELECT * FROM patients LIMIT 1;
-- SELECT * FROM services LIMIT 1;
-- SELECT * FROM appointments LIMIT 1;
