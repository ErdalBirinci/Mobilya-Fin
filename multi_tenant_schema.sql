-- ========================================================================
-- MULTI-TENANT ARCHITECTURE SQL SCHEMA & RLS POLICIES (Supabase / Postgres)
-- ========================================================================

-- 1. Create the 'tenants' table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create or Update existing tables to include tenant_id
-- We assume auth.users holds user authentication, but we also create a public 'users' table or 'user_profiles'
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DRIVER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    type VARCHAR(10) NOT NULL,
    time_range VARCHAR(50),
    order_index INTEGER,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    payment_method VARCHAR(50),
    total_amount NUMERIC,
    collection_amount NUMERIC,
    notes TEXT,
    status VARCHAR(50),
    date DATE,
    driver_id UUID REFERENCES users(id), -- Optional: If a service is assigned to a specific driver
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 0,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Tenants Policy (Read-Only)
-- A user can only see the tenant they belong to.
CREATE POLICY "Users can view their own tenant" 
ON tenants
FOR SELECT
USING (
    id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

-- Users Policy
-- Users can see profiles of other users in the same tenant.
CREATE POLICY "Users can view members of their tenant" 
ON users
FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

-- Services Policy
-- Users (Admin or Driver) can view and modify services ONLY in their tenant.
CREATE POLICY "Users can view their tenant's services" 
ON services
FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can insert services to their tenant" 
ON services
FOR INSERT
WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update their tenant's services" 
ON services
FOR UPDATE
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their tenant's services" 
ON services
FOR DELETE
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

-- Inventory Policy
-- Users can view and modify inventory items ONLY in their tenant.
CREATE POLICY "Users can view their tenant's inventory" 
ON inventory
FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can insert inventory to their tenant" 
ON inventory
FOR INSERT
WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update their tenant's inventory" 
ON inventory
FOR UPDATE
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their tenant's inventory" 
ON inventory
FOR DELETE
USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
);

-- ========================================================================
-- NOTE ON FRONTEND INTEGRATION
-- ========================================================================
-- With Supabase and these RLS policies in place, the frontend code
-- doesn't need to manually filter by tenant_id when making queries.
-- 
-- Example: 
-- supabase.from('services').select('*') 
-- will AUTOMATICALLY only return services where tenant_id matches the 
-- logged-in user's tenant_id, thanks to the RLS policies!
--
-- However, when INSERTING a new record, you MUST either provide the 
-- tenant_id or use a database trigger to auto-assign it based on auth.uid().
