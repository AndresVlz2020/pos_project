# D'Piero • Sistema Punto de Venta & Facturación (Frontend)

Documentación técnica oficial del frontend para el sistema POS y gestión administrativa del restaurante **D'Piero • Restaurante & Parrilla**. Cumple con el requerimiento **RNF05** para la sustentación del proyecto formativo (Ficha 3172293).

---

## 1. Estructura de Carpetas

La arquitectura del proyecto sigue el patrón modular orientado a **features** (arquitectura por funcionalidades) y componentes compartidos desacoplados:

```text
frontend/
├── public/                     # Recursos estáticos servidos directamente
├── src/
│   ├── app/                    # Configuración central de la app (router, providers)
│   │   └── router.jsx          # Definición de rutas públicas y privadas
│   ├── assets/                 # Recursos gráficos (imágenes, logos, iconografía)
│   │   └── images/             # Logotipos claro/oscuro y fotografías de platillos
│   ├── features/               # Módulos funcionales del sistema
│   │   ├── auth/               # Autenticación (Login PIN/Admin, Registro, Recuperación)
│   │   │   ├── components/     # QuickAccessSelector, PinKeypad, AdminLoginForm, SessionTimeout
│   │   │   └── pages/          # Login, Register, ForgotPassword, ResetPassword
│   │   ├── users/              # Módulo de Usuarios y Gestión de Personal
│   │   │   ├── components/     # Modales de creación, edición y tablas
│   │   │   ├── data/           # Mock data y usuarios del sistema
│   │   │   ├── reports/        # Configuración y generación de reportes
│   │   │   └── schemas/        # Validaciones de formularios con Zod
│   │   ├── inventory/          # Módulo de Inventario e Insumos
│   │   ├── suppliers/          # Módulo de Proveedores
│   │   ├── products/           # Módulo de Menú y Platillos
│   │   ├── orders/             # Módulo de Comandas y Órdenes
│   │   └── home/               # Terminal POS de atención en salón
│   │       ├── components/     # Categorías, tarjetas de platillo, comandero, staff
│   │       └── page/           # HomePage (Punto de Venta activo)
│   ├── shared/                 # Componentes reutilizables transversales
│   │   ├── components/         # Button, Input, Select, DataTable, Card, Alert, etc.
│   │   ├── layouts/            # Navbar, MainLayout, AuthLayout, Footer
│   │   └── schemas/            # Esquemas comunes de validación
│   ├── styles/                 # Estilos globales y tokens de diseño
│   │   ├── tokens.css          # Variables CSS corporativas (colores HSL, tipografías, espaciados)
│   │   └── global.css          # Clases utilitarias, temas claro/oscuro y resets
│   ├── App.jsx                 # Componente raíz
│   ├── index.css               # Importaciones base
│   └── main.jsx                # Punto de entrada de la aplicación React
├── index.html                  # Plantilla HTML con precarga de tema claro/oscuro
├── package.json                # Dependencias y scripts de ejecución
└── vite.config.js              # Configuración del empaquetador Vite y alias '@'
```

---

## 2. Tecnologías Usadas

* **React 19**: Biblioteca base para construcción de interfaces basada en componentes declarativos y hooks.
* **Vite 6**: Entorno de desarrollo y empaquetado de alto rendimiento con Hot Module Replacement (HMR).
* **React Router DOM v7**: Enrutamiento declarativo para navegación SPA sin recargas de página.
* **Zod**: Validación de esquemas y reglas de negocio en formularios con tipado e inferencia segura.
* **Lucide React**: Biblioteca de iconografía vectorial ligera y accesible.
* **Tailwind CSS & Vanilla CSS Variables**: Sistema de diseño basado en Design Tokens (`tokens.css`) y modo oscuro/claro nativo (`global.css`).
* **XLSX & jsPDF / html2canvas**: Generación y exportación de reportes tabulares y ejecutivos en Excel y PDF.

---

## 3. Instalación

### Prerrequisitos
* Node.js v18.0.0 o superior
* Gestor de paquetes `npm` (incluido con Node.js)

### Pasos de instalación
1. Clonar el repositorio del proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd pos_project/frontend
   ```
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

---

## 4. Configuración

### Scripts disponibles
* **`npm run dev`**: Inicia el servidor de desarrollo local con Vite (por defecto en `http://localhost:5173`).
* **`npm run build`**: Compila y optimiza la aplicación para producción en la carpeta `dist/`.
* **`npm run preview`**: Levanta un servidor local para previsualizar el bundle de producción compilado.
* **`npm run lint`**: Ejecuta el análisis estático de código mediante ESLint.

### Configuración del Entorno y Estilos
* **Tema Visual**: La aplicación utiliza una guía de estilos y paleta corporativa estandarizada en tema claro (tema blanco), garantizando alto contraste y legibilidad con tokens semánticos definidos.
* **Alias de Importación**: Configurado en `vite.config.js` con `@` apuntando directamente a `src/`.

---

## 5. Consumo de API

El frontend está estructurado para consumir servicios desacoplados bajo la capa de servicios:

### Arquitectura de Consumo
* **Capa de Servicios**: Los servicios (`src/services/` y `src/features/<modulo>/services/`) centralizan las peticiones HTTP (`fetch` / `axios`).
* **Manejo de Autenticación**: Las peticiones protegidas adjuntan el token almacenado en `localStorage.getItem('auth_token')` a través del encabezado:
  ```http
  Authorization: Bearer <auth_token>
  ```
* **Manejo de Estados**: Cada petición gestiona estados de:
  1. `isLoading`: Indicadores de carga / spinners.
  2. `error`: Captura de excepciones con mensajes amigables mediante el componente `Alert`.
  3. `data`: Datos procesados y renderizados en componentes reutilizables como `DataTable`.
* **Cierre Automático**: `SessionTimeout.jsx` monitorea inactividad por 10 minutos para invalidar la sesión y limpiar las credenciales locales.
