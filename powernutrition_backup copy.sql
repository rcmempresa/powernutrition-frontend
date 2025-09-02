--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 15.10 (Homebrew)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: miranda
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO miranda;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.addresses (
    id integer NOT NULL,
    user_id integer,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state_province character varying(100) NOT NULL,
    postal_code character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    address_type character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.addresses OWNER TO miranda;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.addresses_id_seq OWNER TO miranda;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart_items OWNER TO miranda;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_items_id_seq OWNER TO miranda;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    user_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carts OWNER TO miranda;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carts_id_seq OWNER TO miranda;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


ALTER TABLE public.categories OWNER TO miranda;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO miranda;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    discount_percentage numeric(5,2) NOT NULL,
    athlete_name character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.coupons OWNER TO miranda;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coupons_id_seq OWNER TO miranda;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: flavors; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.flavors (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.flavors OWNER TO miranda;

--
-- Name: flavors_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.flavors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.flavors_id_seq OWNER TO miranda;

--
-- Name: flavors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.flavors_id_seq OWNED BY public.flavors.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO miranda;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO miranda;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    address_id integer,
    total_price numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pendente'::character varying,
    coupon_code character varying(50),
    payment_method character varying(50),
    easypay_id character varying(255),
    payment_details jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO miranda;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO miranda;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id integer,
    payment_method character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_status character varying(50) DEFAULT 'pendente'::character varying,
    payment_reference character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO miranda;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO miranda;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer,
    image_url character varying(255) NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO miranda;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_images_id_seq OWNER TO miranda;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    stock_quantity integer DEFAULT 0,
    sku character varying(50) NOT NULL,
    image_url character varying(255),
    category_id integer,
    brand character varying(100),
    weight_unit character varying(10),
    weight_value numeric(10,2),
    flavor_id integer,
    stock_ginasio integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    rating numeric(3,2) DEFAULT 0,
    reviewcount integer DEFAULT 0
);


ALTER TABLE public.products OWNER TO miranda;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO miranda;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO miranda;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO miranda;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.user_favorites (
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_favorites OWNER TO miranda;

--
-- Name: users; Type: TABLE; Schema: public; Owner: miranda
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    phone_number character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state_province character varying(100),
    postal_code character varying(20),
    country character varying(100),
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO miranda;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: miranda
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO miranda;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miranda
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: flavors id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.flavors ALTER COLUMN id SET DEFAULT nextval('public.flavors_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.addresses (id, user_id, address_line1, address_line2, city, state_province, postal_code, country, address_type, created_at, updated_at) FROM stdin;
1	2	Estrada das Eiras nº34		Santana	Madeira	9230-118	Portugal	residencial	2025-08-29 18:27:48.695163+01	2025-08-29 18:27:48.695163+01
2	3	Estrada das Eiras nº34	34	Santana	Madeira	9230-118	Portugal	residencial	2025-08-31 23:29:22.672798+01	2025-08-31 23:29:22.672798+01
3	2	Avenida BEFIT, 456	Escritório 10	Santa Cruz	Madeira	9020-123	Portugal	befit	2025-08-31 23:38:22.450238+01	2025-08-31 23:38:22.450238+01
4	2	Caminho do Poço Barral Nº28	Caminho do Poço Barral Nº28	Funchal	Madeira	9020-222	Portugal	store	2025-08-31 23:43:14.68845+01	2025-08-31 23:43:14.68845+01
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.cart_items (id, cart_id, product_id, quantity, price, created_at, updated_at) FROM stdin;
18	10	5	4	45.99	2025-09-01 00:08:02.696533+01	2025-09-01 00:14:54.425748+01
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.carts (id, user_id, created_at, updated_at) FROM stdin;
10	2	2025-08-29 18:00:58.383003+01	2025-08-29 18:00:58.383003+01
11	3	2025-08-31 15:24:39.96976+01	2025-08-31 15:24:39.96976+01
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.categories (id, name, created_at, updated_at, description) FROM stdin;
1	Proteínas	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
2	Creatinas	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
3	Articulações	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
4	Aminoácidos	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
5	Endurance	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
6	Gainers e carbs	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
7	Hormonal	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
8	Lifestyle	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
9	Natural e essencial	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
10	Acessórios	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
11	Pré-treinos	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
12	Saúde e bem-estar	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
13	Snacks e barras	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
14	Termogénicos	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
15	Vitaminas e minerais	2025-08-29 11:22:19.654068+01	2025-08-29 11:22:19.654068+01	\N
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.coupons (id, code, discount_percentage, athlete_name, is_active, created_at, updated_at) FROM stdin;
1	JOAO10	10.00	Miranda	t	2025-09-01 00:04:53.707413+01	2025-09-01 00:04:53.707413+01
\.


--
-- Data for Name: flavors; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.flavors (id, name, created_at, updated_at) FROM stdin;
1	Açaí	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
2	Açaí com Banana	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
3	Algodão Doce	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
4	Amendoim	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
5	Amendoim e Caramelo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
6	Ananás (Abacaxi)	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
7	Arroz Doce	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
8	Bagas (Frutos Silvestres)	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
9	Banana	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
10	Banana e Caramelo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
11	Banana e Morango	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
12	Baunilha	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
13	Baunilha e Caramelo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
14	Baunilha do Caribe	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
15	Baunilha e Café	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
16	Baunilha e Coco	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
17	Bebida Energética	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
18	Bolacha	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
19	Bolacha Caramelizada	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
20	Bolacha e Nata	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
21	Bolachas com Creme	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
22	Bolo de Cenoura	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
23	Bombom de Chocolate	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
24	Bombom de Chocolate e Avelã	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
25	Brownie	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
26	Café	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
27	Café e Caramelo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
28	Café Gelado	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
29	Canela	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
30	Cappuccino	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
31	Caramelo Salgado	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
32	Cereja	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
33	Cereais com Leite	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
34	Chá Chai com Leite	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
35	Cheesecake de Limão	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
36	Chocolate	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
37	Chocolate e Avelã	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
38	Chocolate e Banana	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
39	Chocolate e Caramelo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
40	Chocolate Branco	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
41	Chocolate Branco e Amendoim	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
42	Chocolate Branco e Banana	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
43	Chocolate Branco e Limão	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
44	Chocolate Branco e Morango	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
45	Chocolate e Coco	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
46	Chocolate e Laranja	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
47	Chocolate e Menta	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
48	Coco	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
49	Cola	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
50	Creme	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
51	Creme de Baunilha	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
52	Doce de Leite	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
53	Framboesa	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
54	Frutas Vermelhas	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
55	Gelado de Baunilha	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
56	Gelado de Baunilha e Framboesa	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
57	Iogurte	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
58	Iogurte e Ananás	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
59	Iogurte e Coco	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
60	Iogurte e Limão	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
61	Iogurte e Pêssego	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
62	Limão	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
63	Maçã	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
64	Maçã e Canela	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
65	Manga	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
66	Manga e Ananás	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
67	Manga e Pêssego	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
68	Matcha	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
69	Matcha e Leite	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
70	Melancia	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
71	Mojito	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
72	Morango	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
73	Morango e Coco	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
74	Morango e Nata	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
75	Morango e Tarte de Queijo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
76	Pêssego	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
77	Piña Colada	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
78	Pistacho	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
79	Smoothie de Bagas	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
80	Snickerdoodle	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
81	Tarte de Maçã	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
82	Tarte de Queijo	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
83	Torta de Limão	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
84	Torrão	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
85	Tropical	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
86	Xarope de ácer	2025-08-29 13:16:01.924664+01	2025-08-29 13:16:01.924664+01
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
1	1	4	1	40.00
3	2	4	1	40.00
5	4	4	1	40.00
7	5	4	1	40.00
2	1	\N	1	49.99
4	3	\N	1	49.99
6	5	\N	1	49.99
8	6	\N	4	49.99
9	7	4	1	40.00
10	7	5	1	45.99
11	8	5	1	45.99
12	9	5	1	45.99
13	10	5	2	45.99
14	11	5	1	45.99
15	12	5	1	45.99
16	13	5	1	45.99
17	14	5	1	45.99
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.orders (id, user_id, address_id, total_price, status, coupon_code, payment_method, easypay_id, payment_details, created_at, updated_at) FROM stdin;
1	2	1	89.99	pendente	\N	multibanco	4d5066ff-f921-4e68-afb2-110f526cf582	\N	2025-08-29 18:28:10.75216+01	2025-08-29 18:28:10.75216+01
2	2	1	40.00	pendente	\N	multibanco	e81f4d9f-c614-462b-b167-18e07042461b	\N	2025-08-29 18:32:00.361023+01	2025-08-29 18:32:00.361023+01
5	2	1	89.99	pago	\N	multibanco	bacb537a-bcaf-479d-8305-0e98840ddbb1	\N	2025-08-31 15:00:55.305251+01	2025-08-31 15:00:55.305251+01
3	2	1	49.99	pago	\N	multibanco	9ecc3b74-c138-4fbe-a37a-e2e1e20a4309	\N	2025-08-31 14:41:33.72985+01	2025-08-31 14:41:33.72985+01
6	2	1	199.96	pago	\N	multibanco	bcbc9dea-3d38-4a19-b28f-628aebaeda7a	\N	2025-08-31 15:02:29.343646+01	2025-08-31 15:02:29.343646+01
4	2	1	40.00	pago	\N	multibanco	51b88b3f-cedc-45dc-9e1a-0360c6a75972	\N	2025-08-31 14:47:46.815009+01	2025-08-31 14:47:46.815009+01
7	3	2	85.99	pago	\N	multibanco	57ce805e-5d2d-4850-8a44-48ac991d30d2	\N	2025-08-31 23:29:23.250279+01	2025-08-31 23:29:23.250279+01
8	2	1	45.99	pendente	\N	multibanco	4948b881-9931-477c-9ef0-c32b188a815b	\N	2025-08-31 23:32:04.657703+01	2025-08-31 23:32:04.657703+01
9	2	3	45.99	pago	\N	multibanco	e899d54b-e02b-41a3-97b0-3713db40b338	\N	2025-08-31 23:38:23.068689+01	2025-08-31 23:38:23.068689+01
10	2	4	91.98	pago	\N	multibanco	5001b23b-5f46-46df-88c1-07c9bd7ff63b	\N	2025-08-31 23:44:38.702303+01	2025-08-31 23:44:38.702303+01
11	2	4	45.99	pago	\N	multibanco	63ca0192-0d6d-45c5-ba37-e83428f1721f	\N	2025-08-31 23:54:42.498186+01	2025-08-31 23:54:42.498186+01
12	2	1	45.99	pendente	\N	multibanco	9b3d8a4d-1cc1-4ec0-8a5e-6af3385ccfed	\N	2025-09-01 00:04:09.357717+01	2025-09-01 00:04:09.357717+01
13	2	1	45.99	pendente	\N	multibanco	773d5b2f-7bf2-43e4-8a01-bd5af6788b02	\N	2025-09-01 00:05:17.152897+01	2025-09-01 00:05:17.152897+01
14	2	1	41.39	pendente	JOAO10	multibanco	fa23e734-25bf-4d18-b6c7-c6150fe9fceb	\N	2025-09-01 00:06:36.066589+01	2025-09-01 00:06:36.066589+01
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.payments (id, order_id, payment_method, amount, payment_status, payment_reference, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.product_images (id, product_id, image_url, is_primary, created_at, updated_at) FROM stdin;
13	4	http://localhost:3000/uploads/image-1756485191744-596423509.jpg	f	2025-08-29 17:33:11.757017+01	2025-08-29 17:33:11.757017+01
14	4	http://localhost:3000/uploads/image-1756485201657-333964055.jpg	f	2025-08-29 17:33:21.680501+01	2025-08-29 17:33:21.680501+01
15	4	http://localhost:3000/uploads/image-1756485213338-16192530.jpg	f	2025-08-29 17:33:33.364094+01	2025-08-29 17:33:33.364094+01
16	5	http://localhost:3000/uploads/image-1756679001592-776325018.jpeg	f	2025-08-31 23:23:21.603843+01	2025-08-31 23:23:21.603843+01
17	5	http://localhost:3000/uploads/image-1756679011702-975867719.jpeg	f	2025-08-31 23:23:31.710331+01	2025-08-31 23:23:31.710331+01
18	5	http://localhost:3000/uploads/image-1756679020532-101514477.jpeg	f	2025-08-31 23:23:40.538016+01	2025-08-31 23:23:40.538016+01
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.products (id, name, description, price, original_price, stock_quantity, sku, image_url, category_id, brand, weight_unit, weight_value, flavor_id, stock_ginasio, is_active, created_at, updated_at, rating, reviewcount) FROM stdin;
4	Creatina em Pó - 90 scoops (317g)	Creatina em Pó da Optimum Nutrition: Aumenta a Força e a Performance\nA Creatina em Pó da Optimum Nutrition (ON) é um dos suplementos mais estudados e eficazes para atletas de todos os níveis. A sua fórmula pura e micronizada garante que está a consumir creatina da mais alta qualidade disponível.\n\nA creatina ajuda a aumentar a produção de ATP, a principal fonte de energia das células musculares, permitindo-lhe treinar com mais intensidade e por mais tempo. É a escolha ideal para quem procura aumentar a força, o poder e o desempenho em exercícios de alta intensidade, como levantamento de pesos e sprints.\n\nA tecnologia de micronização usada neste produto significa que o pó foi processado para se tornar extremamente fino. Isso resulta numa dissolubilidade superior, eliminando a textura arenosa de pós de creatina de qualidade inferior. A dissolução completa e a ausência de sabor permitem que misture facilmente com água, sumos, batidos de proteína ou qualquer outra bebida sem alterar o seu gosto.\n\nPrincipais Benefícios:\n\nAumento da Força: Permite treinos mais pesados e eficazes.\n\nMelhora da Performance: Apoia o desempenho em atividades de alta intensidade.\n\nAbsorção Rápida: A creatina micronizada é rapidamente absorvida pelo corpo para uma ação imediata.\n\nFácil de Misturar: Dissolve-se completamente, evitando grumos e facilitando o consumo diário.\n\nVersatilidade: Sem sabor e sem cheiro, é perfeita para adicionar a qualquer bebida sem alterar o sabor.	40.00	45.00	0	CREATINA-ON-UNFLAVOUR	http://localhost:3000/uploads/image-1756485176848-274332942.jpg	2	Optimun Nutrition	g	317.00	\N	0	t	2025-08-29 17:32:56.863928+01	2025-08-29 18:26:37.489775+01	0.00	0
5	Proteína Whey Isolada - Chocolate 1,8kg	Proteína Isolada de Chocolate Applied Nutrition - 1.8kg\nAlcança os teus objetivos de forma mais rápida e saborosa com a Proteína Isolada de Chocolate Applied Nutrition. Criada para atletas e entusiastas de fitness, esta proteína de alta qualidade fornece o combustível puro que os teus músculos precisam para crescer, recuperar e fortalecer.\n\nA nossa fórmula de isolado de whey passa por um processo de filtragem rigoroso para remover quase todos os hidratos de carbono e gorduras, resultando numa proteína com mais de 85% de pureza. Isto significa que recebes mais do que realmente importa em cada dose.\n\nCada scoop é embalado com aminoácidos essenciais (BCAAs e Glutamina) que ajudam na recuperação muscular pós-treino e na redução da dor. Além disso, a sua absorção ultra-rápida garante que os nutrientes cheguem aos teus músculos exatamente quando eles mais precisam.\n\nPorquê escolher a nossa Proteína Isolada?\n\nElevada Pureza: Mais de 85% de proteína isolada por dose.\n\nBaixo em Calorias: Sem açúcares ou gorduras adicionadas.\n\nRecuperação Otimizada: Rica em BCAAs para a reparação muscular.\n\nSabor Inigualável: O nosso delicioso sabor a chocolate torna cada batido uma verdadeira recompensa.\n\nVersatilidade: Perfeita para misturar com água, leite, ou adicionar às tuas receitas favoritas.\n\nSeja para ganhar massa muscular, perder peso, ou simplesmente garantir a ingestão proteica diária, a Proteína Isolada de Chocolate Applied Nutrition é a tua aliada perfeita. A embalagem de 1.8kg garante um stock duradouro para manter o teu progresso constante.	45.99	55.94	2	APPLIEDNUTRITION-WHEY-CHOC	http://localhost:3000/uploads/image-1756678988778-992205363.jpeg	1	APPLIED NUTRITION	kg	1.80	36	5	t	2025-08-31 23:23:08.796626+01	2025-08-31 23:23:08.796626+01	0.00	0
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.reviews (id, product_id, user_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: user_favorites; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.user_favorites (user_id, product_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: miranda
--

COPY public.users (id, username, email, password_hash, first_name, last_name, phone_number, address_line1, address_line2, city, state_province, postal_code, country, is_admin, created_at, updated_at) FROM stdin;
2	beatriz_robinson	Anabplrobinson@gmail.com	$2b$10$e.0tkQ8rGK4p9ODVBxgoVeJFQD12x6GiPqEVlCKj6L7..96GoOfc6	Beatriz	Robinson	932475800	Estrada das Eiras nº34	34	Santana	Funchal	9230-118	Portugal	t	2025-08-29 18:00:21.170415+01	2025-08-31 14:37:38.32366+01
3	rcmiranda00	rcmiranda.empresa@gmail.com	$2b$10$G3KA1VYkDRtekMrN3klr7uoHvqAj.mMZWdcl99AZZPZN41q2bZTL6	Rodrigo	Miranda	966545381	Estrada das Eiras nº34	34	Santana	Funchal	9230-118	Portugal	t	2025-08-31 15:24:20.434067+01	2025-08-31 15:24:20.434067+01
\.


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.addresses_id_seq', 4, true);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 18, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.carts_id_seq', 11, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.categories_id_seq', 15, true);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.coupons_id_seq', 1, true);


--
-- Name: flavors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.flavors_id_seq', 86, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.order_items_id_seq', 17, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.orders_id_seq', 14, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.product_images_id_seq', 18, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.products_id_seq', 5, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miranda
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: flavors flavors_name_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.flavors
    ADD CONSTRAINT flavors_name_key UNIQUE (name);


--
-- Name: flavors flavors_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.flavors
    ADD CONSTRAINT flavors_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: user_favorites pk_user_favorites; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT pk_user_favorites PRIMARY KEY (user_id, product_id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_name_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews fk_product; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews fk_user; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: orders orders_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_flavor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_flavor_id_fkey FOREIGN KEY (flavor_id) REFERENCES public.flavors(id);


--
-- Name: user_favorites user_favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miranda
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: miranda
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

