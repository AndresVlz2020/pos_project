-- Semilla inicial de usuarios en el sistema POS
INSERT INTO users (
    user_name,
    user_email,
    corporate_email,
    user_phone,
    user_document_types,
    user_document_number,
    user_password,
    pin,
    user_type,
    is_staff,
    is_active,
    is_superuser
) VALUES
(
    'Administrador General',
    'admin@dpiero.com',
    'admin@dpiero.com',
    '3001234567',
    'CC',
    '1000000001',
    '$2b$10$9ZSar0stjiLkcAWs5mtab.YdpcX4LFdn64OlBvjVS9vB3mtjYddN6',
    NULL,
    'admin',
    true,
    true,
    true
),
(
    'Carlos Mesero',
    'carlos.mesero@dpiero.com',
    'carlos.mesero@dpiero.com',
    '3109876543',
    'CC',
    '1000000002',
    NULL,
    '1234',
    'mesero',
    true,
    true,
    false
),
(
    'María Cajera',
    'maria.caja@dpiero.com',
    'maria.caja@dpiero.com',
    '3205556677',
    'CC',
    '1000000003',
    NULL,
    '1234',
    'cajero',
    true,
    true,
    false
),
(
    'Ana Cocina',
    'ana.cocina@dpiero.com',
    'ana.cocina@dpiero.com',
    '3154443322',
    'CC',
    '1000000004',
    NULL,
    '1234',
    'cocina',
    true,
    true,
    false
)
ON CONFLICT (user_email) DO NOTHING;
