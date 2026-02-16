-- ==========================================
-- FIX: Permitir leitura pública de serviços
-- ==========================================
-- Execute este arquivo no Supabase SQL Editor
-- para permitir que a página de agendamento público
-- mostre a lista de serviços

-- Adicionar policy de leitura pública para serviços
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services"
  ON services
  FOR SELECT
  USING (true);

-- Verificar se a policy foi criada
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'services';
