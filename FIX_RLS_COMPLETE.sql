-- ==========================================
-- CORREÇÃO COMPLETA DE RLS POLICIES
-- Remove todas as policies conflitantes e recria corretamente
-- ==========================================

-- PASSO 1: REMOVER TODAS AS POLICIES EXISTENTES
-- ==========================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Deletar todas as policies das tabelas principais
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename IN ('patients', 'services', 'appointments', 'agendamentos_publicos')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PASSO 2: GARANTIR QUE RLS ESTÁ ATIVO
-- ==========================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos_publicos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PASSO 3: RECRIAR POLICIES PARA PATIENTS
-- ==========================================

-- SELECT: Usuários autenticados veem seus próprios pacientes
CREATE POLICY "patients_select_own"
ON patients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Usuários autenticados podem inserir seus pacientes
CREATE POLICY "patients_insert_own"
ON patients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- INSERT PÚBLICO: Permitir que página pública crie pacientes
CREATE POLICY "patients_public_insert"
ON patients
FOR INSERT
TO anon
WITH CHECK (true);

-- UPDATE: Usuários só podem atualizar seus próprios pacientes
CREATE POLICY "patients_update_own"
ON patients
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários só podem deletar seus próprios pacientes
CREATE POLICY "patients_delete_own"
ON patients
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- PASSO 4: RECRIAR POLICIES PARA SERVICES
-- ==========================================

-- SELECT AUTENTICADO: Ver próprios serviços
CREATE POLICY "services_select_own"
ON services
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- SELECT PÚBLICO: Qualquer um pode ver serviços (necessário para página de agendamento)
CREATE POLICY "services_public_select"
ON services
FOR SELECT
TO anon
USING (true);

-- INSERT: Criar próprios serviços
CREATE POLICY "services_insert_own"
ON services
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Atualizar próprios serviços
CREATE POLICY "services_update_own"
ON services
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Deletar próprios serviços
CREATE POLICY "services_delete_own"
ON services
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- PASSO 5: RECRIAR POLICIES PARA APPOINTMENTS
-- ==========================================

-- SELECT: Ver próprios agendamentos
CREATE POLICY "appointments_select_own"
ON appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Criar próprios agendamentos
CREATE POLICY "appointments_insert_own"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Atualizar próprios agendamentos
CREATE POLICY "appointments_update_own"
ON appointments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Deletar próprios agendamentos
CREATE POLICY "appointments_delete_own"
ON appointments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- PASSO 6: RECRIAR POLICIES PARA AGENDAMENTOS_PUBLICOS
-- ==========================================

-- SELECT: Ver próprios agendamentos públicos
CREATE POLICY "agendamentos_publicos_select_own"
ON agendamentos_publicos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT AUTENTICADO: Criar próprios agendamentos
CREATE POLICY "agendamentos_publicos_insert_own"
ON agendamentos_publicos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- INSERT PÚBLICO: Permitir que qualquer um crie agendamentos
CREATE POLICY "agendamentos_publicos_public_insert"
ON agendamentos_publicos
FOR INSERT
TO anon
WITH CHECK (true);

-- UPDATE: Atualizar próprios agendamentos
CREATE POLICY "agendamentos_publicos_update_own"
ON agendamentos_publicos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Deletar próprios agendamentos
CREATE POLICY "agendamentos_publicos_delete_own"
ON agendamentos_publicos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('patients', 'services', 'appointments', 'agendamentos_publicos')
GROUP BY tablename
ORDER BY tablename;
