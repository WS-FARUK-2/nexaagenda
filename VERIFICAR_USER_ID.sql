-- ==========================================
-- DESCOBRIR USER_ID DO EMAIL faruk.wanderson@gmail.com
-- ==========================================

-- 1. MOSTRAR TODOS OS USUÁRIOS
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. MOSTRAR USER_ID ESPECÍFICO DO FARUK
SELECT 
  id as user_id_correto,
  email,
  'Este é o ID que deveria estar nos dados' as info
FROM auth.users
WHERE email = 'faruk.wanderson@gmail.com';

-- 3. CONTAR DADOS POR USER_ID (comparar)
SELECT 
  'DADOS ATUAIS' as info,
  user_id,
  (SELECT COUNT(*) FROM patients WHERE user_id = p.user_id) as patients,
  (SELECT COUNT(*) FROM services WHERE user_id = p.user_id) as services,
  (SELECT COUNT(*) FROM appointments WHERE user_id = p.user_id) as appointments,
  (SELECT COUNT(*) FROM agendamentos_publicos WHERE user_id = p.user_id) as agendamentos_publicos
FROM (
  SELECT DISTINCT user_id FROM patients
  UNION
  SELECT DISTINCT user_id FROM services
  UNION
  SELECT DISTINCT user_id FROM appointments
  UNION
  SELECT DISTINCT user_id FROM agendamentos_publicos
) p;
