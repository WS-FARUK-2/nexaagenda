-- ==========================================
-- ADICIONAR CAMPO DE FOTO PARA PROFISSIONAL
-- ==========================================

-- Adicionar coluna de foto à tabela profiles_public
ALTER TABLE profiles_public 
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_public_foto ON profiles_public(user_id, foto_url);

-- Comentário
COMMENT ON COLUMN profiles_public.foto_url IS 'URL da foto do profissional para exibição pública';
