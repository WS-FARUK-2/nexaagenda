-- ==========================================
-- MIGRAR TODOS OS DADOS PARA A CONTA CORRETA
-- ==========================================
-- De: 80dec362-bb16-4139-a090-cc6cc387525a (conta antiga)
-- Para: 2cb4a67f-c64d-4af9-a1b4-19f2126669f4 (faruk.wanderson@gmail.com)

-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos_publicos DISABLE ROW LEVEL SECURITY;

-- MIGRAR PATIENTS
UPDATE patients
SET user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4'
WHERE user_id = '80dec362-bb16-4139-a090-cc6cc387525a';

-- MIGRAR SERVICES
UPDATE services
SET user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4'
WHERE user_id = '80dec362-bb16-4139-a090-cc6cc387525a';

-- MIGRAR APPOINTMENTS
UPDATE appointments
SET user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4'
WHERE user_id = '80dec362-bb16-4139-a090-cc6cc387525a';

-- MIGRAR AGENDAMENTOS_PUBLICOS (se houver)
UPDATE agendamentos_publicos
SET user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4'
WHERE user_id = '80dec362-bb16-4139-a090-cc6cc387525a';

-- MIGRAR PROFILES_PUBLIC (se houver)
UPDATE profiles_public
SET user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4'
WHERE user_id = '80dec362-bb16-4139-a090-cc6cc387525a';

-- MIGRAR HORARIOS_DISPONIVEIS (se houver)
UPDATE horarios_disponiveis
SET user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4'
WHERE user_id = '80dec362-bb16-4139-a090-cc6cc387525a';

-- REABILITAR RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos_publicos ENABLE ROW LEVEL SECURITY;

-- VERIFICAR RESULTADO
SELECT 
  'APÓS MIGRAÇÃO' as info,
  (SELECT COUNT(*) FROM patients WHERE user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4') as total_patients,
  (SELECT COUNT(*) FROM services WHERE user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4') as total_services,
  (SELECT COUNT(*) FROM appointments WHERE user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4') as total_appointments,
  (SELECT COUNT(*) FROM agendamentos_publicos WHERE user_id = '2cb4a67f-c64d-4af9-a1b4-19f2126669f4') as total_agendamentos_publicos;
