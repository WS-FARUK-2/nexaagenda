# 📋 Configuração do Banco de Dados

## ✅ Como Executar o Setup

### **Passo 1: Abra o Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto (nexaagenda)

### **Passo 2: Vá para SQL Editor**
1. No menu lateral, clique em **SQL Editor** (ícone de banco de dados)
2. Clique em **New Query**

### **Passo 3: Cole o Script**
1. Copie todo o conteúdo do arquivo `DATABASE_SETUP.sql`
2. Cole na área de editor do SQL Editor

### **Passo 4: Execute**
1. Clique em **Run** (ou pressione `Ctrl + Enter`)
2. Aguarde a mensagem "Query executed successfully"

---

## 📊 O que foi feito

### Tabela: `patients` (Clientes)
- ✅ Campo `email` - Email do cliente
- ✅ Campo `phone` - Telefone do cliente
- ✅ Campo `updated_at` - Data da última atualização
- ✅ Índice para melhor performance

### Tabela: `services` (Serviços)
- ✅ Campo `description` - Descrição do serviço
- ✅ Campo `updated_at` - Data da última atualização
- ✅ Índice para melhor performance

### Tabela: `appointments` (Agendamentos)
- ✅ Campo `notes` - Observações do agendamento
- ✅ Campo `updated_at` - Data da última atualização
- ✅ Índice para melhor performance

### Índices Criados (para velocidade)
- `idx_patients_user_id`
- `idx_services_user_id`
- `idx_appointments_user_id`
- `idx_appointments_patient_id`
- `idx_appointments_service_id`
- `idx_appointments_date`

---

## ✔️ Após executar o script

**Teste assim:**
```sql
SELECT * FROM patients LIMIT 1;
SELECT * FROM services LIMIT 1;
SELECT * FROM appointments LIMIT 1;
```

Você deve ver as novas colunas (`email`, `phone`, `updated_at`, `description`, `notes`).

---

## 🚀 Próximos passos

1. ✅ Execute o script no Supabase
2. ✅ Teste o aplicativo novamente
3. ✅ Tudo pronto para usar!

**Quando terminar, avise!**
