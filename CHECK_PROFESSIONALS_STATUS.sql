-- Verificar status dos profissionais
SELECT 
    p.id,
    p.name,
    p.active,
    p.user_id,
    p.color,
    p.photo_url,
    COUNT(sp.id) as linked_services
FROM professionals p
LEFT JOIN service_professionals sp ON sp.professional_id = p.id
GROUP BY p.id, p.name, p.active, p.user_id, p.color, p.photo_url
ORDER BY p.name;

-- Verificar vínculos para o profissional específico
SELECT 
    s.id as service_id,
    s.name as service_name,
    p.id as professional_id,
    p.name as professional_name,
    p.active
FROM service_professionals sp
JOIN services s ON s.id = sp.service_id
JOIN professionals p ON p.id = sp.professional_id
ORDER BY s.name, p.name;

-- Verificar se tem serviços sem profissionais
SELECT 
    s.id,
    s.name,
    COUNT(sp.id) as total_professionals
FROM services s
LEFT JOIN service_professionals sp ON sp.service_id = s.id
GROUP BY s.id, s.name
HAVING COUNT(sp.id) = 0
ORDER BY s.name;
