# 🚀 Criar Tabelas no Supabase - Venda Varejo

## 📋 **Passo a Passo para Configurar o Banco de Dados**

### **1. Acessar o Supabase**
1. Abra seu navegador e acesse: https://supabase.com
2. Faça login com sua conta
3. Selecione o projeto: **hglkhniwlejuqrvzixgj**

### **2. Abrir o Editor SQL**
1. No painel do Supabase, clique em **SQL Editor** (ícone de tabela)
2. Clique em **New query** para criar uma nova consulta
3. Você verá um editor de código SQL

### **3. Executar o Schema Completo**

#### **Copiar o Schema SQL**
1. Abra o arquivo: `supabase-schema.sql`
2. Copie **TODO** o conteúdo do arquivo (Ctrl+A, Ctrl+C)

#### **Colar no Editor Supabase**
1. No editor SQL do Supabase, cole o conteúdo (Ctrl+V)
2. Verifique se o código foi colado completamente

#### **Executar o Schema**
1. Clique no botão **Run** (▶️) ou **Execute**
2. Aguarde a execução (pode levar alguns segundos)
3. Você deve ver uma mensagem de sucesso

### **4. Verificar Tabelas Criadas**

#### **No Table Editor**
1. Clique em **Table Editor** no menu lateral
2. Você deverá ver as seguintes tabelas:
   - ✅ `profiles` (perfis de usuários)
   - ✅ `customers` (clientes)
   - ✅ `suppliers` (fornecedores)
   - ✅ `products` (produtos)
   - ✅ `sales` (vendas)
   - ✅ `sale_items` (itens de venda)
   - ✅ `accounts_payable` (contas a pagar)
   - ✅ `accounts_receivable` (contas a receber)
   - ✅ `cash_flow_entries` (movimentações de caixa)

#### **Verificar Estrutura**
1. Clique em qualquer tabela para ver a estrutura
2. Confirme que todas as colunas foram criadas
3. Verifique se os índices foram criados

### **5. Configurar Autenticação**

#### **Habilitar RLS (Row Level Security)**
1. Vá para **Authentication** → **Policies**
2. Confirme que todas as tabelas têm políticas configuradas
3. Se não tiver, execute novamente o schema SQL

#### **Configurar URLs**
1. Vá para **Authentication** → **Settings**
2. Em **Site URL**, adicione: `http://localhost:3008`
3. Em **Redirect URLs**, adicione: `http://localhost:3008`

### **6. Inserir Dados Iniciais**

#### **Dados de Demonstração**
O schema SQL já inclui dados iniciais:
- ✅ **Usuário administrador**: `admin@venda-varejo.com`
- ✅ **Clientes de exemplo**: João Silva, Maria Santos
- ✅ **Fornecedores**: Distribuidora ABC, Fornecedor XYZ
- ✅ **Produtos**: Notebook, Mouse, Teclado

#### **Verificar Dados**
1. No **Table Editor**, clique na tabela `customers`
2. Você deve ver os clientes cadastrados
3. Verifique também `suppliers` e `products`

### **7. Testar Conexão**

#### **Iniciar Aplicação**
1. No terminal, execute:
   ```bash
   npm run dev
   ```

2. Abra o navegador: `http://localhost:3008`

#### **Testar Login**
1. Use as credenciais:
   - **Email**: `admin@venda-varejo.com`
   - **Senha**: `admin123`

2. Se funcionar, a conexão está OK!

## 🚨 **Solução de Problemas**

### **Erro ao Executar SQL**
**Problema**: Erro de sintaxe ou tabela já existe
**Solução**:
1. Delete tabelas existentes (se necessário)
2. Execute o schema novamente
3. Verifique se não há erros de digitação

### **Permissões Negadas**
**Problema**: `new row violates row-level security policy`
**Solução**:
1. Verifique as políticas em Authentication → Policies
2. Execute o schema SQL novamente
3. Confirme que RLS está configurado

### **Conexão Falha**
**Problema**: Não conecta ao Supabase
**Solução**:
1. Verifique o arquivo `.env`
2. Confirme URL e anon key
3. Reinicie o servidor de desenvolvimento

## 📁 **Arquivos Importantes**

### **Schema SQL**
- 📄 `supabase-schema.sql` - Estrutura completa do banco
- 📄 `.env` - Credenciais do Supabase
- 📄 `README-SUPABASE.md` - Documentação completa

### **API Frontend**
- 📄 `src/lib/supabase.ts` - Cliente Supabase
- 📄 `src/lib/api.ts` - Hooks React Query
- 📄 `src/hooks/use-auth.ts` - Autenticação

## ✅ **Checklist Final**

- [ ] ✅ Schema SQL executado com sucesso
- [ ] ✅ Todas as 9 tabelas criadas
- [ ] ✅ Índices e triggers criados
- [ ] ✅ Row Level Security configurado
- [ ] ✅ Dados iniciais inseridos
- [ ] ✅ Autenticação configurada
- [ ] ✅ Aplicação conectando com sucesso
- [ ] ✅ Login funcionando

---

## 🎯 **Resultado Esperado**

Após seguir estes passos, você terá:

1. **Banco de dados completo** com todas as tabelas
2. **Dados de demonstração** para testes
3. **Autenticação funcionando** com Supabase Auth
4. **Aplicação conectada** e pronta para uso
5. **API RESTful** completa com React Query

**Sistema Venda Varejo pronto para produção!** 🚀✨
