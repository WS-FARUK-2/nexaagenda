-- ==========================================
-- TRIGGER PARA LIMPEZA AUTOMÁTICA DE IMAGENS
-- Execute este script no Supabase SQL Editor
-- ==========================================

-- Criar extensão para fazer requisições HTTP (se não existir)
CREATE EXTENSION IF NOT EXISTS http;

-- Função para deletar arquivo do Storage quando company_data é deletado
CREATE OR REPLACE FUNCTION delete_company_logo()
RETURNS TRIGGER AS $$
DECLARE
  file_path TEXT;
BEGIN
  -- Extrair o caminho do arquivo da URL
  IF OLD.logo_url IS NOT NULL AND OLD.logo_url LIKE '%company-logos%' THEN
    file_path := split_part(split_part(OLD.logo_url, 'company-logos/', 2), '?', 1);
    
    -- Deletar arquivo do bucket company-logos
    PERFORM storage.fns.delete_object('company-logos', file_path);
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa ANTES de deletar company_data
DROP TRIGGER IF EXISTS trigger_delete_company_logo ON company_data;
CREATE TRIGGER trigger_delete_company_logo
  BEFORE DELETE ON company_data
  FOR EACH ROW
  EXECUTE FUNCTION delete_company_logo();

-- Função para deletar arquivo do Storage quando logo é atualizada
CREATE OR REPLACE FUNCTION delete_old_logo_on_update()
RETURNS TRIGGER AS $$
DECLARE
  old_file_path TEXT;
BEGIN
  -- Se a logo mudou, deletar a antiga
  IF OLD.logo_url IS NOT NULL 
     AND OLD.logo_url != NEW.logo_url 
     AND OLD.logo_url LIKE '%company-logos%' THEN
    
    old_file_path := split_part(split_part(OLD.logo_url, 'company-logos/', 2), '?', 1);
    
    -- Deletar arquivo antigo do bucket
    PERFORM storage.fns.delete_object('company-logos', old_file_path);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa ANTES de atualizar company_data
DROP TRIGGER IF EXISTS trigger_delete_old_logo ON company_data;
CREATE TRIGGER trigger_delete_old_logo
  BEFORE UPDATE ON company_data
  FOR EACH ROW
  EXECUTE FUNCTION delete_old_logo_on_update();

-- Função para limpar todas as imagens de um usuário quando ele é deletado
CREATE OR REPLACE FUNCTION delete_user_files()
RETURNS TRIGGER AS $$
DECLARE
  company_logo TEXT;
BEGIN
  -- Buscar logo da empresa do usuário
  SELECT logo_url INTO company_logo
  FROM company_data
  WHERE user_id = OLD.id;
  
  -- Deletar logo se existir
  IF company_logo IS NOT NULL AND company_logo LIKE '%company-logos%' THEN
    PERFORM storage.fns.delete_object(
      'company-logos', 
      split_part(split_part(company_logo, 'company-logos/', 2), '?', 1)
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para deletar arquivos quando usuário é deletado
DROP TRIGGER IF EXISTS trigger_delete_user_files ON auth.users;
CREATE TRIGGER trigger_delete_user_files
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION delete_user_files();

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Triggers de limpeza automática criados com sucesso!';
  RAISE NOTICE '1. Logo deletada ao deletar company_data';
  RAISE NOTICE '2. Logo antiga deletada ao atualizar logo';
  RAISE NOTICE '3. Todas as imagens deletadas ao deletar usuário';
END $$;
