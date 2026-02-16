-- ==========================================
-- VERIFICAR DADOS NO BANCO
-- ==========================================

-- 1. MOSTRAR TODOS OS PATIENTS
SELECT 
  'PATIENTS' as tabela,
  id,
  user_id,
  name,
  email,
  created_at
FROM patients
ORDER BY created_at DESC;

-- 2. MOSTRAR TODOS OS SERVICES
SELECT 
  'SERVICES' as tabela,
  id,
  user_id,
  name,
  price,
  created_at
FROM services
ORDER BY created_at DESC;

-- 3. MOSTRAR TODOS OS APPOINTMENTS
SELECT 
  'APPOINTMENTS' as tabela,
  id,
  user_id,
  patient_id,
  service_id,
  appointment_date,
  appointment_time,
  status,
  created_at
FROM appointments
ORDER BY created_at DESC;

-- 4. MOSTRAR TODOS OS AGENDAMENTOS PUBLICOS
SELECT 
  'AGENDAMENTOS_PUBLICOS' as tabela,
  id,
  user_id,
  nome_cliente,
  email_cliente,
  data_agendamento,
  created_at
FROM agendamentos_publicos
ORDER BY created_at DESC;

-- 5. CONTAR POR USER_ID
SELECT 
  'RESUMO POR USUARIO' as info,
  user_id,
  COUNT(*) as total_patients
FROM patients
GROUP BY user_id;

SELECT 
  'RESUMO POR USUARIO' as info,
  user_id,
  COUNT(*) as total_services
FROM services
GROUP BY user_id;

SELECT 
  'RESUMO POR USUARIO' as info,
  user_id,
  COUNT(*) as total_appointments
FROM appointments
GROUP BY user_id;
