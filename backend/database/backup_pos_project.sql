--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_codes DROP CONSTRAINT IF EXISTS password_reset_codes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_waiter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_user;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_permission;
ALTER TABLE IF EXISTS ONLY public.user_groups DROP CONSTRAINT IF EXISTS fk_user_groups_user;
ALTER TABLE IF EXISTS ONLY public.user_groups DROP CONSTRAINT IF EXISTS fk_user_groups_group;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS fk_permissions_content_type;
ALTER TABLE IF EXISTS ONLY public.group_permissions DROP CONSTRAINT IF EXISTS fk_group_permissions_permission;
ALTER TABLE IF EXISTS ONLY public.group_permissions DROP CONSTRAINT IF EXISTS fk_group_permissions_group;
DROP INDEX IF EXISTS public.idx_reset_codes_email_code;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_user_email_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.user_groups DROP CONSTRAINT IF EXISTS user_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.content_type DROP CONSTRAINT IF EXISTS uq_content_type;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_pkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_nit_key;
ALTER TABLE IF EXISTS ONLY public.restaurant_tables DROP CONSTRAINT IF EXISTS restaurant_tables_table_number_key;
ALTER TABLE IF EXISTS ONLY public.restaurant_tables DROP CONSTRAINT IF EXISTS restaurant_tables_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_permission_codename_key;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_codes DROP CONSTRAINT IF EXISTS password_reset_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_key;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_group_name_key;
ALTER TABLE IF EXISTS ONLY public.group_permissions DROP CONSTRAINT IF EXISTS group_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.content_type DROP CONSTRAINT IF EXISTS content_type_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE IF EXISTS ONLY public._migrations DROP CONSTRAINT IF EXISTS _migrations_pkey;
ALTER TABLE IF EXISTS ONLY public._migrations DROP CONSTRAINT IF EXISTS _migrations_name_key;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.suppliers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.restaurant_tables ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permissions ALTER COLUMN permission_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.password_reset_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.groups ALTER COLUMN group_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_type ALTER COLUMN content_type_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public._migrations ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_permissions;
DROP TABLE IF EXISTS public.user_groups;
DROP SEQUENCE IF EXISTS public.suppliers_id_seq;
DROP TABLE IF EXISTS public.suppliers;
DROP SEQUENCE IF EXISTS public.restaurant_tables_id_seq;
DROP TABLE IF EXISTS public.restaurant_tables;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.permissions_permission_id_seq;
DROP TABLE IF EXISTS public.permissions;
DROP SEQUENCE IF EXISTS public.payments_id_seq;
DROP TABLE IF EXISTS public.payments;
DROP SEQUENCE IF EXISTS public.password_reset_codes_id_seq;
DROP TABLE IF EXISTS public.password_reset_codes;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.inventory_id_seq;
DROP TABLE IF EXISTS public.inventory;
DROP SEQUENCE IF EXISTS public.groups_group_id_seq;
DROP TABLE IF EXISTS public.groups;
DROP TABLE IF EXISTS public.group_permissions;
DROP SEQUENCE IF EXISTS public.content_type_content_type_id_seq;
DROP TABLE IF EXISTS public.content_type;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public._migrations_id_seq;
DROP TABLE IF EXISTS public._migrations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT now()
);


--
-- Name: _migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._migrations_id_seq OWNED BY public._migrations.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: content_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_type (
    content_type_id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL,
    display_name character varying(100) DEFAULT ''::character varying NOT NULL
);


--
-- Name: content_type_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_type_content_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_type_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_type_content_type_id_seq OWNED BY public.content_type.content_type_id;


--
-- Name: group_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_permissions (
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    group_id integer NOT NULL,
    group_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_group_id_seq OWNED BY public.groups.group_id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    item_name character varying(150) NOT NULL,
    category character varying(100) NOT NULL,
    current_stock numeric(10,2) DEFAULT 0 NOT NULL,
    min_stock numeric(10,2) DEFAULT 0 NOT NULL,
    max_stock numeric(10,2) DEFAULT 0 NOT NULL,
    unit_measure character varying(50) NOT NULL,
    supplier_id integer,
    last_updated timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    brand character varying(100),
    status character varying(50) DEFAULT 'Activo'::character varying,
    is_active boolean DEFAULT true,
    code character varying(50),
    description text,
    location character varying(150),
    price_buy numeric(12,2) DEFAULT 0,
    batch_number character varying(50),
    expiration_date date
);


--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0.00 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    table_number character varying(50) NOT NULL,
    waiter_id integer,
    status character varying(50) DEFAULT 'No Pagada'::character varying,
    observations text,
    total_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    payment_method character varying(50)
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_codes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    email character varying(150) NOT NULL,
    code character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: password_reset_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_codes_id_seq OWNED BY public.password_reset_codes.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id integer NOT NULL,
    payment_method character varying(50) NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    tip numeric(12,2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'Completado'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    permission_name character varying(150) NOT NULL,
    permission_codename character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    content_type_id integer
);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    price numeric(12,2) DEFAULT 0.00 NOT NULL,
    category_id integer,
    image_url text,
    status character varying(50) DEFAULT 'Disponible'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    code character varying(50),
    stock numeric(10,2) DEFAULT 0
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: restaurant_tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurant_tables (
    id integer NOT NULL,
    table_number character varying(50) NOT NULL,
    capacity integer DEFAULT 4,
    status character varying(50) DEFAULT 'Disponible'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: restaurant_tables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.restaurant_tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: restaurant_tables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.restaurant_tables_id_seq OWNED BY public.restaurant_tables.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    nit character varying(50) NOT NULL,
    company_name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(30),
    address character varying(200),
    observation text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: user_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_groups (
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_permissions (
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    user_name character varying(100) NOT NULL,
    user_email character varying(150) NOT NULL,
    user_phone character varying(20),
    user_document_types character varying(20),
    user_document_number character varying(50) NOT NULL,
    user_password text,
    user_avatar_url text,
    is_staff boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_superuser boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    pin character varying(10),
    user_type character varying(50),
    corporate_email character varying(150),
    start_date date,
    end_date date
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: _migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._migrations ALTER COLUMN id SET DEFAULT nextval('public._migrations_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: content_type content_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_type ALTER COLUMN content_type_id SET DEFAULT nextval('public.content_type_content_type_id_seq'::regclass);


--
-- Name: groups group_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN group_id SET DEFAULT nextval('public.groups_group_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: password_reset_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_codes ALTER COLUMN id SET DEFAULT nextval('public.password_reset_codes_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions permission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.permissions_permission_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: restaurant_tables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_tables ALTER COLUMN id SET DEFAULT nextval('public.restaurant_tables_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._migrations (id, name, executed_at) FROM stdin;
1	0001_create_users_table.sql	2026-08-26 14:24:10.638042
2	0002_create_categories_table.sql	2026-08-26 15:34:10.048761
3	0003_create_products_table.sql	2026-08-26 15:34:10.137444
4	0004_create_suppliers_table.sql	2026-08-26 15:34:10.158822
5	0005_create_inventory_table.sql	2026-08-26 15:34:10.173631
6	0006_create_tables_table.sql	2026-08-26 15:34:10.182677
7	0007_create_orders_table.sql	2026-08-26 15:34:10.192512
8	0008_create_order_items_table.sql	2026-08-26 15:34:10.205463
9	0009_create_payments_table.sql	2026-08-26 15:34:10.216555
10	0010_update_users_table.sql	2026-09-28 18:40:47.790388
11	0011_seed_initial_users.sql	2026-09-28 18:40:47.841245
12	0012_create_password_reset_codes_table.sql	2026-10-05 19:50:05.608566
13	0013_create_permissions.sql	2026-11-03 15:53:34.534717
14	0014_create_groups.sql	2026-11-03 15:53:34.725724
15	0015_create_group_permissions.sql	2026-11-03 15:53:34.73807
16	0016_create_user_groups.sql	2026-11-03 15:53:34.754862
17	0017_create_user_permissions.sql	2026-11-03 15:53:34.761861
18	0018_add_is_active_to_groups.sql	2026-11-03 15:53:34.770186
19	0019_create_content_type.sql	2026-11-03 15:53:34.774346
20	0020_add_fk_permissions_content_type.sql	2026-11-03 15:53:34.784044
21	0021_seed_content_type_modules.sql	2026-11-03 15:53:34.855738
22	0022_seed_pos_groups.sql	2026-11-03 15:53:34.862819
23	0023_seed_users_permissions.sql	2026-11-03 15:53:34.867389
24	0024_seed_products_orders_permissions.sql	2026-11-03 15:53:34.875617
25	0025_seed_inventory_suppliers_permissions.sql	2026-11-03 15:53:34.878838
26	0026_seed_groups_default_permissions_and_user_groups.sql	2026-11-03 15:53:34.881211
27	0027_seed_initial_pos_data.sql	2026-11-05 07:55:24.260081
28	0028_seed_cajero_disable_inventory.sql	2026-11-12 08:38:02.99919
29	0029_order_two_statuses_and_payment_method.sql	2026-11-12 09:55:22.470801
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, is_active, created_at, updated_at) FROM stdin;
1	platos fuertes	Cortes de carne, hamburguesas, costillas y platos principales a la parrilla	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
2	entradas	Chicharrones, empanadas y bocados para compartir	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
3	bebidas	Limonadas artesanales, jugos naturales, cÃ³cteles y cervezas	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
4	postres	Flanes, tortas tradicionales y dulces de la casa	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
5	guarniciones	Papas rÃºsticas, arepas, ensaladas y acompaÃ±amientos	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
\.


--
-- Data for Name: content_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_type (content_type_id, app_label, model, display_name) FROM stdin;
1	users	user	Usuarios
2	products	product	Productos
3	orders	order	Ã“rdenes
4	inventory	inventory	Inventario
5	suppliers	supplier	Proveedores
\.


--
-- Data for Name: group_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_permissions (group_id, permission_id) FROM stdin;
2	16
2	12
2	11
2	14
2	10
2	6
2	17
3	6
3	10
3	11
3	12
4	6
4	10
4	12
1	16
1	12
1	8
1	20
1	3
1	13
1	15
1	11
1	7
1	2
1	17
1	9
1	21
1	5
1	4
1	14
1	10
1	6
1	18
1	1
1	19
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (group_id, group_name, created_at, updated_at, is_active) FROM stdin;
1	Administrador	2026-11-03 15:53:34.862819	2026-11-03 15:53:34.862819	t
2	Cajero	2026-11-03 15:53:34.862819	2026-11-03 15:53:34.862819	t
3	Mesero	2026-11-03 15:53:34.862819	2026-11-03 15:53:34.862819	t
4	Cocina	2026-11-03 15:53:34.862819	2026-11-03 15:53:34.862819	t
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory (id, item_name, category, current_stock, min_stock, max_stock, unit_measure, supplier_id, last_updated, created_at, brand, status, is_active, code, description, location, price_buy, batch_number, expiration_date) FROM stdin;
2	Lomo de Res (kg)	Carnes	12.00	4.00	30.00	kg	8	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	San MartÃ­n	Activo	t	INV-002	\N	Cuarto FrÃ­o 1	38000.00	LT-002	2026-11-22
4	Costilla de Cerdo (kg)	Carnes	2.00	5.00	40.00	kg	8	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	San MartÃ­n	Inactivo	f	INV-004	\N	Cuarto FrÃ­o 1	26000.00	LT-004	2026-11-15
5	LimÃ³n TahitÃ­ (kg)	Frutas y Verduras	25.00	8.00	60.00	kg	4	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	El Cafetal	Activo	t	INV-005	\N	Bodega Seca - Estante A	4500.00	LT-005	2026-11-28
6	Fresa Fresca (kg)	Frutas y Verduras	0.00	4.00	30.00	kg	4	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	El Cafetal	Inactivo	f	INV-006	\N	Nevera Mostrador	8000.00	LT-006	2026-11-14
7	Coco Fresco (Unidades)	Frutas y Verduras	30.00	10.00	70.00	unidad	4	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	El Cafetal	Activo	t	INV-007	\N	Bodega Seca	5000.00	LT-007	2026-12-05
8	Pulpa de MaracuyÃ¡ (kg)	Frutas y Verduras	0.00	3.00	25.00	kg	13	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	El Cafetal	Inactivo	f	INV-008	\N	Congelador 2	7500.00	LT-008	2026-12-10
9	Mora Fresca (kg)	Frutas y Verduras	12.00	4.00	30.00	kg	4	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	El Cafetal	Activo	t	INV-009	\N	Nevera Mostrador	7000.00	LT-009	2026-11-20
10	Leche Entera (Litros)	LÃ¡cteos	40.00	10.00	100.00	litro	1	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Colanta	Activo	t	INV-010	\N	Bodega LÃ¡cteos	3800.00	LT-010	2026-11-30
11	Crema de Leche (Litros)	LÃ¡cteos	15.00	5.00	40.00	litro	1	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	AlquerÃ­a	Activo	t	INV-011	\N	Bodega LÃ¡cteos	9500.00	LT-011	2026-12-01
12	Leche Condensada (Unidades)	LÃ¡cteos	20.00	5.00	50.00	unidad	1	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	NestlÃ©	Activo	t	INV-012	\N	Alacena ReposterÃ­a	6200.00	LT-012	2027-01-15
13	Queso Mozzarella (kg)	LÃ¡cteos	16.00	5.00	35.00	kg	1	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Alpina	Activo	t	INV-013	\N	Nevera Cocina	24000.00	LT-013	2026-11-25
14	Mantequilla (Bloque 500g)	LÃ¡cteos	1.00	6.00	45.00	unidad	1	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Colanta	Inactivo	f	INV-014	\N	Nevera Cocina	11000.00	LT-014	2026-11-19
15	Botella de Vodka 750ml	Bebidas y Licores	8.00	2.00	20.00	botella	7	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Absolut	Activo	t	INV-015	\N	Barra Principal	78000.00	LT-015	2028-12-31
16	Botella de Ron Blanco 750ml	Bebidas y Licores	10.00	3.00	25.00	botella	7	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	MedellÃ­n	Activo	t	INV-016	\N	Barra Principal	54000.00	LT-016	2028-12-31
17	Botella de Aguardiente 750ml	Bebidas y Licores	14.00	4.00	30.00	botella	7	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	AntioqueÃ±o	Activo	t	INV-017	\N	Barra Principal	42000.00	LT-017	2028-12-31
18	Botella de Tequila 750ml	Bebidas y Licores	6.00	2.00	15.00	botella	7	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	JosÃ© Cuervo	Activo	t	INV-018	\N	Barra Principal	95000.00	LT-018	2028-12-31
19	Agua Envasada 600ml	Bebidas y Licores	50.00	15.00	120.00	unidad	25	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Cristal	Activo	t	INV-019	\N	Nevera Bebidas	1800.00	LT-019	2027-06-30
20	Arroz Blanco (Bolsa 5kg)	Insumos Secos	25.00	8.00	60.00	bolsa	24	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Diana	Activo	t	INV-020	\N	Bodega Abarrotes	19000.00	LT-020	2027-03-15
21	Frijol Cargamanto (kg)	Insumos Secos	20.00	5.00	50.00	kg	24	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	GenÃ©rica / Otra	Activo	t	INV-021	\N	Bodega Abarrotes	9000.00	LT-021	2027-04-10
22	AzÃºcar Blanca (Bolsa 5kg)	Insumos Secos	18.00	5.00	40.00	bolsa	24	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Manuelita	Activo	t	INV-022	\N	Bodega Abarrotes	21000.00	LT-022	2027-08-20
23	Aceite de Girasol (GalÃ³n)	Insumos Secos	10.00	3.00	25.00	galÃ³n	16	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	La Fina	Activo	t	INV-023	\N	AlmacÃ©n Cocina	48000.00	LT-023	2027-02-28
24	Harina de Trigo (kg)	Insumos Secos	15.00	5.00	35.00	kg	\N	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Levapan	Activo	t	INV-024	\N	AlmacÃ©n ReposterÃ­a	4200.00	LT-024	2026-12-30
25	Sal Refinada (kg)	Insumos Secos	30.00	10.00	80.00	kg	20	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Refisal	Activo	t	INV-025	\N	AlmacÃ©n Cocina	1500.00	LT-025	2028-12-31
26	CafÃ© en Grano (kg)	Insumos Secos	12.00	4.00	30.00	kg	5	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Sello Rojo	Activo	t	INV-026	\N	EstaciÃ³n de CafÃ©	28000.00	LT-026	2027-01-20
27	Cajas para Hamburguesa (Paquete x50)	Empaques	10.00	3.00	30.00	paquete	3	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Bio GastronomÃ­a	Activo	t	INV-027	\N	Bodega Empaques	32000.00	LT-027	2029-12-31
28	Bolsas de Papel Kraft (Paquete x50)	Empaques	15.00	5.00	40.00	paquete	3	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Bio GastronomÃ­a	Activo	t	INV-028	\N	Bodega Empaques	22000.00	LT-028	2029-12-31
29	Servilletas de Papel (Paquete x500)	Aseo y Varios	20.00	5.00	50.00	paquete	9	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Familia	Activo	t	INV-029	\N	Bodega General	14000.00	LT-029	2029-12-31
30	Rollo de Papel Aluminio Industrial	Aseo y Varios	8.00	2.00	20.00	rollo	9	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	Reynolds	Activo	t	INV-030	\N	Cocina Principal	38000.00	LT-030	2029-12-31
1	Corte Punta de Anca (kg)	Carnes	15.00	5.00	40.00	kg	8	2026-11-05 09:16:52.655742	2026-11-05 07:55:24.260081	San MartÃ­n	Activo	t	INV-001	\N	Cuarto FrÃ­o 1	42000.00	LT-001	2026-11-20
3	Pechuga de Pollo Entera (kg)	Carnes	20.00	6.00	50.00	kg	2	2026-11-05 09:29:13.719155	2026-11-05 07:55:24.260081	San Fernando	Activo	t	INV-003	\N	Cuarto FrÃ­o 2	18000.00	LT-003	2026-11-18
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, subtotal, notes, created_at) FROM stdin;
1	1	1	2	56000.00	112000.00	TÃ©rmino medio	2026-11-05 07:55:24.260081
2	1	6	2	10000.00	20000.00	Con hielo frappÃ©	2026-11-05 07:55:24.260081
3	2	2	1	48000.00	48000.00	Salsa aparte	2026-11-05 07:55:24.260081
5	7	1	1	0.00	0.00		2026-11-05 10:28:00.057319
11	10	1	2	0.00	0.00	\N	2026-11-08 20:15:27.933051
12	11	1	1	0.00	0.00		2026-11-12 08:14:15.098763
13	12	1	1	0.00	0.00		2026-11-12 09:37:52.617556
14	12	3	1	0.00	0.00		2026-11-12 09:37:52.617556
15	12	5	1	0.00	0.00		2026-11-12 09:37:52.617556
16	13	1	1	0.00	0.00		2026-11-12 09:38:23.500444
17	14	5	1	0.00	0.00		2026-11-12 09:39:32.746501
18	15	1	3	0.00	0.00		2026-11-12 12:39:41.406729
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, table_number, waiter_id, status, observations, total_amount, created_at, updated_at, payment_method) FROM stdin;
3	ORD-003	Mesa 7	2	Pagada	Pago en efectivo	64500.00	2026-11-05 05:55:24.260081	2026-11-05 07:55:24.260081	\N
1	ORD-001	Mesa 1	2	No Pagada	TÃ©rmino medio en la carne	129000.00	2026-11-05 03:55:24.260081	2026-11-05 07:55:24.260081	\N
2	ORD-002	Mesa 3	3	No Pagada	Salsa BBQ aparte	62000.00	2026-11-05 04:55:24.260081	2026-11-05 07:55:24.260081	\N
4	ORD-004	Mesa 4	4	No Pagada	Factura electrÃ³nica enviada	113000.00	2026-11-05 06:55:24.260081	2026-11-05 07:55:24.260081	\N
5	ORD-005	Mesa 2	2	No Pagada	Cliente se retirÃ³ antes del servicio	56000.00	2026-11-05 07:25:24.260081	2026-11-05 07:55:24.260081	\N
7	ORD-007	Mesa 5	\N	No Pagada	Sin cebolla en la carne	0.00	2026-11-05 10:28:00.057319	2026-11-05 10:28:00.057319	\N
10	ORD-006	Mesa 8	\N	No Pagada		0.00	2026-11-05 08:19:30	2026-11-05 08:19:30	\N
11	ORD-011	Mesa 2	\N	No Pagada	Sin observaciones adicionales	0.00	2026-11-12 08:14:15.098763	2026-11-12 08:14:15.098763	\N
12	ORD-012	Mesa 4	\N	No Pagada	Sin observaciones adicionales	0.00	2026-11-12 09:37:52.617556	2026-11-12 09:37:52.617556	\N
13	ORD-013	Mesa 9	\N	No Pagada	Sin observaciones adicionales	0.00	2026-11-12 09:38:23.500444	2026-11-12 09:38:23.500444	\N
14	ORD-014	Mesa 10	\N	No Pagada	Sin observaciones adicionales	0.00	2026-11-12 09:39:32.746501	2026-11-12 09:39:32.746501	\N
15	ORD-015	Mesa 1	\N	Abierta	Sin observaciones adicionales	0.00	2026-11-12 12:39:41.406729	2026-11-12 12:39:41.406729	\N
\.


--
-- Data for Name: password_reset_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_codes (id, user_id, email, code, expires_at, used, created_at) FROM stdin;
1	8	santyguitar6@gmail.com	660372	2026-10-05 20:07:54.906	t	2026-10-05 19:52:54.912975
2	8	santyguitar6@gmail.com	144470	2026-10-05 20:08:14.143	t	2026-10-05 19:53:14.144641
3	8	santyguitar6@gmail.com	241248	2026-10-05 20:24:12.434	t	2026-10-05 20:09:12.439765
5	8	santyguitar6@gmail.com	705544	2026-11-12 09:50:12.901	f	2026-11-12 09:35:12.910693
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, order_id, payment_method, amount_paid, tip, status, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (permission_id, permission_name, permission_codename, created_at, updated_at, content_type_id) FROM stdin;
1	Listar usuarios	list_user	2026-11-03 15:53:34.867389	2026-11-03 15:53:34.867389	1
2	Crear usuarios	create_user	2026-11-03 15:53:34.867389	2026-11-03 15:53:34.867389	1
3	Actualizar usuarios	update_user	2026-11-03 15:53:34.867389	2026-11-03 15:53:34.867389	1
4	Generar Reporte usuarios	report_user	2026-11-03 15:53:34.867389	2026-11-03 15:53:34.867389	1
5	Deshabilitar usuarios	disable_user	2026-11-03 15:53:34.867389	2026-11-03 15:53:34.867389	1
6	Listar productos	list_product	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	2
7	Crear productos	create_product	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	2
8	Actualizar productos	update_product	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	2
9	Deshabilitar productos	disable_product	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	2
10	Listar Ã³rdenes	list_order	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	3
11	Crear Ã³rdenes	create_order	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	3
12	Actualizar Ã³rdenes	update_order	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	3
13	Cancelar Ã³rdenes	cancel_order	2026-11-03 15:53:34.875617	2026-11-03 15:53:34.875617	3
14	Listar inventario	list_inventory	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	4
15	Crear insumos	create_inventory	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	4
16	Actualizar inventario	update_inventory	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	4
17	Deshabilitar insumos	disable_inventory	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	4
18	Listar proveedores	list_supplier	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	5
19	Crear proveedores	create_supplier	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	5
20	Actualizar proveedores	update_supplier	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	5
21	Deshabilitar proveedores	disable_supplier	2026-11-03 15:53:34.878838	2026-11-03 15:53:34.878838	5
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, price, category_id, image_url, status, is_active, created_at, updated_at, code, stock) FROM stdin;
2	Costillas Ahumadas BBQ D'Piero	Costillas de cerdo seleccionadas, cocciÃ³n lenta al carbÃ³n por 6 horas y glaseado BBQ de la casa	48000.00	1	/assets/images/costillas-bbq-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	PAR-02	12.00
6	Limonada Hierbabuena Artesanal	Zumo de limÃ³n reciÃ©n exprimido macerado con hierbabuena fresca y hielo frappÃ©	10000.00	3	/assets/images/limonada-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	BEB-01	45.00
7	CÃ³ctel de Frutos Rojos & Fresa	MixologÃ­a de autor a base de fresas orgÃ¡nicas, toques cÃ­tricos, vodka premium y escarchado	24000.00	3	/assets/images/coctel-fresa-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	BEB-02	20.00
8	Cerveza Artesanal Rubia 330ml	Cerveza artesanal de la casa tipo Pale Ale, notas florales y cuerpo equilibrado	14000.00	3	/assets/images/cerveza-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	BEB-03	36.00
9	Jugo Natural de Fruta Fresca	Jugo natural en agua o leche (Mandarina, MaracuyÃ¡, Mango o Lulo)	9000.00	3	/assets/images/jugo-natural-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	BEB-04	40.00
10	Postre Gourmet de Coco	Flan cremoso de leche de coco natural con lÃ¡minas de coco tostado y caramelo dorado	17000.00	4	/assets/images/postre-coco-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	POS-01	14.00
11	Torta Tradicional Tres Leches	Bizcochuelo baÃ±ado en salsa de tres leches con merengue suizo y canela fina	16000.00	4	/assets/images/tres-leches-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	POS-02	10.00
12	Papas RÃºsticas a las Finas Hierbas	Cascos de papa criolla dorados con romero fresco, paprika ahumada y salsa de ajo	12000.00	5	/assets/images/papas-rusticas-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	GUA-01	28.00
4	ChicharrÃ³n Carnudo Crocante	Tiras de tocino carnudo crujiente con arepitas santandereanas y limÃ³n mandarino	28000.00	2	/assets/images/chicharron-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-12 07:59:51.37424	ENT-01	15.00
3	Hamburguesa D'Piero Artesanal	200g carne angus a la parrilla, queso cheddar fundido, tocineta ahumada y pan brioche artesanal	34000.00	1	/assets/images/hamburguesa-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081	PAR-03	24.00
5	Empanadas de Carne & Papa (x5)	Cinco empanadas crujientes rellenas de lomo picado y papa criolla con ajÃ­ casero	18000.00	2	/assets/images/empanadas-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-12 08:05:44.152159	ENT-02	28.00
1	Punta de Anca Angus 400g	Corte angus certificado madurado a la brasa con chimichurri rÃºstico y sal marina	56000.00	1	/assets/images/punta-de-anca-hd.jpg	Disponible	t	2026-11-05 07:55:24.260081	2026-11-05 09:35:18.994226	PAR-01	9.00
\.


--
-- Data for Name: restaurant_tables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.restaurant_tables (id, table_number, capacity, status, created_at, updated_at) FROM stdin;
1	Mesa 1	4	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
2	Mesa 2	2	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
3	Mesa 3	6	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
4	Mesa 4	4	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
5	Mesa 5	8	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
6	Mesa 6	4	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
7	Mesa 7	2	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
8	Mesa 8	6	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
9	Mesa 9	4	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
10	Mesa 10	10	Disponible	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, nit, company_name, email, phone, address, observation, is_active, created_at, updated_at) FROM stdin;
3	901.456.789-0	Empaques Bio & Eco GastronomÃ­a	pedidos@empaquesbio.com.co	3104567890	Carrera 68 # 45-20, MedellÃ­n	Cajas ecolÃ³gicas para hamburguesas y bolsas de papel kraft biodegradables	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
4	800.555.444-2	Comercializadora Fruver Central	info@fruvercentral.com	3205554442	Central de Abastos Bodega 4	Fruta fresca seleccionada: limÃ³n tahitÃ­, maracuyÃ¡, fresas y verduras	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
5	900.777.888-5	Distribuciones de CafÃ© & Bebidas S.A.S.	servicio@cafebebidas.co	3127778885	Zona Industrial Manizales	CafÃ© especial en grano tostado y jarabes saborizantes	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
6	901.222.333-8	PescaderÃ­a y Mariscos del PacÃ­fico	soporte@mariscosPacifico.com	3012223338	Puerto Pesquero Buenaventura	Camarones y filetes de pescado de exportaciÃ³n	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
7	830.111.999-4	Importadora de Licores & Vinos El Prado	ventas@licoreselprado.com.co	3171119994	Calle 93 # 14-20, BogotÃ¡	Vodka Absolut, Tequila JosÃ© Cuervo y vinos tintos de reserva	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
8	891.333.222-7	Procesadora de Carnes FrÃ­as y Embutidos	comercial@carnesfrias.com	3143332227	Km 5 VÃ­a ZipaquirÃ¡	Tocinetas ahumadas, salchichas artesanales y chorizos campesinos	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
9	900.888.111-9	Productos de Limpieza e Higiene Industrial	contacto@higieneindustrial.co	3188881119	Parque Industrial Cota	Detergentes biodegradables y desinfectantes aprobados por Invima	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
10	901.666.555-2	Dotaciones y Chef Uniforms Alfa	ventas@chefuniforms.com	3026665552	Carrera 15 # 72-10, BogotÃ¡	Filipinas, delantales y calzado antideslizante para cocina	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
11	800.444.777-1	Panificadora e Insumos de ReposterÃ­a	pedidos@panificadora.co	3114447771	Av. BoyacÃ¡ # 65-40	Pan brioche artesanal para hamburguesas y bases de torta	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
12	900.333.666-0	Conservas y Salsas Gourmet S.A.S.	atencion@salsasgourmet.com	3133336660	Km 2 VÃ­a Siberia	Salsa BBQ ahumada de la casa, mayonesas y mostazas artesanales	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
13	901.999.888-6	Congelados y Pulpas de Fruta Andina	operaciones@pulpasandina.com.co	3169998886	Central Mayorista Bloque 8	Pulpas pasteurizadas 100% naturales sin azÃºcar aÃ±adida	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
14	890.222.111-5	Gas e Insumos de Cocina Industrial	ventas@cocinaindustrial.co	3192221115	Calle 13 # 40-15	Mantenimiento y suministro para estufas y parrillas a gas	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
15	800.999.000-3	Suministros de CristalerÃ­a y Menaje S.A.	info@menaje.com	3059990003	Carrera 30 # 25-10	Copas de cÃ³ctel, vajilla rÃºstica y cubiertos de acero	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
16	900.555.222-4	Distribuidora de Aceites y Grasas	soporte@aceitesygrasas.co	3045552224	Zona Franca FontibÃ³n	Aceite de girasol por galÃ³n para freidoras de alta temperatura	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
17	901.777.333-1	Hortalizas y Verduras HidropÃ³nicas	contacto@verdurashidro.com	3107773331	Vereda Chorrillos Suba	Hierbabuena, lechuga crespa y tomates hidropÃ³nicos sin pesticidas	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
19	900.444.111-2	Sistemas de FumigaciÃ³n y Control de Plagas	servicio@controlplagas.com.co	3184441112	Carrera 50 # 100-20	Certificaciones periÃ³dicas de sanidad para restaurantes	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
20	901.111.444-9	Especias y Condimentos del Mundo	ventas@especias.com	3121114449	Calle 68 # 22-10	Pimienta negra reciÃ©n molida, orÃ©gano, paprika y sal marina	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
21	830.888.444-6	LÃ¡cteos y Quesos Madurados Ltda.	pedidos@quesosmadurados.co	3178884446	UbatÃ© Cundinamarca	Queso cheddar madurado en bloque y queso costeÃ±o	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
22	900.222.999-0	Servicios de RefrigeraciÃ³n y Neveras	despachos@refrigeracion.com	3012229990	Av. 68 # 15-30	CalibraciÃ³n y repuestos de congeladores y cuartos frÃ­os	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
23	891.777.444-3	Muebles y Barras para Restaurantes	contacto@mueblesrestaurante.co	3147774443	Barrio 12 de Octubre	Mantenimiento de mesas de madera y sillas de comedor	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
24	901.333.111-7	Importadora de Arroz y Granos Especiales	info@granosimportados.com	3203331117	Corabastos Bodega 12	Arroz blanco selecto y frijol cargamanto en bultos	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
26	900.666.333-8	Imprenta de MenÃºs y Publicidad Pop	produccion@imprentamenus.com	3136663338	Carrera 10 # 18-20	Cartas laminadas e impresos institucionales D'Piero	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
25	800.111.222-5	Comercializadora de Hielo y Agua Brisa	ventas@hielobrisa.co	3111112225	Calle 80 # 70-15	Hielo cristalino frappÃ© y en cubos para coctelerÃ­a	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
1	900.123.456-1	Distribuidora LÃ¡cteos del Campo S.A.S.	ventas@lacteosdelcampo.co	3001234567	Calle 45 # 12-34, BogotÃ¡	Proveedor principal de queso mozzarella, crema de leche y mantequilla	f	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
18	890.555.666-8	DistribuciÃ³n de Cervezas Artesanales	pedidos@cervezasartesanales.co	3155556668	Calle 85 # 11-50	Cervezas tipo Pale Ale, Stout y Rubia de barril	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
2	890.987.654-3	AvÃ­cola y Carnes del Valle S.A.	contacto@carnesdelvalle.com	3159876543	Av. Santander # 89-12, Cali	Cortes premium de res y pollo fresco certificado	t	2026-11-05 07:55:24.260081	2026-11-05 07:55:24.260081
\.


--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_groups (user_id, group_id) FROM stdin;
1	1
8	1
3	2
7	2
2	3
5	3
4	4
15	3
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_permissions (user_id, permission_id) FROM stdin;
1	1
8	1
1	2
8	2
1	3
8	3
1	4
8	4
1	5
8	5
1	6
8	6
1	7
8	7
1	8
8	8
1	9
8	9
1	10
8	10
1	11
8	11
1	12
8	12
1	13
8	13
1	14
8	14
1	15
8	15
1	16
8	16
1	17
8	17
1	18
8	18
1	19
8	19
1	20
8	20
1	21
8	21
3	6
7	6
3	10
7	10
3	11
7	11
3	12
7	12
3	14
7	14
3	16
7	16
2	6
5	6
2	10
5	10
2	11
5	11
2	12
5	12
4	6
4	10
4	12
15	6
15	10
15	11
15	12
3	17
7	17
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, user_name, user_email, user_phone, user_document_types, user_document_number, user_password, user_avatar_url, is_staff, is_active, is_superuser, created_at, updated_at, pin, user_type, corporate_email, start_date, end_date) FROM stdin;
1	Administrador General	admin@dpiero.com	3001234567	CC	1000000001	$2b$10$9ZSar0stjiLkcAWs5mtab.YdpcX4LFdn64OlBvjVS9vB3mtjYddN6	/assets/images/worker-juan.jpg	t	t	t	2026-09-28 18:40:47.841245	2026-11-12 07:59:36.133924	\N	admin	admin@dpiero.com	\N	\N
8	Santiago VÃ©lez	santyguitar6@gmail.com	\N	CC	1000000008	$2b$10$1ujVrASY8ySVuwogvNimsujF8rFmIRbwr1RQ2ZxhYo7Z0IX3M8oDG	/assets/images/worker-juan.jpg	f	t	t	2026-09-28 19:27:56.362733	2026-09-28 19:27:56.362733	1234	admin	santyguitar6@gmail.com	\N	\N
5	Prueba Sistema	prueba.sistema@dpiero.com	3009998877	CC	1099887766	\N	/assets/images/worker-carlos.jpg	t	t	f	2026-09-28 18:44:19.44184	2026-09-28 18:44:19.44184	4321	mesero	prueba.sistema@dpiero.com	2026-01-01	2026-12-31
3	MarÃ­a Cajera	maria.caja@dpiero.com	3205556677	CC	1000000003	\N	/assets/images/worker-maria.jpg	t	t	f	2026-09-28 18:40:47.841245	2026-09-28 18:40:47.841245	1234	cajero	maria.caja@dpiero.com	\N	\N
7	Santiago Vï¿½lez	santiago.velez@dpiero.com	3101234567	CC	1106395363	\N	/assets/images/worker-maria.jpg	t	t	f	2026-09-28 19:26:29.538288	2026-09-28 19:26:29.538288	1234	cajero	santiago.velez@dpiero.com	\N	\N
4	Ana Cocina	ana.cocina@dpiero.com	3154443322	CC	1000000004	\N	/assets/images/worker-ana.jpg	t	f	f	2026-09-28 18:40:47.841245	2026-11-05 11:24:59.056242	1234	cocina	ana.cocina@dpiero.com	\N	\N
2	Carlos Mesero	carlos.mesero@dpiero.com	3109876543	CC	1000000002	\N	/assets/images/worker-carlos.jpg	t	t	f	2026-09-28 18:40:47.841245	2026-11-05 11:26:24.496627	1234	mesero	carlos.mesero@dpiero.com	\N	\N
15	Jose	jose@gmail.com	3122341234	CC	1109238743	\N	\N	t	t	f	2026-11-05 11:33:20.806566	2026-11-05 11:33:20.806566	1234	mesero	jose@gmail.com	\N	\N
\.


--
-- Name: _migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public._migrations_id_seq', 29, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: content_type_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_type_content_type_id_seq', 5, true);


--
-- Name: groups_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.groups_group_id_seq', 4, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 32, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 18, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 15, true);


--
-- Name: password_reset_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_codes_id_seq', 5, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 21, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 14, true);


--
-- Name: restaurant_tables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.restaurant_tables_id_seq', 10, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 28, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: _migrations _migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: content_type content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_type
    ADD CONSTRAINT content_type_pkey PRIMARY KEY (content_type_id);


--
-- Name: group_permissions group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT group_permissions_pkey PRIMARY KEY (group_id, permission_id);


--
-- Name: groups groups_group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_group_name_key UNIQUE (group_name);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_codes password_reset_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_codes
    ADD CONSTRAINT password_reset_codes_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_permission_codename_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_permission_codename_key UNIQUE (permission_codename);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: restaurant_tables restaurant_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_tables
    ADD CONSTRAINT restaurant_tables_pkey PRIMARY KEY (id);


--
-- Name: restaurant_tables restaurant_tables_table_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_tables
    ADD CONSTRAINT restaurant_tables_table_number_key UNIQUE (table_number);


--
-- Name: suppliers suppliers_nit_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_nit_key UNIQUE (nit);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: content_type uq_content_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_type
    ADD CONSTRAINT uq_content_type UNIQUE (app_label, model);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (user_id, group_id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_email_key UNIQUE (user_email);


--
-- Name: idx_reset_codes_email_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reset_codes_email_code ON public.password_reset_codes USING btree (email, code);


--
-- Name: group_permissions fk_group_permissions_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT fk_group_permissions_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_permissions fk_group_permissions_permission; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT fk_group_permissions_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- Name: permissions fk_permissions_content_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT fk_permissions_content_type FOREIGN KEY (content_type_id) REFERENCES public.content_type(content_type_id);


--
-- Name: user_groups fk_user_groups_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT fk_user_groups_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE;


--
-- Name: user_groups fk_user_groups_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT fk_user_groups_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions fk_user_permissions_permission; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT fk_user_permissions_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- Name: user_permissions fk_user_permissions_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventory inventory_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: orders orders_waiter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_waiter_id_fkey FOREIGN KEY (waiter_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: password_reset_codes password_reset_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_codes
    ADD CONSTRAINT password_reset_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


