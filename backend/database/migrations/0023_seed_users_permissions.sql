-- database/migrations/0023_seed_users_permissions.sql
-- Permisos para el Módulo Usuarios

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    (
        'Listar usuarios',
        'list_user',
        (SELECT content_type_id FROM content_type WHERE app_label = 'users' AND model = 'user')
    ),
    (
        'Crear usuarios',
        'create_user',
        (SELECT content_type_id FROM content_type WHERE app_label = 'users' AND model = 'user')
    ),
    (
        'Actualizar usuarios',
        'update_user',
        (SELECT content_type_id FROM content_type WHERE app_label = 'users' AND model = 'user')
    ),
    (
        'Generar Reporte usuarios',
        'report_user',
        (SELECT content_type_id FROM content_type WHERE app_label = 'users' AND model = 'user')
    ),
    (
        'Deshabilitar usuarios',
        'disable_user',
        (SELECT content_type_id FROM content_type WHERE app_label = 'users' AND model = 'user')
    )
ON CONFLICT (permission_codename)
DO UPDATE SET
    permission_name = EXCLUDED.permission_name,
    content_type_id = EXCLUDED.content_type_id;
