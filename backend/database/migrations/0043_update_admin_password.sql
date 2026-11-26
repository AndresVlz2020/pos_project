-- Actualiza la contraseña por defecto de admin@dpiero.com de '12345678' a 'Administrador123$'
UPDATE users
SET user_password = '$2b$10$ErPQPO0Lp5Aj3bjgTkDmoOiQ5nD6a4XeRWx5IVB.KL5XVzDT7kBYK'
WHERE user_email = 'admin@dpiero.com'
  AND user_password = '$2b$10$9ZSar0stjiLkcAWs5mtab.YdpcX4LFdn64OlBvjVS9vB3mtjYddN6';
