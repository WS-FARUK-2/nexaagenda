-- ==========================================
-- VERIFICAR VÍNCULOS SERVIÇO-PROFISSIONAL
-- ==========================================

-- Ver todos os serviços
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.user_id
FROM services s
ORDER BY s.name;

-- Ver todos os profissionais
SELECT 
    p.id as professional_id,
    p.name as professional_name,
    p.active,
    p.user_id
FROM professionals p
ORDER BY p.name;

-- Ver os vínculos existentes
SELECT 
    s.name as service_name,
    p.name as professional_name,
    sp.id as vinculo_id
FROM service_professionals sp
JOIN services s ON s.id = sp.service_id
JOIN professionals p ON p.id = sp.professional_id
ORDER BY s.name, p.name;

-- Contar vínculos por serviço
SELECT 
    s.name as service_name,
    COUNT(sp.id) as total_profissionais
FROM services s
LEFT JOIN service_professionals sp ON sp.service_id = s.id
GROUP BY s.id, s.name
ORDER BY s.name;
