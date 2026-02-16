-- ==========================================
-- FIX: Permitir leitura de próprios clientes
-- ==========================================
-- Execute este arquivo no Supabase SQL Editor

-- Garantir que usuários possam LER seus próprios pacientes
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;
CREATE POLICY "Users can view their own patients"
  ON patients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Verificar policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'patients'
ORDER BY policyname;
