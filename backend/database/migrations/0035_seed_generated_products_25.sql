-- database/migrations/0035_seed_generated_products_25.sql
-- Ampliación idempotente del menú D'Piero con 13 platillos adicionales y sus fotografías generadas (25 productos en total).

INSERT INTO products (code, name, price, description, category_id, image_url, status, is_active, stock)
SELECT
    v.code,
    v.name,
    v.price::numeric(12, 2),
    v.description,
    c.id,
    v.image_url,
    v.status,
    v.is_active,
    v.stock::numeric(10, 2)
FROM (
    VALUES
        -- Platos fuertes (5 nuevos -> total 8)
        ('PAR-04', 'Pechuga Gratinada a las Brasas', 36000.00, 'Filete de pechuga marinada en finas hierbas a la parrilla con queso mozzarella gratinado y tocineta', 'platos fuertes', '/assets/images/products/pechuga-gratinada.jpg', 'Disponible', TRUE, 22),
        ('PAR-05', 'Salmón a la Parrilla con Eneldo', 54000.00, 'Lomo de salmón fresco sellado en plancha con mantequilla cítrica de limón tahití y eneldo', 'platos fuertes', '/assets/images/products/salmon-parrilla.jpg', 'Disponible', TRUE, 12),
        ('PAR-06', 'Trucha Arcoíris al Ajillo', 42000.00, 'Trucha fresca entera abierta a la brasa con láminas de ajo dorado, perejil y limón', 'platos fuertes', '/assets/images/products/trucha-al-ajillo.jpg', 'Disponible', TRUE, 14),
        ('PAR-07', 'Picada Parrillera Familiar D''Piero', 89000.00, 'Tabla mixta con res, cerdo, pollo, chorizo santandereano, chicharrón, papa criolla y maduro', 'platos fuertes', '/assets/images/products/picada-parrillera.jpg', 'Disponible', TRUE, 10),
        ('PAR-08', 'Fetuccini Alfredo con Camarones', 44000.00, 'Pasta artesanal en salsa cremosa de queso parmesano madurado con camarones salteados al ajillo', 'platos fuertes', '/assets/images/products/fetuccini-camarones.jpg', 'Disponible', TRUE, 16),

        -- Entradas (1 nueva -> total 3)
        ('ENT-03', 'Chorizo Santandereano con Arepa', 21000.00, 'Dos chorizos artesanales asados al carbón servidos con arepa de maíz pelao y limón', 'entradas', '/assets/images/products/chorizo-santandereano.jpg', 'Disponible', TRUE, 24),

        -- Bebidas (1 nueva -> total 5)
        ('BEB-05', 'Limonada de Coco Cremosa', 13000.00, 'Refrescante mezcla frappé de zumo de limón recién exprimido y crema natural de coco', 'bebidas', '/assets/images/products/limonada-coco.jpg', 'Disponible', TRUE, 35),

        -- Postres (3 nuevos -> total 5)
        ('POS-03', 'Tiramisú Clásico Italiano', 20000.00, 'Capas de bizcocho remojado en café espresso, crema suave de mascarpone y cacao amargo espolvoreado', 'postres', '/assets/images/products/tiramisu-clasico.jpg', 'Disponible', TRUE, 12),
        ('POS-04', 'Flan de Caramelo Artesanal', 15000.00, 'Flan tradicional sedoso de vainilla cocido a baño maría con salsa líquida de caramelo dorado', 'postres', '/assets/images/products/flan-caramelo.jpg', 'Disponible', TRUE, 16),
        ('POS-05', 'Volcán de Chocolate Fundido', 21000.00, 'Bizcocho tibio de cacao al 70% con centro líquido de chocolate servido con frutos rojos frescos', 'postres', '/assets/images/products/volcan-chocolate.jpg', 'Disponible', TRUE, 14),

        -- Guarniciones (3 nuevas -> total 4)
        ('GUA-02', 'Plátano Maduro Asado con Queso', 11000.00, 'Plátano maduro caramelizado al horno relleno de queso doble crema gratinado y bocadillo', 'guarniciones', '/assets/images/products/maduro-con-queso.jpg', 'Disponible', TRUE, 25),
        ('GUA-03', 'Ensalada César Clásica', 15000.00, 'Lechuga romana fresca, crutones al ajo, láminas de queso parmesano y aderezo César tradicional', 'guarniciones', '/assets/images/products/ensalada-cesar.jpg', 'Disponible', TRUE, 20),
        ('GUA-04', 'Arepa con Queso Asada a la Brasa', 9000.00, 'Arepa artesanal de maíz blanco asada a la parrilla rellena de queso campesino derretido', 'guarniciones', '/assets/images/products/arepa-con-queso.jpg', 'Disponible', TRUE, 35)
) AS v(code, name, price, description, category_name, image_url, status, is_active, stock)
JOIN categories c ON LOWER(c.name) = LOWER(v.category_name)
WHERE NOT EXISTS (
    SELECT 1 FROM products p WHERE p.code = v.code
);
