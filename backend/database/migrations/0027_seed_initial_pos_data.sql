-- database/migrations/0027_seed_initial_pos_data.sql
-- Inserción de datos maestros para Restaurante D'Piero (Categorías, Proveedores, Productos, Inventario, Mesas y Órdenes)

-- 1. Ampliar campos útiles en productos e inventario si no existen
ALTER TABLE products ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Activo';
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location VARCHAR(150);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS price_buy NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- 2. Categorías del Restaurante
INSERT INTO categories (name, description, is_active)
VALUES
    ('platos fuertes', 'Cortes de carne, hamburguesas, costillas y platos principales a la parrilla', TRUE),
    ('entradas', 'Chicharrones, empanadas y bocados para compartir', TRUE),
    ('bebidas', 'Limonadas artesanales, jugos naturales, cócteles y cervezas', TRUE),
    ('postres', 'Flanes, tortas tradicionales y dulces de la casa', TRUE),
    ('guarniciones', 'Papas rústicas, arepas, ensaladas y acompañamientos', TRUE)
ON CONFLICT (name) DO UPDATE SET is_active = TRUE;

-- 3. Proveedores gastronómicos (26 proveedores reales del restaurante)
INSERT INTO suppliers (nit, company_name, email, phone, address, observation, is_active)
VALUES
    ('900.123.456-1', 'Distribuidora Lácteos del Campo S.A.S.', 'ventas@lacteosdelcampo.co', '3001234567', 'Calle 45 # 12-34, Bogotá', 'Proveedor principal de queso mozzarella, crema de leche y mantequilla', TRUE),
    ('890.987.654-3', 'Avícola y Carnes del Valle S.A.', 'contacto@carnesdelvalle.com', '3159876543', 'Av. Santander # 89-12, Cali', 'Cortes de pollo fresco y huevos campesinos grado A', TRUE),
    ('901.456.789-0', 'Empaques Bio & Eco Gastronomía', 'pedidos@empaquesbio.com.co', '3104567890', 'Carrera 68 # 45-20, Medellín', 'Cajas ecológicas para hamburguesas y bolsas de papel kraft biodegradables', TRUE),
    ('800.555.444-2', 'Comercializadora Fruver Central', 'info@fruvercentral.com', '3205554442', 'Central de Abastos Bodega 4', 'Fruta fresca seleccionada: limón tahití, maracuyá, fresas y verduras', TRUE),
    ('900.777.888-5', 'Distribuciones de Café & Bebidas S.A.S.', 'servicio@cafebebidas.co', '3127778885', 'Zona Industrial Manizales', 'Café especial en grano tostado y jarabes saborizantes', TRUE),
    ('901.222.333-8', 'Pescadería y Mariscos del Pacífico', 'soporte@mariscosPacifico.com', '3012223338', 'Puerto Pesquero Buenaventura', 'Camarones y filetes de pescado de exportación', TRUE),
    ('830.111.999-4', 'Importadora de Licores & Vinos El Prado', 'ventas@licoreselprado.com.co', '3171119994', 'Calle 93 # 14-20, Bogotá', 'Vodka Absolut, Tequila José Cuervo y vinos tintos de reserva', TRUE),
    ('891.333.222-7', 'Procesadora de Carnes Frías y Embutidos', 'comercial@carnesfrias.com', '3143332227', 'Km 5 Vía Zipaquirá', 'Tocinetas ahumadas, salchichas artesanales y chorizos campesinos', TRUE),
    ('900.888.111-9', 'Productos de Limpieza e Higiene Industrial', 'contacto@higieneindustrial.co', '3188881119', 'Parque Industrial Cota', 'Detergentes biodegradables y desinfectantes aprobados por Invima', FALSE),
    ('901.666.555-2', 'Dotaciones y Chef Uniforms Alfa', 'ventas@chefuniforms.com', '3026665552', 'Carrera 15 # 72-10, Bogotá', 'Filipinas, delantales y calzado antideslizante para cocina', FALSE),
    ('800.444.777-1', 'Panificadora e Insumos de Repostería', 'pedidos@panificadora.co', '3114447771', 'Av. Boyacá # 65-40', 'Pan brioche artesanal para hamburguesas y bases de torta', FALSE),
    ('900.333.666-0', 'Conservas y Salsas Gourmet S.A.S.', 'atencion@salsasgourmet.com', '3133336660', 'Km 2 Vía Siberia', 'Salsa BBQ ahumada de la casa, mayonesas y mostazas artesanales', FALSE),
    ('901.999.888-6', 'Congelados y Pulpas de Fruta Andina', 'operaciones@pulpasandina.com.co', '3169998886', 'Central Mayorista Bloque 8', 'Pulpas pasteurizadas 100% naturales sin azúcar añadida', FALSE),
    ('890.222.111-5', 'Gas e Insumos de Cocina Industrial', 'ventas@cocinaindustrial.co', '3192221115', 'Calle 13 # 40-15', 'Mantenimiento y suministro para estufas y parrillas a gas', FALSE),
    ('800.999.000-3', 'Suministros de Cristalería y Menaje S.A.', 'info@menaje.com', '3059990003', 'Carrera 30 # 25-10', 'Copas de cóctel, vajilla rústica y cubiertos de acero', FALSE),
    ('900.555.222-4', 'Distribuidora de Aceites y Grasas', 'soporte@aceitesygrasas.co', '3045552224', 'Zona Franca Fontibón', 'Aceite de girasol por galón para freidoras de alta temperatura', FALSE),
    ('901.777.333-1', 'Hortalizas y Verduras Hidropónicas', 'contacto@verdurashidro.com', '3107773331', 'Vereda Chorrillos Suba', 'Hierbabuena, lechuga crespa y tomates hidropónicos sin pesticidas', FALSE),
    ('890.555.666-8', 'Distribución de Cervezas Artesanales', 'pedidos@cervezasartesanales.co', '3155556668', 'Calle 85 # 11-50', 'Cervezas tipo Pale Ale, Stout y Rubia de barril', FALSE),
    ('900.444.111-2', 'Sistemas de Fumigación y Control de Plagas', 'servicio@controlplagas.com.co', '3184441112', 'Carrera 50 # 100-20', 'Certificaciones periódicas de sanidad para restaurantes', FALSE),
    ('901.111.444-9', 'Especias y Condimentos del Mundo', 'ventas@especias.com', '3121114449', 'Calle 68 # 22-10', 'Pimienta negra recién molida, orégano, paprika y sal marina', FALSE),
    ('830.888.444-6', 'Lácteos y Quesos Madurados Ltda.', 'pedidos@quesosmadurados.co', '3178884446', 'Ubaté Cundinamarca', 'Queso cheddar madurado en bloque y queso costeño', FALSE),
    ('900.222.999-0', 'Servicios de Refrigeración y Neveras', 'despachos@refrigeracion.com', '3012229990', 'Av. 68 # 15-30', 'Calibración y repuestos de congeladores y cuartos fríos', FALSE),
    ('891.777.444-3', 'Muebles y Barras para Restaurantes', 'contacto@mueblesrestaurante.co', '3147774443', 'Barrio 12 de Octubre', 'Mantenimiento de mesas de madera y sillas de comedor', FALSE),
    ('901.333.111-7', 'Importadora de Arroz y Granos Especiales', 'info@granosimportados.com', '3203331117', 'Corabastos Bodega 12', 'Arroz blanco selecto y frijol cargamanto en bultos', FALSE),
    ('800.111.222-5', 'Comercializadora de Hielo y Agua Brisa', 'ventas@hielobrisa.co', '3111112225', 'Calle 80 # 70-15', 'Hielo cristalino frappé y en cubos para coctelería', FALSE),
    ('900.666.333-8', 'Imprenta de Menús y Publicidad Pop', 'produccion@imprentamenus.com', '3136663338', 'Carrera 10 # 18-20', 'Cartas laminadas e impresos institucionales D''Piero', FALSE)
ON CONFLICT (nit) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    observation = EXCLUDED.observation,
    is_active = EXCLUDED.is_active;

-- 4. Productos de la carta del restaurante (12 platillos oficiales)
INSERT INTO products (code, name, price, description, category_id, image_url, status, is_active, stock)
VALUES
    (
        'PAR-01',
        'Punta de Anca Angus 400g',
        56000.00,
        'Corte angus certificado madurado a la brasa con chimichurri rústico y sal marina',
        (SELECT id FROM categories WHERE name = 'platos fuertes'),
        '/assets/images/punta-de-anca-hd.jpg',
        'Disponible',
        TRUE,
        18
    ),
    (
        'PAR-02',
        'Costillas Ahumadas BBQ D''Piero',
        48000.00,
        'Costillas de cerdo seleccionadas, cocción lenta al carbón por 6 horas y glaseado BBQ de la casa',
        (SELECT id FROM categories WHERE name = 'platos fuertes'),
        '/assets/images/costillas-bbq-hd.jpg',
        'Disponible',
        TRUE,
        12
    ),
    (
        'PAR-03',
        'Hamburguesa D''Piero Artesanal',
        34000.00,
        '200g carne angus a la parrilla, queso cheddar fundido, tocineta ahumada y pan brioche artesanal',
        (SELECT id FROM categories WHERE name = 'platos fuertes'),
        '/assets/images/hamburguesa-hd.jpg',
        'Disponible',
        TRUE,
        25
    ),
    (
        'ENT-01',
        'Chicharrón Carnudo Crocante',
        28000.00,
        'Tiras de tocino carnudo crujiente con arepitas santandereanas y limón mandarino',
        (SELECT id FROM categories WHERE name = 'entradas'),
        '/assets/images/chicharron-hd.jpg',
        'Disponible',
        TRUE,
        15
    ),
    (
        'ENT-02',
        'Empanadas de Carne & Papa (x5)',
        18000.00,
        'Cinco empanadas crujientes rellenas de lomo picado y papa criolla con ají casero',
        (SELECT id FROM categories WHERE name = 'entradas'),
        '/assets/images/empanadas-hd.jpg',
        'Inactivo',
        FALSE,
        30
    ),
    (
        'BEB-01',
        'Limonada Hierbabuena Artesanal',
        10000.00,
        'Zumo de limón recién exprimido macerado con hierbabuena fresca y hielo frappé',
        (SELECT id FROM categories WHERE name = 'bebidas'),
        '/assets/images/limonada-hd.jpg',
        'Disponible',
        TRUE,
        45
    ),
    (
        'BEB-02',
        'Cóctel de Frutos Rojos & Fresa',
        24000.00,
        'Mixología de autor a base de fresas orgánicas, toques cítricos, vodka premium y escarchado',
        (SELECT id FROM categories WHERE name = 'bebidas'),
        '/assets/images/coctel-fresa-hd.jpg',
        'Disponible',
        TRUE,
        20
    ),
    (
        'BEB-03',
        'Cerveza Artesanal Rubia 330ml',
        14000.00,
        'Cerveza artesanal de la casa tipo Pale Ale, notas florales y cuerpo equilibrado',
        (SELECT id FROM categories WHERE name = 'bebidas'),
        '/assets/images/cerveza-hd.jpg',
        'Disponible',
        TRUE,
        36
    ),
    (
        'BEB-04',
        'Jugo Natural de Fruta Fresca',
        9000.00,
        'Jugo natural en agua o leche (Mandarina, Maracuyá, Mango o Lulo)',
        (SELECT id FROM categories WHERE name = 'bebidas'),
        '/assets/images/jugo-natural-hd.jpg',
        'Disponible',
        TRUE,
        40
    ),
    (
        'POS-01',
        'Postre Gourmet de Coco',
        17000.00,
        'Flan cremoso de leche de coco natural con láminas de coco tostado y caramelo dorado',
        (SELECT id FROM categories WHERE name = 'postres'),
        '/assets/images/postre-coco-hd.jpg',
        'Disponible',
        TRUE,
        14
    ),
    (
        'POS-02',
        'Torta Tradicional Tres Leches',
        16000.00,
        'Bizcochuelo bañado en salsa de tres leches con merengue suizo y canela fina',
        (SELECT id FROM categories WHERE name = 'postres'),
        '/assets/images/tres-leches-hd.jpg',
        'Disponible',
        TRUE,
        10
    ),
    (
        'GUA-01',
        'Papas Rústicas a las Finas Hierbas',
        12000.00,
        'Cascos de papa criolla dorados con romero fresco, paprika ahumada y salsa de ajo',
        (SELECT id FROM categories WHERE name = 'guarniciones'),
        '/assets/images/papas-rusticas-hd.jpg',
        'Disponible',
        TRUE,
        28
    )
ON CONFLICT DO NOTHING;

-- 5. Insumos del Almacén / Inventario (30 ítems enlazados a proveedores)
INSERT INTO inventory (
    code,
    item_name,
    category,
    brand,
    current_stock,
    min_stock,
    max_stock,
    unit_measure,
    status,
    is_active,
    supplier_id,
    location,
    price_buy,
    batch_number,
    expiration_date
)
VALUES
    ('INV-001', 'Corte Punta de Anca (kg)', 'Carnes', 'San Martín', 15.00, 5.00, 40.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '891.333.222-7'), 'Cuarto Frío 1', 42000.00, 'LT-001', '2026-11-20'),
    ('INV-002', 'Lomo de Res (kg)', 'Carnes', 'San Martín', 12.00, 4.00, 30.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '891.333.222-7'), 'Cuarto Frío 1', 38000.00, 'LT-002', '2026-11-22'),
    ('INV-003', 'Pechuga de Pollo Entera (kg)', 'Carnes', 'San Fernando', 20.00, 6.00, 50.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '890.987.654-3'), 'Cuarto Frío 2', 18000.00, 'LT-003', '2026-11-18'),
    ('INV-004', 'Costilla de Cerdo (kg)', 'Carnes', 'San Martín', 2.00, 5.00, 40.00, 'kg', 'Inactivo', FALSE, (SELECT id FROM suppliers WHERE nit = '891.333.222-7'), 'Cuarto Frío 1', 26000.00, 'LT-004', '2026-11-15'),
    ('INV-005', 'Limón Tahití (kg)', 'Frutas y Verduras', 'El Cafetal', 25.00, 8.00, 60.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '800.555.444-2'), 'Bodega Seca - Estante A', 4500.00, 'LT-005', '2026-11-28'),
    ('INV-006', 'Fresa Fresca (kg)', 'Frutas y Verduras', 'El Cafetal', 0.00, 4.00, 30.00, 'kg', 'Inactivo', FALSE, (SELECT id FROM suppliers WHERE nit = '800.555.444-2'), 'Nevera Mostrador', 8000.00, 'LT-006', '2026-11-14'),
    ('INV-007', 'Coco Fresco (Unidades)', 'Frutas y Verduras', 'El Cafetal', 30.00, 10.00, 70.00, 'unidad', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '800.555.444-2'), 'Bodega Seca', 5000.00, 'LT-007', '2026-12-05'),
    ('INV-008', 'Pulpa de Maracuyá (kg)', 'Frutas y Verduras', 'El Cafetal', 0.00, 3.00, 25.00, 'kg', 'Inactivo', FALSE, (SELECT id FROM suppliers WHERE nit = '901.999.888-6'), 'Congelador 2', 7500.00, 'LT-008', '2026-12-10'),
    ('INV-009', 'Mora Fresca (kg)', 'Frutas y Verduras', 'El Cafetal', 12.00, 4.00, 30.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '800.555.444-2'), 'Nevera Mostrador', 7000.00, 'LT-009', '2026-11-20'),
    ('INV-010', 'Leche Entera (Litros)', 'Lácteos', 'Colanta', 40.00, 10.00, 100.00, 'litro', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.123.456-1'), 'Bodega Lácteos', 3800.00, 'LT-010', '2026-11-30'),
    ('INV-011', 'Crema de Leche (Litros)', 'Lácteos', 'Alquería', 15.00, 5.00, 40.00, 'litro', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.123.456-1'), 'Bodega Lácteos', 9500.00, 'LT-011', '2026-12-01'),
    ('INV-012', 'Leche Condensada (Unidades)', 'Lácteos', 'Nestlé', 20.00, 5.00, 50.00, 'unidad', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.123.456-1'), 'Alacena Repostería', 6200.00, 'LT-012', '2027-01-15'),
    ('INV-013', 'Queso Mozzarella (kg)', 'Lácteos', 'Alpina', 16.00, 5.00, 35.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.123.456-1'), 'Nevera Cocina', 24000.00, 'LT-013', '2026-11-25'),
    ('INV-014', 'Mantequilla (Bloque 500g)', 'Lácteos', 'Colanta', 1.00, 6.00, 45.00, 'unidad', 'Inactivo', FALSE, (SELECT id FROM suppliers WHERE nit = '900.123.456-1'), 'Nevera Cocina', 11000.00, 'LT-014', '2026-11-19'),
    ('INV-015', 'Botella de Vodka 750ml', 'Bebidas y Licores', 'Absolut', 8.00, 2.00, 20.00, 'botella', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '830.111.999-4'), 'Barra Principal', 78000.00, 'LT-015', '2028-12-31'),
    ('INV-016', 'Botella de Ron Blanco 750ml', 'Bebidas y Licores', 'Medellín', 10.00, 3.00, 25.00, 'botella', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '830.111.999-4'), 'Barra Principal', 54000.00, 'LT-016', '2028-12-31'),
    ('INV-017', 'Botella de Aguardiente 750ml', 'Bebidas y Licores', 'Antioqueño', 14.00, 4.00, 30.00, 'botella', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '830.111.999-4'), 'Barra Principal', 42000.00, 'LT-017', '2028-12-31'),
    ('INV-018', 'Botella de Tequila 750ml', 'Bebidas y Licores', 'José Cuervo', 6.00, 2.00, 15.00, 'botella', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '830.111.999-4'), 'Barra Principal', 95000.00, 'LT-018', '2028-12-31'),
    ('INV-019', 'Agua Envasada 600ml', 'Bebidas y Licores', 'Cristal', 50.00, 15.00, 120.00, 'unidad', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '800.111.222-5'), 'Nevera Bebidas', 1800.00, 'LT-019', '2027-06-30'),
    ('INV-020', 'Arroz Blanco (Bolsa 5kg)', 'Insumos Secos', 'Diana', 25.00, 8.00, 60.00, 'bolsa', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '901.333.111-7'), 'Bodega Abarrotes', 19000.00, 'LT-020', '2027-03-15'),
    ('INV-021', 'Frijol Cargamanto (kg)', 'Insumos Secos', 'Genérica / Otra', 20.00, 5.00, 50.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '901.333.111-7'), 'Bodega Abarrotes', 9000.00, 'LT-021', '2027-04-10'),
    ('INV-022', 'Azúcar Blanca (Bolsa 5kg)', 'Insumos Secos', 'Manuelita', 18.00, 5.00, 40.00, 'bolsa', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '901.333.111-7'), 'Bodega Abarrotes', 21000.00, 'LT-022', '2027-08-20'),
    ('INV-023', 'Aceite de Girasol (Galón)', 'Insumos Secos', 'La Fina', 10.00, 3.00, 25.00, 'galón', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.555.222-4'), 'Almacén Cocina', 48000.00, 'LT-023', '2027-02-28'),
    ('INV-024', 'Harina de Trigo (kg)', 'Insumos Secos', 'Levapan', 15.00, 5.00, 35.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.999.444-3'), 'Almacén Repostería', 4200.00, 'LT-024', '2026-12-30'),
    ('INV-025', 'Sal Refinada (kg)', 'Insumos Secos', 'Refisal', 30.00, 10.00, 80.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '901.111.444-9'), 'Almacén Cocina', 1500.00, 'LT-025', '2028-12-31'),
    ('INV-026', 'Café en Grano (kg)', 'Insumos Secos', 'Sello Rojo', 12.00, 4.00, 30.00, 'kg', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.777.888-5'), 'Estación de Café', 28000.00, 'LT-026', '2027-01-20'),
    ('INV-027', 'Cajas para Hamburguesa (Paquete x50)', 'Empaques', 'Bio Gastronomía', 10.00, 3.00, 30.00, 'paquete', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '901.456.789-0'), 'Bodega Empaques', 32000.00, 'LT-027', '2029-12-31'),
    ('INV-028', 'Bolsas de Papel Kraft (Paquete x50)', 'Empaques', 'Bio Gastronomía', 15.00, 5.00, 40.00, 'paquete', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '901.456.789-0'), 'Bodega Empaques', 22000.00, 'LT-028', '2029-12-31'),
    ('INV-029', 'Servilletas de Papel (Paquete x500)', 'Aseo y Varios', 'Familia', 20.00, 5.00, 50.00, 'paquete', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.888.111-9'), 'Bodega General', 14000.00, 'LT-029', '2029-12-31'),
    ('INV-030', 'Rollo de Papel Aluminio Industrial', 'Aseo y Varios', 'Reynolds', 8.00, 2.00, 20.00, 'rollo', 'Activo', TRUE, (SELECT id FROM suppliers WHERE nit = '900.888.111-9'), 'Cocina Principal', 38000.00, 'LT-030', '2029-12-31')
ON CONFLICT DO NOTHING;

-- 6. Mesas del Restaurante (Mesas 1 a 10)
INSERT INTO restaurant_tables (table_number, capacity, status)
VALUES
    ('Mesa 1', 4, 'Disponible'),
    ('Mesa 2', 2, 'Disponible'),
    ('Mesa 3', 6, 'Disponible'),
    ('Mesa 4', 4, 'Disponible'),
    ('Mesa 5', 8, 'Disponible'),
    ('Mesa 6', 4, 'Disponible'),
    ('Mesa 7', 2, 'Disponible'),
    ('Mesa 8', 6, 'Disponible'),
    ('Mesa 9', 4, 'Disponible'),
    ('Mesa 10', 10, 'Disponible')
ON CONFLICT (table_number) DO NOTHING;

-- 7. Órdenes iniciales de demostración en el POS
INSERT INTO orders (order_number, table_number, waiter_id, status, observations, total_amount, created_at)
VALUES
    ('ORD-001', 'Mesa 1', (SELECT id FROM users WHERE user_email = 'carlos.mesero@dpiero.com' LIMIT 1), 'Abierta', 'Término medio en la carne', 129000.00, NOW() - INTERVAL '4 hours'),
    ('ORD-002', 'Mesa 3', (SELECT id FROM users WHERE user_email = 'maria.caja@dpiero.com' LIMIT 1), 'En preparación', 'Salsa BBQ aparte', 62000.00, NOW() - INTERVAL '3 hours'),
    ('ORD-003', 'Mesa 7', (SELECT id FROM users WHERE user_email = 'carlos.mesero@dpiero.com' LIMIT 1), 'Pagada', 'Pago en efectivo', 64500.00, NOW() - INTERVAL '2 hours'),
    ('ORD-004', 'Mesa 4', (SELECT id FROM users WHERE user_email = 'ana.cocina@dpiero.com' LIMIT 1), 'Cerrada', 'Factura electrónica enviada', 113000.00, NOW() - INTERVAL '1 hour'),
    ('ORD-005', 'Mesa 2', (SELECT id FROM users WHERE user_email = 'carlos.mesero@dpiero.com' LIMIT 1), 'Anulada', 'Cliente se retiró antes del servicio', 56000.00, NOW() - INTERVAL '30 minutes')
ON CONFLICT (order_number) DO NOTHING;

-- 8. Ítems detallados para cada orden
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
SELECT
    o.id,
    p.id,
    2,
    p.price,
    (2 * p.price),
    'Término medio'
FROM orders o
JOIN products p ON p.name = 'Punta de Anca Angus 400g'
WHERE o.order_number = 'ORD-001'
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
SELECT
    o.id,
    p.id,
    2,
    p.price,
    (2 * p.price),
    'Con hielo frappé'
FROM orders o
JOIN products p ON p.name = 'Limonada Hierbabuena Artesanal'
WHERE o.order_number = 'ORD-001'
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
SELECT
    o.id,
    p.id,
    1,
    p.price,
    p.price,
    'Salsa aparte'
FROM orders o
JOIN products p ON p.name = 'Costillas Ahumadas BBQ D''Piero'
WHERE o.order_number = 'ORD-002'
ON CONFLICT DO NOTHING;
