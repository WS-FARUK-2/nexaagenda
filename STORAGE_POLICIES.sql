-- ============================================
-- POLÍTICAS DE STORAGE PARA BUCKET company-logos
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- para permitir upload e visualização de logos
-- ============================================

-- 1. Permitir UPLOAD de logos para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Permitir ATUALIZAÇÃO de logos pelos próprios usuários
CREATE POLICY "Usuários podem atualizar suas próprias logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Permitir EXCLUSÃO de logos pelos próprios usuários
CREATE POLICY "Usuários podem deletar suas próprias logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Permitir VISUALIZAÇÃO pública das logos
CREATE POLICY "Logos são publicamente visíveis"
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
