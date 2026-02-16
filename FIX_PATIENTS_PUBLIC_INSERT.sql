-- ==========================================
-- FIX: Permitir inserção pública de clientes
-- ==========================================
-- Execute este arquivo no Supabase SQL Editor
-- para permitir que a página de agendamento público
-- crie clientes automaticamente na tabela patients

-- Adicionar policy de inserção pública para clientes
DROP POLICY IF EXISTS "Allow public insert for patients" ON patients;
CREATE POLICY "Allow public insert for patients"
  ON patients
  FOR INSERT
  WITH CHECK (true);

-- Verificar se a policy foi criada
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'patients';
