# NexaAgenda

Sistema de Agendamento SaaS desenvolvido com Next.js 14 (App Router) e Supabase.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Backend as a Service (Auth + Database)
- **React 18** - Biblioteca UI

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:

    ```bash
    npm install
    ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    ```

4. Execute o projeto em desenvolvimento:

    ```bash
    npm run dev
    ```

5. Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
app/
  ├── layout.tsx          # Layout raiz
  ├── page.tsx            # Página inicial
  ├── dashboard/
  │   └── page.tsx        # Dashboard
  └── login/
      └── page.tsx        # Login

lib/
  └── supabaseClient.ts   # Cliente Supabase
```

## 🏗️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa linter
- `npm run type-check` - Verifica tipos TypeScript

## 🚀 Deploy

Este projeto está pronto para deploy na Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Lembre-se de configurar as variáveis de ambiente no painel da Vercel.

## 📝 Licença

MIT
