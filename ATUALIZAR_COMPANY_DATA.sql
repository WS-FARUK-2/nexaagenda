-- ==========================================
-- ATUALIZAÇÃO DA TABELA COMPANY_DATA
-- Execute este script no Supabase SQL Editor
-- ==========================================

-- Adicionar novos campos à tabela company_data
ALTER TABLE company_data
ADD COLUMN IF NOT EXISTS tipo_empresa VARCHAR(100) DEFAULT 'Barbearia',
ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
ADD COLUMN IF NOT EXISTS complemento VARCHAR(100),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude VARCHAR(50),
ADD COLUMN IF NOT EXISTS longitude VARCHAR(50),
ADD COLUMN IF NOT EXISTS intervalo_grade INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS formato_hora VARCHAR(10) DEFAULT '24H',
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Remover campos que não são mais usados (CNPJ, EMAIL, WEBSITE)
ALTER TABLE company_data
DROP COLUMN IF EXISTS cnpj,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS website;

-- Atualizar valores padrão
UPDATE company_data
SET
  tipo_empresa = COALESCE(tipo_empresa, 'Barbearia'),
  intervalo_grade = COALESCE(intervalo_grade, 15),
  formato_hora = COALESCE(formato_hora, '24H');
