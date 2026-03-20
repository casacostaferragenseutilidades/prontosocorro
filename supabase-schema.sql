-- Schema SQL para Supabase - Sistema Financeiro Venda Varejo

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (perfil)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS customers (
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
CREATE TABLE IF NOT EXISTS suppliers (
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
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS sales (
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
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS accounts_payable (
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
CREATE TABLE IF NOT EXISTS accounts_receivable (
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
CREATE TABLE IF NOT EXISTS cash_flow_entries (
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
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow_entries(date);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Políticas RLS básicas
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Users can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update customers" ON customers FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete customers" ON customers FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Users can insert suppliers" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update suppliers" ON suppliers FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete suppliers" ON suppliers FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all products" ON products FOR SELECT USING (true);
CREATE POLICY "Users can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update products" ON products FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete products" ON products FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Users can insert sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sales" ON sales FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete sales" ON sales FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all sale_items" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Users can insert sale_items" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sale_items" ON sale_items FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete sale_items" ON sale_items FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all accounts_payable" ON accounts_payable FOR SELECT USING (true);
CREATE POLICY "Users can insert accounts_payable" ON accounts_payable FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update accounts_payable" ON accounts_payable FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete accounts_payable" ON accounts_payable FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all accounts_receivable" ON accounts_receivable FOR SELECT USING (true);
CREATE POLICY "Users can insert accounts_receivable" ON accounts_receivable FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update accounts_receivable" ON accounts_receivable FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete accounts_receivable" ON accounts_receivable FOR DELETE WITH CHECK (true);

CREATE POLICY "Users can view all cash_flow_entries" ON cash_flow_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert cash_flow_entries" ON cash_flow_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update cash_flow_entries" ON cash_flow_entries FOR UPDATE WITH CHECK (true);
CREATE POLICY "Users can delete cash_flow_entries" ON cash_flow_entries FOR DELETE WITH CHECK (true);

-- Dados iniciais de exemplo
INSERT INTO profiles (user_id, name, email, phone, role, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@venda-varejo.com', '(11) 99999-9999', 'admin', 'active');

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

-- Funções úteis para o dashboard
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
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(final_amount), 0) as total_sales,
        (SELECT COUNT(*) FROM customers WHERE status = 'active') as total_customers,
        (SELECT COUNT(*) FROM products WHERE status = 'active') as total_products,
        COALESCE(SUM(amount), 0) as pending_receivables,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN final_amount ELSE 0 END), 0) as total_sales_today,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN final_amount ELSE 0 END), 0) as total_sales_month,
        COALESCE(SUM(total_debt), 0) as total_debt_outstanding,
        (SELECT COUNT(*) FROM customers WHERE total_debt > 0 AND status = 'active') as customers_with_debt,
        (SELECT COUNT(*) FROM products WHERE stock_quantity <= min_stock_alert AND status = 'active') as low_stock_count
    FROM sales 
    WHERE status = 'completed';
END;
$$ LANGUAGE plpgsql;
