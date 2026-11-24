const { sql, relations } = require('drizzle-orm');
const {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  tinyint,
  datetime,
  date,
  json,
  mysqlEnum,
} = require('drizzle-orm/mysql-core');

// ==========================================
// 1. ROLES
// ==========================================
const roles = mysqlTable('roles', {
  id: int('id').autoincrement().primaryKey(),
  nombre: varchar('nombre', { length: 50 }).notNull(),
  descripcion: varchar('descripcion', { length: 200 }),
});

const rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios),
}));

// ==========================================
// 2. USUARIOS
// ==========================================
const usuarios = mysqlTable('usuarios', {
  id: int('id').autoincrement().primaryKey(),
  idRol: int('id_rol').notNull().references(() => roles.id),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  telefono: varchar('telefono', { length: 20 }),
  activo: tinyint('activo').notNull().default(1),
  intentosFallidos: int('intentos_fallidos').notNull().default(0),
  bloqueadoHasta: datetime('bloqueado_hasta', { mode: 'string' }),
  tokenRecuperacion: varchar('token_recuperacion', { length: 255 }),
  tokenExpiracion: datetime('token_expiracion', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'string' }),
  tipoNegocio: varchar('tipo_negocio', { length: 50 }).default('general'),
});

const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  rol: one(roles, {
    fields: [usuarios.idRol],
    references: [roles.id],
  }),
  ventas: many(ventas),
  devoluciones: many(devoluciones),
  movimientosInventario: many(movimientosInventario),
  auditorias: many(auditoria),
}));

// ==========================================
// 3. CATEGORIAS
// ==========================================
const categorias = mysqlTable('categorias', {
  id: int('id').autoincrement().primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  activa: tinyint('activa').notNull().default(1),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

const categoriasRelations = relations(categorias, ({ many }) => ({
  productos: many(productos),
}));

// ==========================================
// 4. PROVEEDORES
// ==========================================
const proveedores = mysqlTable('proveedores', {
  id: int('id').autoincrement().primaryKey(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  contacto: varchar('contacto', { length: 100 }),
  telefono: varchar('telefono', { length: 20 }),
  email: varchar('email', { length: 150 }),
  direccion: varchar('direccion', { length: 255 }),
  activo: tinyint('activo').notNull().default(1),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'string' }),
});

const proveedoresRelations = relations(proveedores, ({ many }) => ({
  productos: many(productos),
}));

// ==========================================
// 5. CLIENTES
// ==========================================
const clientes = mysqlTable('clientes', {
  id: int('id').autoincrement().primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  documento: varchar('documento', { length: 20 }),
  email: varchar('email', { length: 150 }),
  telefono: varchar('telefono', { length: 20 }),
  direccion: varchar('direccion', { length: 255 }),
  activo: tinyint('activo').notNull().default(1),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'string' }),
});

const clientesRelations = relations(clientes, ({ many }) => ({
  ventas: many(ventas),
}));

// ==========================================
// 6. PRODUCTOS
// ==========================================
const productos = mysqlTable('productos', {
  id: int('id').autoincrement().primaryKey(),
  idCategoria: int('id_categoria').references(() => categorias.id),
  idProveedor: int('id_proveedor').references(() => proveedores.id),
  codigo: varchar('codigo', { length: 50 }).notNull(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  descripcion: text('descripcion'),
  precioCompra: decimal('precio_compra', { precision: 12, scale: 2 }).default('0.00'),
  precioVenta: decimal('precio_venta', { precision: 12, scale: 2 }).notNull(),
  stockActual: int('stock_actual').notNull().default(0),
  stockMinimo: int('stock_minimo').default(0),
  unidadMedida: varchar('unidad_medida', { length: 50 }),
  numeroSerie: varchar('numero_serie', { length: 100 }),
  tipoControl: varchar('tipo_control', { length: 50 }),
  fichaTecnica: text('ficha_tecnica'),
  createdBy: int('created_by').references(() => usuarios.id),
  activo: tinyint('activo').default(1),
  createdAt: datetime('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

const productosRelations = relations(productos, ({ one, many }) => ({
  categoria: one(categorias, {
    fields: [productos.idCategoria],
    references: [categorias.id],
  }),
  proveedor: one(proveedores, {
    fields: [productos.idProveedor],
    references: [proveedores.id],
  }),
  creador: one(usuarios, {
    fields: [productos.createdBy],
    references: [usuarios.id],
  }),
  detallesVenta: many(detalleVentas),
  devoluciones: many(devoluciones),
  lotes: many(lotes),
  movimientosInventario: many(movimientosInventario),
}));

// ==========================================
// 7. VENTAS
// ==========================================
const ventas = mysqlTable('ventas', {
  id: int('id').autoincrement().primaryKey(),
  idCliente: int('id_cliente').references(() => clientes.id),
  idVendedor: int('id_vendedor').notNull().references(() => usuarios.id),
  numeroFactura: varchar('numero_factura', { length: 30 }).notNull(),
  estado: mysqlEnum('estado', ['pendiente', 'completada', 'anulada']).notNull().default('pendiente'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  descuento: decimal('descuento', { precision: 12, scale: 2 }).notNull().default('0.00'),
  impuesto: decimal('impuesto', { precision: 12, scale: 2 }).notNull().default('0.00'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  metodoPago: mysqlEnum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata']).notNull().default('efectivo'),
  observaciones: text('observaciones'),
  anuladaPor: int('anulada_por').references(() => usuarios.id),
  motivoAnulacion: varchar('motivo_anulacion', { length: 255 }),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'string' }),
});

const ventasRelations = relations(ventas, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [ventas.idCliente],
    references: [clientes.id],
  }),
  vendedor: one(usuarios, {
    fields: [ventas.idVendedor],
    references: [usuarios.id],
  }),
  anulador: one(usuarios, {
    fields: [ventas.anuladaPor],
    references: [usuarios.id],
  }),
  detalles: many(detalleVentas),
  devoluciones: many(devoluciones),
}));

// ==========================================
// 8. DETALLE_VENTAS
// ==========================================
const detalleVentas = mysqlTable('detalle_ventas', {
  id: int('id').autoincrement().primaryKey(),
  idVenta: int('id_venta').notNull().references(() => ventas.id),
  idProducto: int('id_producto').notNull().references(() => productos.id),
  cantidad: int('cantidad').notNull(),
  precioUnit: decimal('precio_unit', { precision: 12, scale: 2 }).notNull(),
  descuento: decimal('descuento', { precision: 12, scale: 2 }).notNull().default('0.00'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
});

const detalleVentasRelations = relations(detalleVentas, ({ one }) => ({
  venta: one(ventas, {
    fields: [detalleVentas.idVenta],
    references: [ventas.id],
  }),
  producto: one(productos, {
    fields: [detalleVentas.idProducto],
    references: [productos.id],
  }),
}));

// ==========================================
// 9. DEVOLUCIONES
// ==========================================
const devoluciones = mysqlTable('devoluciones', {
  id: int('id').autoincrement().primaryKey(),
  idVenta: int('id_venta').notNull().references(() => ventas.id),
  idProducto: int('id_producto').notNull().references(() => productos.id),
  idUsuario: int('id_usuario').notNull().references(() => usuarios.id),
  cantidad: int('cantidad').notNull(),
  motivo: varchar('motivo', { length: 255 }).notNull(),
  estado: mysqlEnum('estado', ['pendiente', 'aprobada', 'rechazada']).default('aprobada'),
  montoReembolsado: decimal('monto_reembolsado', { precision: 12, scale: 2 }).default('0.00'),
  createdAt: datetime('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'string' }),
});

const devolucionesRelations = relations(devoluciones, ({ one }) => ({
  venta: one(ventas, {
    fields: [devoluciones.idVenta],
    references: [ventas.id],
  }),
  producto: one(productos, {
    fields: [devoluciones.idProducto],
    references: [productos.id],
  }),
  usuario: one(usuarios, {
    fields: [devoluciones.idUsuario],
    references: [usuarios.id],
  }),
}));

// ==========================================
// 10. LOTES
// ==========================================
const lotes = mysqlTable('lotes', {
  id: int('id').autoincrement().primaryKey(),
  idProducto: int('id_producto').notNull().references(() => productos.id),
  numeroLote: varchar('numero_lote', { length: 50 }).notNull(),
  cantidadInicial: int('cantidad_inicial').notNull(),
  stockActual: int('stock_actual').notNull().default(0),
  fechaFabricacion: date('fecha_fabricacion', { mode: 'string' }),
  fechaVencimiento: date('fecha_vencimiento', { mode: 'string' }).notNull(),
  activo: tinyint('activo').notNull().default(1),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'string' }),
});

const lotesRelations = relations(lotes, ({ one }) => ({
  producto: one(productos, {
    fields: [lotes.idProducto],
    references: [productos.id],
  }),
}));

// ==========================================
// 11. MOVIMIENTOS_INVENTARIO
// ==========================================
const movimientosInventario = mysqlTable('movimientos_inventario', {
  id: int('id').autoincrement().primaryKey(),
  idProducto: int('id_producto').notNull().references(() => productos.id),
  idUsuario: int('id_usuario').references(() => usuarios.id),
  tipoMovimiento: varchar('tipo_movimiento', { length: 50 }).notNull(),
  cantidad: int('cantidad').notNull(),
  stockAnterior: int('stock_anterior').notNull(),
  stockNuevo: int('stock_nuevo').notNull(),
  motivo: varchar('motivo', { length: 255 }),
  createdAt: datetime('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

const movimientosInventarioRelations = relations(movimientosInventario, ({ one }) => ({
  producto: one(productos, {
    fields: [movimientosInventario.idProducto],
    references: [productos.id],
  }),
  usuario: one(usuarios, {
    fields: [movimientosInventario.idUsuario],
    references: [usuarios.id],
  }),
}));

// ==========================================
// 12. AUDITORIA
// ==========================================
const auditoria = mysqlTable('auditoria', {
  id: int('id').autoincrement().primaryKey(),
  idUsuario: int('id_usuario').references(() => usuarios.id),
  accion: varchar('accion', { length: 100 }).notNull(),
  tabla: varchar('tabla', { length: 100 }).notNull(),
  idRegistro: int('id_registro'),
  datosAntes: json('datos_antes'),
  datosDespues: json('datos_despues'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

const auditoriaRelations = relations(auditoria, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [auditoria.idUsuario],
    references: [usuarios.id],
  }),
}));

module.exports = {
  roles,
  rolesRelations,
  usuarios,
  usuariosRelations,
  categorias,
  categoriasRelations,
  proveedores,
  proveedoresRelations,
  clientes,
  clientesRelations,
  productos,
  productosRelations,
  ventas,
  ventasRelations,
  detalleVentas,
  detalleVentasRelations,
  devoluciones,
  devolucionesRelations,
  lotes,
  lotesRelations,
  movimientosInventario,
  movimientosInventarioRelations,
  auditoria,
  auditoriaRelations,
};
