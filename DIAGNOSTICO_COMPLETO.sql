-- ==========================================
-- DIAGNÓSTICO COMPLETO DO BANCO DE DADOS
-- ==========================================

-- 1. VERIFICAR TOTAL DE REGISTROS POR TABELA
-- ==========================================
SELECT 'patients' as tabela, COUNT(*) as total FROM patients
UNION ALL
SELECT 'services' as tabela, COUNT(*) as total FROM services
UNION ALL
SELECT 'appointments' as tabela, COUNT(*) as total FROM appointments
UNION ALL
SELECT 'agendamentos_publicos' as tabela, COUNT(*) as total FROM agendamentos_publicos
UNION ALL
SELECT 'profiles_public' as tabela, COUNT(*) as total FROM profiles_public
UNION ALL
SELECT 'horarios_disponiveis' as tabela, COUNT(*) as total FROM horarios_disponiveis;

-- 2. VERIFICAR REGISTROS POR USER_ID
-- ==========================================
SELECT 
  'patients' as tabela,
  user_id,
  COUNT(*) as total
FROM patients
GROUP BY user_id
UNION ALL
SELECT 
  'services' as tabela,
  user_id,
  COUNT(*) as total
FROM services
GROUP BY user_id
UNION ALL
SELECT 
  'appointments' as tabela,
  user_id,
  COUNT(*) as total
FROM appointments
GROUP BY user_id
UNION ALL
SELECT 
  'agendamentos_publicos' as tabela,
  user_id,
  COUNT(*) as total
FROM agendamentos_publicos
GROUP BY user_id
ORDER BY tabela, user_id;

-- 3. VERIFICAR SE RLS ESTÁ ATIVO
-- ==========================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE tablename IN ('patients', 'services', 'appointments', 'agendamentos_publicos', 'profiles_public', 'horarios_disponiveis');

-- 4. LISTAR TODAS AS POLICIES ATIVAS
-- ==========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('patients', 'services', 'appointments', 'agendamentos_publicos', 'profiles_public', 'horarios_disponiveis')
ORDER BY tablename, policyname;

-- 5. VERIFICAR ESTRUTURA DAS TABELAS
-- ==========================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('patients', 'services', 'appointments', 'agendamentos_publicos', 'profiles_public', 'horarios_disponiveis')
ORDER BY table_name, ordinal_position;

-- 6. VERIFICAR DADOS DE EXEMPLO (primeiros 3 de cada tabela)
-- ==========================================
SELECT 'PATIENTS:' as info;
SELECT id, user_id, name, email, created_at FROM patients ORDER BY created_at DESC LIMIT 3;

SELECT 'SERVICES:' as info;
SELECT id, user_id, name, price, duration, created_at FROM services ORDER BY created_at DESC LIMIT 3;

SELECT 'APPOINTMENTS:' as info;
SELECT id, user_id, patient_id, service_id, appointment_date, appointment_time, status FROM appointments ORDER BY created_at DESC LIMIT 3;

SELECT 'AGENDAMENTOS_PUBLICOS:' as info;
SELECT id, user_id, nome_cliente, email_cliente, data_agendamento, hora_agendamento, status FROM agendamentos_publicos ORDER BY created_at DESC LIMIT 3;

-- 7. VERIFICAR SE HÁ REGISTROS SEM user_id (NULL)
-- ==========================================
SELECT 'Registros sem user_id:' as info;
SELECT 
  'patients' as tabela,
  COUNT(*) as total_sem_user_id
FROM patients
WHERE user_id IS NULL
UNION ALL
SELECT 
  'services' as tabela,
  COUNT(*) as total_sem_user_id
FROM services
WHERE user_id IS NULL
UNION ALL
SELECT 
  'appointments' as tabela,
  COUNT(*) as total_sem_user_id
FROM appointments
WHERE user_id IS NULL
UNION ALL
SELECT 
  'agendamentos_publicos' as tabela,
  COUNT(*) as total_sem_user_id
FROM agendamentos_publicos
WHERE user_id IS NULL;
