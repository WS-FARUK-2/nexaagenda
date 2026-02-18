# Guia de Testes - Módulo Profissionais

## ✅ Checklist de CRUD - Profissionais

### CREATE (Criar)

- [ ] Clicar em "+ Novo Profissional"
- [ ] Preencher todos os campos (nome, email, telefone, data nascimento, comissão, cor)
- [ ] Clicar em "Salvar"
- [ ] Verificar se aparece na lista
- [ ] Verificar se foi salvo no banco de dados

### READ (Ler/Listar)

- [ ] Listar todos os profissionais cadastrados
- [ ] Verificar se todos os dados aparecem corretamente
- [ ] Filtrar por nome
- [ ] Filtrar por email
- [ ] Verificar se o filtro funciona corretamente

### UPDATE (Atualizar)

- [ ] Clicar em "Editar" em um profissional existente
- [ ] Modificar um ou mais campos
- [ ] Clicar em "Salvar"
- [ ] Verificar se as alterações foram aplicadas
- [ ] Verificar se os dados foram atualizados no banco

### DELETE (Deletar)

- [ ] Clicar em "Deletar" em um profissional
- [ ] Confirmar a exclusão
- [ ] Verificar se desapareceu da lista
- [ ] Verificar se foi removido do banco de dados

## 🔗 Integração com Serviços

### Vincular Profissionais a Serviços

- [ ] Ir para "Serviços"
- [ ] Editar um serviço
- [ ] Selecionar profissionais para esse serviço
- [ ] Salvar
- [ ] Verificar se a vinculação foi persistida
- [ ] Editar o serviço novamente e verificar se os profissionais continuam selecionados

## 📱 Responsividade

### Desktop (1920px)

- [ ] Todos os elementos visíveis e bem distribuídos
- [ ] Tabela sem scroll horizontal
- [ ] Layout fluido

### Tablet (768px)

- [ ] Sidebar colapsável
- [ ] Tabela com scroll horizontal se necessário
- [ ] Botões acessíveis

### Mobile (375px)

- [ ] Sidebar em hambúrguer menu
- [ ] Conteúdo adaptado
- [ ] Inputs acessíveis
- [ ] Sem overflow horizontal

## 🎨 Design e UX

### Cores SuaAgenda

- [ ] Sidebar com teal (#2C5F6F) e laranja (#E87A3F)
- [ ] Botões em laranja (#E87A3F)
- [ ] Ícones e tipografia consistentes

### Feedback Visual

- [ ] Hover effects nos botões
- [ ] Mensagens de sucesso/erro
- [ ] Loading spinner ao carregar dados
- [ ] Transições suaves

## 🔐 Segurança

- [ ] Apenas admin pode acessar
- [ ] Profissionais vinculados apenas ao usuário logado
- [ ] Não consegue editar/deletar profissionais de outros usuários

## ✨ Funcionalidades Extras

- [ ] Busca por nome funciona
- [ ] Busca por email funciona
- [ ] Limpar filtro funciona
- [ ] Ordenação por nome
- [ ] Cor do profissional aparece corretamente
