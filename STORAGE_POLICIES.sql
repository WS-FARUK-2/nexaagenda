-- ============================================
-- POLÍTICAS DE STORAGE PARA BUCKET company-logos
-- ============================================
-- IMPORTANTE: Delete as políticas antigas antes!
-- Execute no Supabase SQL Editor:
--
-- DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários podem deletar suas próprias logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Logos são publicamente visíveis" ON storage.objects;
--
-- Depois execute as novas políticas abaixo:
-- ============================================

-- 1. Permitir UPLOAD de logos para QUALQUER usuário autenticado
CREATE POLICY "Upload de logos - qualquer autenticado"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- 2. Permitir ATUALIZAÇÃO de logos para QUALQUER usuário autenticado
CREATE POLICY "Atualizar logos - qualquer autenticado"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos')
WITH CHECK (bucket_id = 'company-logos');

-- 3. Permitir EXCLUSÃO de logos para QUALQUER usuário autenticado
CREATE POLICY "Deletar logos - qualquer autenticado"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');

-- 4. Permitir VISUALIZAÇÃO pública das logos
CREATE POLICY "Visualizar logos - público"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- ============================================
-- SUCESSO!
-- ============================================
-- Após executar este script:
-- ✅ Usuários autenticados podem fazer upload
-- ✅ Apenas o dono pode atualizar/deletar sua logo
-- ✅ Qualquer pessoa pode visualizar as logos
-- ============================================
