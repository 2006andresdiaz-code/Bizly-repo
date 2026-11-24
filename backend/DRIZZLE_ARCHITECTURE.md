# Guía Técnica de Integración y Arquitectura: Drizzle ORM en Bizly

Este documento recopila la decisión técnica, la estructura de datos, la configuración y el flujo de trabajo implementado tras la integración de **Drizzle ORM** en el backend de **Bizly**.

---

## 1. Ficha Técnica del Proyecto

- **Entorno de Ejecución**: Node.js (`v22+`)
- **Sistema de Módulos**: JavaScript CommonJS (`require` / `module.exports`, `"type": "commonjs"`)
- **Framework Web**: Express.js (`v5.2.1`)
- **Motor de Base de Datos**: MySQL (`v8.0.x`)
- **Driver de Conexión**: `mysql2/promise` (`^3.24.4`)
- **Base de Datos Destino**: `bizly_drizzle` (Aislada y configurada mediante variables de entorno)
- **Librerías Drizzle**:
  - `drizzle-orm` (en `dependencies` para runtime)
  - `drizzle-kit` (en `devDependencies` para generación de migraciones y studio)

---

## 2. Justificación Técnica: ¿Por qué Drizzle ORM?

### Análisis del contexto del proyecto

Bizly es un sistema de gestión de punto de venta, inventario multitienda y facturación. Sus operaciones principales son altamente transaccionales:
- Creación de facturas de venta mientras se descuenta el stock de múltiples productos de forma atómica.
- Procesamiento de devoluciones con reintegro o baja de mercancía y registro de auditoría de movimientos.
- Agrupación de métricas de ventas y clientes con sumas dinámicas (`COUNT`, `SUM`, `COALESCE`).

Bajo estas características, la elección de Drizzle ORM responde a cuatro criterios clave:

1. **Rendimiento Máximo (Zero-Overhead):**
   Drizzle es un *query builder* fuertemente tipado que traduce directamente las expresiones a sentencias SQL nativas. No instancia modelos pesados en memoria ni realiza seguimiento de estado en segundo plano (a diferencia de ORMs Active Record tradicionales).
2. **Compatibilidad Nativa con CommonJS y el Pool Existente:**
   Drizzle se monta directamente sobre el pool de conexiones de `mysql2/promise` ya configurado en `src/config/db.js`, sin exigir transformadores de código TypeScript en producción ni adaptadores externos.
3. **Control Total del SQL y Predictibilidad:**
   En Drizzle, cada método (`select`, `leftJoin`, `where`, `groupBy`, `transaction`) mapea 1:1 con las cláusulas SQL estándar. Sabes con certeza la consulta exacta que llegará al motor de base de datos.
4. **Huella de Dependencias Mínima:**
   `drizzle-orm` es extremadamente ligero. No requiere motores binarios adicionales en C++ o Rust en tiempo de ejecución.

---

### Matriz Comparativa frente a Otras Alternativas

| Característica / Criterio | **Drizzle ORM** (Elegido) | **Prisma** | **Sequelize / TypeORM** | **SQL Puro (`mysql2.query`)** |
| :--- | :--- | :--- | :--- | :--- |
| **Arquitectura** | Query Builder tipado y modular | Generador de cliente basado en Schema DSL | ORM clásico (Active Record / Data Mapper) | Consultas en cadenas de texto plano |
| **Rendimiento / Latencia** | ⚡ **Ultra rápido** (casi idéntico a SQL puro) | ⚠️ Lento en cold-starts y subconsultas | ⚠️ Sobrecarga por hidratación de modelos | ⚡ Máximo rendimiento |
| **Motor en Runtime** | JavaScript puro sobre `mysql2` | Binario Rust compilado (`query-engine`) | Clases de JavaScript complejas | JavaScript puro |
| **Consumo de Memoria** | Muy bajo | Medio - Alto (motor Rust en segundo plano) | Alto por caché de modelos y proxies | Mínimo |
| **Seguridad de Tipado / Esquema** | Alta: Esquema declarativo reutilizable | Alta: Generado desde `.prisma` | Media/Alta pero con clases verbosas | ❌ Nula: Errores tipográficos en strings |
| **Transacciones Complejas** | `db.transaction(async (tx) => ...)` nativo | Limitado por timeouts del motor Prisma | Manejo manual o decorators propensos a fugas | Manual (`beginTransaction` / `commit`) |
| **Problema principal que evita** | **Evita dependencias pesadas y queries opacas** | **Evita binarios externos y latencias en despliegues** | **Evita modelos obsoletos y consultas N+1** | **Evita errores en tiempo de ejecución por SQL mal tipado** |

---

## 3. Estructura del Proyecto y Carpetas

A continuación se detalla el árbol de archivos del backend tras la integración:

```text
backend/
├── .env                          <-- Variables de entorno locales (apuntando a bizly_drizzle)
├── .env.example                  <-- Plantilla de variables de entorno documentada
├── drizzle.config.js             <-- Configuración principal de Drizzle Kit (dialecto, esquema, credenciales)
├── package.json                  <-- Dependencias (drizzle-orm), devDependencies (drizzle-kit) y scripts
├── package-lock.json
├── DRIZZLE_ARCHITECTURE.md       <-- Este documento técnico de referencia
├── drizzle/                      <-- Directorio de migraciones autogeneradas por Drizzle Kit
│   ├── 0000_clever_storm.sql     <-- DDL con las 12 tablas, tipos de columna y foreign keys
│   └── meta/                     <-- Snapshots internos de Drizzle Kit para control de versiones
├── BizlyBD_MySQL/                <-- Dumps SQL históricos de referencia
│   ├── bizly_db Version Sebas.sql
│   └── ultima_db Version Andrés.sql
└── src/
    ├── index.js                  <-- Punto de entrada de la aplicación Express y registro de rutas
    ├── config/
    │   └── db.js                 <-- Capa de compatibilidad que reexporta Drizzle y expone el pool
    ├── db/
    │   ├── index.js              <-- Instancia singleton de Drizzle ORM sobre el pool de conexiones MySQL
    │   └── schema.js             <-- Definición de las 12 tablas y sus relaciones (Drizzle MySQL Core)
    ├── controllers/              <-- Lógica de negocio migrada a consultas Drizzle ORM
    │   ├── auditoriaController.js
    │   ├── authController.js
    │   ├── clienteController.js
    │   ├── devolucionController.js
    │   ├── productoController.js
    │   └── ventasController.js
    ├── middlewares/
    │   └── authMiddleware.js     <-- Validación y decodificación de tokens JWT
    ├── routes/                   <-- Endpoints públicos de la API REST
    │   ├── auditoriaRoutes.js
    │   ├── authRoutes.js
    │   ├── clienteRoutes.js
    │   ├── devolucionRoutes.js
    │   ├── productoRoutes.js
    │   └── ventasRoutes.js
    └── tests/
        └── ventas.test.js        <-- Pruebas unitarias de ventas con Node test runner
```

### Rol de cada carpeta y archivo clave

- **`drizzle.config.js`**: Archivo de configuración que lee `dotenv` y exporta la configuración de `drizzle-kit`. Establece el dialecto `mysql`, la ruta al esquema declarativo (`./src/db/schema.js`), la carpeta de salida de migraciones (`./drizzle`) y las credenciales seguras parseando `DB_PORT` numéricamente.
- **`src/db/schema.js`**: Define las tablas y relaciones del sistema usando `drizzle-orm/mysql-core`. Es el único punto donde se modelan columnas, tipos de datos, valores por defecto, claves foráneas y relaciones bidireccionales (`relations`).
- **`src/db/index.js`**: Centraliza la conexión al pool de MySQL (`mysql2/promise`) apuntando a `bizly_drizzle` e inicializa la instancia de Drizzle (`drizzle(pool, { schema })`). Es importado por los controladores.
- **`src/config/db.js`**: Actúa como puente de compatibilidad retroactiva. Reexporta la instancia `db` de Drizzle y enlaza `db.query` y `db.getConnection` hacia el pool tradicional para que cualquier utilidad previa siga funcionando sin cambios.
- **`drizzle/`**: Almacena las migraciones SQL generadas de forma automática mediante `npm run db:generate`.
- **`src/routes/`**: Expone las rutas REST agrupadas por entidad (`/api/auth`, `/api/clientes`, `/api/productos`, `/api/ventas`, `/api/auditoria`, `/api/devoluciones`).
- **`src/middlewares/`**: Funciones interceptoras. `authMiddleware.js` se encarga de verificar el token JWT presente en la cabecera `Authorization: Bearer <token>`.
- **`src/controllers/`**: Maneja las solicitudes HTTP. Valida parámetros de entrada y ejecuta operaciones de lectura, escritura o transacciones a través de `db`.

---

## 4. Esquema Declarativo de Base de Datos (`src/db/schema.js`)

Se modelaron con total fidelidad las 12 tablas del sistema respetando tipos y restricciones:

1. **`roles`**: Catálogo de roles de usuario (`id`, `nombre`, `descripcion`).
2. **`usuarios`**: Cuentas de usuario (`id`, `id_rol`, `nombre`, `apellido`, `email`, `password_hash`, `telefono`, `activo`, `intentos_fallidos`, `bloqueado_hasta`, `token_recuperacion`, `token_expiracion`, `created_at`, `updated_at`, `tipo_negocio`).
3. **`categorias`**: Familias de artículos (`id`, `nombre`, `descripcion`, `activa`, `created_at`).
4. **`proveedores`**: Proveedores comerciales (`id`, `nombre`, `contacto`, `telefono`, `email`, `direccion`, `activo`, `created_at`, `updated_at`).
5. **`clientes`**: Clientes finales (`id`, `nombre`, `apellido`, `documento`, `email`, `telefono`, `direccion`, `activo`, `created_at`, `updated_at`).
6. **`productos`**: Catálogo de ítems (`id`, `id_categoria`, `id_proveedor`, `codigo`, `nombre`, `descripcion`, `precio_compra`, `precio_venta`, `stock_actual`, `stock_minimo`, `unidad_medida`, `numero_serie`, `tipo_control`, `ficha_tecnica`, `created_by`, `activo`, `created_at`).
7. **`ventas`**: Encabezado de ventas (`id`, `id_cliente`, `id_vendedor`, `numero_factura`, `estado`, `subtotal`, `descuento`, `impuesto`, `total`, `metodo_pago`, `observaciones`, `anulada_por`, `motivo_anulacion`, `created_at`, `updated_at`).
8. **`detalle_ventas`**: Renglones de factura (`id`, `id_venta`, `id_producto`, `cantidad`, `precio_unit`, `descuento`, `subtotal`).
9. **`devoluciones`**: Solicitudes de devolución (`id`, `id_venta`, `id_producto`, `id_usuario`, `cantidad`, `motivo`, `estado`, `monto_reembolsado`, `created_at`, `updated_at`).
10. **`lotes`**: Trazabilidad de vencimiento y lote (`id`, `id_producto`, `numero_lote`, `cantidad_inicial`, `stock_actual`, `fecha_fabricacion`, `fecha_vencimiento`, `activo`, `created_at`, `updated_at`).
11. **`movimientos_inventario`**: Kardex y auditoría física (`id`, `id_producto`, `id_usuario`, `tipo_movimiento`, `cantidad`, `stock_anterior`, `stock_nuevo`, `motivo`, `created_at`).
12. **`auditoria`**: Bitácora de operaciones del sistema (`id`, `id_usuario`, `accion`, `tabla`, `id_registro`, `datos_antes`, `datos_despues`, `ip_address`, `created_at`).

> [!NOTE]
> Se verificaron y respetaron los nombres exactos de columnas como `created_at` en `auditoria`, `monto_reembolsado` en `devoluciones` y `tipo_movimiento` en `movimientos_inventario`, evitando errores de columna desconocida (`Unknown column`).

---

## 5. Recorrido Completo de una Petición (`POST /api/ventas`)

Para entender cómo se orquesta la arquitectura, observemos el ciclo de vida de una venta:

```
[ FRONTEND / CLIENTE HTTP ]
            │
            ▼ 1. Envía solicitud POST /api/ventas
               Headers: Authorization: Bearer <jwt_token>
               Body JSON:
               {
                 "id_cliente": 2,
                 "id_usuario": 1,
                 "total": 54000,
                 "metodo_pago": "efectivo",
                 "carrito": [
                   { "id": 10, "cantidad": 3, "precio_venta": 18000 }
                 ]
               }
            │
            ▼ 2. src/index.js
               Enruta la petición al router correspondiente:
               app.use('/api/ventas', ventasRoutes);
            │
            ▼ 3. src/middlewares/authMiddleware.js
               El middleware intercepta la llamada, extrae el Bearer token,
               verifica la firma con process.env.JWT_SECRET y adjunta req.usuario.
               Ejecuta next() para transferir el control al controlador.
            │
            ▼ 4. src/controllers/ventasController.js -> exports.crearVenta
               - Valida campos obligatorios y que el carrito contenga al menos 1 ítem.
               - Genera el código de factura único: FAC-XXXXXXXX.
               - Inicia una transacción atómica gestionada por Drizzle:
                 const resultado = await db.transaction(async (tx) => { ... });
            │
            ▼ 5. Capa Drizzle ORM (src/db/index.js & src/db/schema.js)
               Dentro de la transacción aislada (tx):
               a) tx.insert(ventas).values(...)
                  -> Genera sentencia SQL: INSERT INTO ventas ... RETURNING id
               b) Itera sobre cada ítem del carrito:
                  -> tx.insert(detalleVentas).values(...)
                  -> tx.update(productos)
                       .set({ stockActual: sql`${productos.stockActual} - ${cantidad}` })
                       .where(eq(productos.id, idProducto))
               c) Si todo sale bien, Drizzle envía COMMIT al motor MySQL.
                  Si ocurre cualquier excepción, envía ROLLBACK automáticamente.
            │
            ▼ 6. Respuesta HTTP
               El controlador responde con código 201 Created:
               {
                 "mensaje": "Venta registrada con éxito",
                 "id_venta": 15,
                 "numero_factura": "FAC-82736451"
               }
```

---

## 6. Comandos y Scripts Disponibles

En `backend/package.json` se encuentran los siguientes scripts configurados:

```bash
# Iniciar servidor en modo producción
npm start

# Iniciar servidor en modo desarrollo con reinicio automático (Node --watch)
npm run dev

# Ejecutar pruebas unitarias de ventas
npm test

# Generar archivos de migración SQL basados en src/db/schema.js
npm run db:generate

# Aplicar las migraciones pendientes en la base de datos MySQL (bizly_drizzle)
npm run db:migrate

# Sincronizar directamente el esquema con la base de datos (desarrollo rápido)
npm run db:push

# Abrir el panel visual interactivo de Drizzle Studio en el navegador
npm run db:studio
```

---

## 7. Configuración de Variables de Entorno (`.env`)

El archivo `.env` en la raíz de `backend/` define las credenciales para la base de datos aislada:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bizly_drizzle
JWT_SECRET=secreto_super_seguro
```

Para entornos de prueba o nuevos colaboradores, se mantiene la plantilla equivalente en `.env.example`.
