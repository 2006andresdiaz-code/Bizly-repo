# 🚀 Bizly - Sistema POS y Gestión de Inventario

Bizly es una aplicación web Full-Stack diseñada para la gestión integral de pequeños y medianos negocios (Pymes). Permite administrar el punto de venta (POS), el control de inventario en tiempo real, el registro de clientes, auditorías y reportes de facturación con una interfaz moderna y adaptable.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
* **React** (con Vite para un desarrollo rápido)
* **React Router DOM** (para el enrutamiento protegido y navegación)
* **Context API** (para la gestión de estados globales, como autenticación y configuración de la empresa)
* **CSS Modules / Estilos personalizados**

### Backend
* **Node.js** con **Express** (API RESTful)
* **MySQL** (Base de datos relacional)
* **JSON Web Tokens (JWT)** (Autenticación y seguridad por roles)
* **Bcrypt** (Encriptación de contraseñas)

---

## 📂 Estructura del Proyecto

```text
Bizly/
├── backend/
│   ├── src/
│   │   ├── config/       # Conexión a la base de datos MySQL
│   │   ├── controllers/  # Lógica de negocio (ventas, productos, usuarios, etc.)
│   │   ├── middlewares/  # Control de autenticación y seguridad JWT
│   │   ├── routes/       # Definición de endpoints de la API
│   │   └── index.js      # Servidor principal de Express
│   └── .env              # Variables de entorno del backend
│
└── frontend/
    ├── src/
    │   ├── assets/       # Imágenes y recursos gráficos (Logos, etc.)
    │   ├── components/   # Vistas principales (POS, Dashboard, Inventario, Reportes, etc.)
    │   ├── context/      # Proveedores de estado global (AuthContext, EmpresaContext)
    │   ├── App.jsx       # Rutas y protección de navegación
    │   └── main.jsx      # Punto de entrada de React
    └── package.json




Características Principales
💳 Punto de Venta (POS): Carrito de compras interactivo con validación de stock en tiempo real, selección de métodos de pago (Efectivo, Tarjeta, Transferencia) y generación automática de facturas imprimibles.

📦 Gestión de Inventario: Control de stock, actualización de productos y alertas visuales.

📊 Dashboard & Reportes: Métricas de ingresos en tiempo real, historial detallado de facturación con números de factura únicos (FAC-XXXXXXXX) y filtrado de transacciones.

⚙️ Configuración Dinámica: Sincronización en tiempo real del nombre de la empresa y los parámetros del negocio a través de contextos globales y almacenamiento local.

🔒 Seguridad y Auditoría: Autenticación basada en tokens JWT y rutas protegidas por roles (Administrador / Vendedor).
⚙️ Configuración y Ejecución Local
Sigue estos pasos para levantar el proyecto en tu entorno local:




1. Clonar el repositorio
->git clone <url-de-tu-repositorio>
cd "Bizly_Sebastian-main"

->cd backend
npm install

Crea un archivo .env en la carpeta backend/ con tus credenciales de MySQL y puerto:

Fragmento de código
PORT=5000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=bizly_db
JWT_SECRET=tu_clave_secreta

Inicia el servidor backend:

Bash
npm run dev
