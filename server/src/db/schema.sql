-- Eleva Remote Database Schema
-- Multi-Tenant SaaS for Eleva Remote Desk & Eleva Remote Wake

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Commercial Plans
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    max_devices INT NOT NULL,
    max_concurrent_sessions INT NOT NULL,
    price_cents INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Plans
INSERT INTO plans (id, name, max_devices, max_concurrent_sessions, price_cents)
VALUES 
    ('single', 'Eleva Remote Single', 3, 1, 1990),
    ('business_small', 'Eleva Remote Business Small', 15, 3, 7990),
    ('business_pro', 'Eleva Remote Business Pro', 50, 10, 19990),
    ('enterprise', 'Eleva Remote Enterprise', 500, 50, 59990)
ON CONFLICT (id) DO NOTHING;

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    plan_id VARCHAR(32) NOT NULL REFERENCES plans(id) DEFAULT 'single',
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Operators / Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'admin', -- 'admin', 'operator'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices (PCs registered in Eleva Remote Desk & Remote Wake)
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(32) PRIMARY KEY, -- Remote Desk numeric ID (e.g. '467162914')
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    alias VARCHAR(128),
    hostname VARCHAR(128),
    username VARCHAR(128),
    platform VARCHAR(32) DEFAULT 'Windows',
    hash VARCHAR(128), -- Connection password hash if pre-set
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    wake_mac VARCHAR(32),              -- MAC address for Eleva Remote Wake
    wake_energy_watts NUMERIC(8,2) DEFAULT 0.0, -- Energy telemetry (0W = Off, >15W = On)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Address Book Tags
CREATE TABLE IF NOT EXISTS device_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    color VARCHAR(16) DEFAULT '#ED5F00',
    UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS device_tag_assignments (
    device_id VARCHAR(32) REFERENCES devices(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES device_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (device_id, tag_id)
);

-- Active Sessions (Concurrent Limit Enforcement)
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(64) UNIQUE NOT NULL,
    from_device_id VARCHAR(32),
    to_device_id VARCHAR(32) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs (Connection History & Billing Analytics)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_device_id VARCHAR(32),
    to_device_id VARCHAR(32) NOT NULL,
    session_id VARCHAR(64),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT DEFAULT 0
);
