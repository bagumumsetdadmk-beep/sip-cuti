-- Drop the table since it is empty and we want to change its structure
DROP TABLE IF EXISTS users_role CASCADE;

CREATE TABLE users_role (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Verifikator', 'Operator')),
  pegawai_id UUID REFERENCES pegawai(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users_role ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable ALL access for all users" ON users_role FOR ALL USING (true) WITH CHECK (true);

-- Insert default users
INSERT INTO users_role (username, nama, password, role)
VALUES 
('admin', 'Administrator Setda', 'admin123', 'Admin');

-- Note: for operator and verifikator, they might need pegawai_id. We leave them null for now, or they can be created via UI.
INSERT INTO users_role (username, nama, password, role)
VALUES 
('operator', 'Operator Setda', 'operator', 'Operator'),
('verifikator', 'Verifikator Setda', 'verifikator', 'Verifikator');
