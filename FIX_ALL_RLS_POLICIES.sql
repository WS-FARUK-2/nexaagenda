-- ==========================================
-- FIX: Corrigir TODAS as policies RLS
-- ==========================================

-- ============================================
-- 1. PATIENTS - Reabilitar RLS com policies corretas
-- ============================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas
DROP POLICY IF EXISTS "Users can manage their own patients" ON patients;
DROP POLICY "Allow public insert for patients" ON patients;
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;

-- Policies corretas
CREATE POLICY "patients_select_own"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "patients_insert_own"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_insert_public"
  ON patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_delete_own"
  ON patients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. SERVICES - Verificar policies
-- ============================================
DROP POLICY IF EXISTS "Users can manage their own services" ON services;
DROP POLICY IF EXISTS "Anyone can view services" ON services;

CREATE POLICY "services_select_own"
  ON services FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "services_select_public"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "services_insert_own"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "services_update_own"
  ON services FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "services_delete_own"
  ON services FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. APPOINTMENTS - Verificar policies
-- ============================================
DROP POLICY IF EXISTS "Users can manage their own appointments" ON appointments;

CREATE POLICY "appointments_select_own"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "appointments_insert_own"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_update_own"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_delete_own"
  ON appointments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. AGENDAMENTOS_PUBLICOS - Verificar policies
-- ============================================
DROP POLICY IF EXISTS "Users can manage their own public appointments" ON agendamentos_publicos;
DROP POLICY IF EXISTS "Allow public to create appointments" ON agendamentos_publicos;

CREATE POLICY "agendamentos_publicos_select_own"
  ON agendamentos_publicos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agendamentos_publicos_insert_public"
  ON agendamentos_publicos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "agendamentos_publicos_update_own"
  ON agendamentos_publicos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agendamentos_publicos_delete_own"
  ON agendamentos_publicos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Verificar todas as policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'services', 'appointments', 'agendamentos_publicos')
ORDER BY tablename, policyname;
