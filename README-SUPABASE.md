# Configuração do Supabase - Venda Varejo

Este documento explica como configurar o Supabase para o sistema financeiro Venda Varejo.

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Node.js instalado
- Projeto Venda Varejo configurado

## 🚀 Passos para Configuração

### 1. Criar Projeto Supabase

1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Configure o projeto:
   - **Project Name**: `venda-varejo-app`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Aguarde a criação do projeto

### 2. Obter Credenciais

Após criar o projeto, você precisará de duas informações:

1. **Project URL**: Encontre em Settings → API
2. **anon public key**: Também em Settings → API

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e substitua as credenciais:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 4. Executar Schema SQL

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em **Run** para executar

Isso criará todas as tabelas necessárias:
- `profiles` - Perfis de usuários
- `customers` - Clientes
- `suppliers` - Fornecedores
- `products` - Produtos
- `sales` - Vendas
- `sale_items` - Itens de venda
- `accounts_payable` - Contas a pagar
- `accounts_receivable` - Contas a receber
- `cash_flow_entries` - Movimentações de caixa

### 5. Configurar Autenticação

1. Vá para **Authentication** → **Settings**
2. Em **Site URL**, adicione: `http://localhost:3008`
3. Em **Redirect URLs**, adicione: `http://localhost:3008`
4. Em **Additional Redirect URLs**, adicione: `http://localhost:3008/**`

### 6. Habilitar Row Level Security (RLS)

O schema SQL já configura RLS, mas verifique se está ativo:
1. Vá para **Authentication** → **Policies**
2. Confirme que todas as tabelas têm políticas configuradas

### 7. Testar Conexão

1. Inicie o aplicação:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3008`

3. Tente fazer login com as credenciais de demonstração:
   - **Email**: `admin@venda-varejo.com`
   - **Senha**: `admin123`

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   ├── supabase-api.ts      # Hooks React Query
│   └── mock-api.ts          # API Mock (fallback)
├── hooks/
│   └── use-auth.ts          # Hook de autenticação
├── pages/
│   ├── login.tsx            # Página de login
│   └── ...                  # Outras páginas
└── .env                     # Variáveis de ambiente
```

## 🔧 Configurações Opcionais

### Para Desenvolvimento Local

Se você quiser usar o Supabase CLI para desenvolvimento local:

1. Instale o CLI:
   ```bash
   npm install -g supabase
   ```

2. Faça login:
   ```bash
   supabase login
   ```

3. Inicie o desenvolvimento local:
   ```bash
   supabase start
   ```

4. Atualize o `.env`:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=your_local_anon_key
   ```

### Para Produção

1. Configure domínio personalizado em Settings → Branding
2. Configure CORS em Settings → API
3. Ative backups automáticos em Settings → Database
4. Monitore uso em Usage → Metrics

## 🚨 Solução de Problemas

### Erro de Conexão

**Problema**: `Variáveis de ambiente do Supabase não configuradas`

**Solução**:
1. Verifique se o arquivo `.env` existe
2. Confirme que as credenciais estão corretas
3. Reinicie o servidor de desenvolvimento

### Erro de RLS

**Problema**: `new row violates row-level security policy`

**Solução**:
1. Verifique as políticas em Authentication → Policies
2. Execute o schema SQL novamente
3. Verifique se o usuário está autenticado

### Erro de CORS

**Problema**: Acesso negado pelo navegador

**Solução**:
1. Adicione sua URL em Settings → API → CORS
2. Verifique se as redirect URLs estão corretas

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Guia de Database](https://supabase.com/docs/guides/database)

## 🎯 Próximos Passos

1. Configure um domínio personalizado
2. Ative monitoramento e alertas
3. Configure backups automáticos
4. Otimize consultas SQL
5. Adicione testes automatizados

---

**Importante**: Mantenha suas credenciais do Supabase seguras e nunca compartilhe o arquivo `.env` em repositórios públicos.
