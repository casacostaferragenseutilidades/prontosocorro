-- Schema SQL para Supabase - Sistema Financeiro Venda Varejo (Versão Final)

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (perfil)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  payment_method TEXT DEFAULT 'money' CHECK (payment_method IN ('money', 'credit_card', 'debit_card', 'pix')),
  total_debt DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  unit TEXT DEFAULT 'un',
  barcode TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('money', 'credit_card', 'debit_card', 'pix', 'fiado')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de venda
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas a pagar
CREATE TABLE accounts_payable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas a receber
CREATE TABLE accounts_receivable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações de caixa
CREATE TABLE cash_flow_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  account TEXT DEFAULT 'caixa',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  date DATE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX idx_cash_flow_date ON cash_flow_entries(date);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_flow_entries_updated_at BEFORE UPDATE ON cash_flow_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simples
-- Profiles
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Customers
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON customers FOR DELETE USING (true);

-- Suppliers
CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON suppliers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON suppliers FOR DELETE USING (true);

-- Products
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON products FOR DELETE USING (true);

-- Sales
CREATE POLICY "Enable read access for all users" ON sales FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON sales FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON sales FOR DELETE USING (true);

-- Sale Items
CREATE POLICY "Enable read access for all users" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON sale_items FOR DELETE USING (true);

-- Accounts Payable
CREATE POLICY "Enable read access for all users" ON accounts_payable FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON accounts_payable FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON accounts_payable FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON accounts_payable FOR DELETE USING (true);

-- Accounts Receivable
CREATE POLICY "Enable read access for all users" ON accounts_receivable FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON accounts_receivable FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON accounts_receivable FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON accounts_receivable FOR DELETE USING (true);

-- Cash Flow Entries
CREATE POLICY "Enable read access for all users" ON cash_flow_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cash_flow_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for all users" ON cash_flow_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON cash_flow_entries FOR DELETE USING (true);

-- Função para dashboard stats refatorada
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_sales DECIMAL,
  total_customers BIGINT,
  total_products BIGINT,
  pending_receivables DECIMAL,
  total_sales_today DECIMAL,
  total_sales_month DECIMAL,
  total_debt_outstanding DECIMAL,
  customers_with_debt BIGINT,
  low_stock_count BIGINT
) AS $$
DECLARE
    v_total_sales DECIMAL;
    v_total_customers BIGINT;
    v_total_products BIGINT;
    v_pending_receivables DECIMAL;
    v_total_sales_today DECIMAL;
    v_total_sales_month DECIMAL;
    v_total_debt_outstanding DECIMAL;
    v_customers_with_debt BIGINT;
    v_low_stock_count BIGINT;
BEGIN
    -- Total de vendas concluídas
    SELECT COALESCE(SUM(final_amount), 0) INTO v_total_sales FROM sales WHERE status = 'completed';
    
    -- Contagem de clientes ativos
    SELECT COUNT(*) INTO v_total_customers FROM customers WHERE status = 'active';
    
    -- Contagem de produtos ativos
    SELECT COUNT(*) INTO v_total_products FROM products WHERE status = 'active';
    
    -- Contas a receber pendentes ou atrasadas
    SELECT COALESCE(SUM(amount), 0) INTO v_pending_receivables FROM accounts_receivable WHERE status IN ('pending', 'overdue');
    
    -- Vendas de hoje
    SELECT COALESCE(SUM(final_amount), 0) INTO v_total_sales_today FROM sales WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE;
    
    -- Vendas do mês atual
    SELECT COALESCE(SUM(final_amount), 0) INTO v_total_sales_month FROM sales WHERE status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
    
    -- Dívida total pendente de clientes
    SELECT COALESCE(SUM(total_debt), 0) INTO v_total_debt_outstanding FROM customers WHERE status = 'active';
    
    -- Número de clientes com dívida
    SELECT COUNT(*) INTO v_customers_with_debt FROM customers WHERE total_debt > 0 AND status = 'active';
    
    -- Produtos com estoque baixo
    SELECT COUNT(*) INTO v_low_stock_count FROM products WHERE stock_quantity <= min_stock_alert AND status = 'active';

    RETURN QUERY SELECT 
        v_total_sales, 
        v_total_customers, 
        v_total_products, 
        v_pending_receivables, 
        v_total_sales_today, 
        v_total_sales_month, 
        v_total_debt_outstanding, 
        v_customers_with_debt, 
        v_low_stock_count;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais (apenas tabelas sem relacionamentos)
INSERT INTO customers (name, email, phone, address, payment_method, total_debt) VALUES
('João Silva', 'joao@email.com', '(11) 99999-8888', 'Rua das Flores, 123, São Paulo, SP', 'money', 150.00),
('Maria Santos', 'maria@email.com', '(11) 99999-7777', 'Avenida Paulista, 456, São Paulo, SP', 'pix', 0.00);

INSERT INTO suppliers (name, email, phone, cnpj, address) VALUES
('Distribuidora ABC', 'contato@abc.com', '(11) 99999-6666', '12.345.678/0001-90', 'Rua dos Fornecedores, 789, São Paulo, SP'),
('Fornecedor XYZ', 'vendas@xyz.com', '(11) 99999-5555', '98.765.432/0001-10', 'Avenida Industrial, 321, São Paulo, SP');

INSERT INTO products (name, description, category, price, cost, stock_quantity, min_stock_alert, unit) VALUES
('Notebook Dell', 'Notebook Dell Core i5 8GB 256GB', 'Informática', 3500.00, 2800.00, 10, 5, 'un'),
('Mouse Wireless', 'Mouse sem fio USB', 'Informática', 45.00, 25.00, 50, 10, 'un'),
('Teclado Mecânico', 'Teclado mecânico RGB', 'Informática', 180.00, 120.00, 25, 5, 'un');
