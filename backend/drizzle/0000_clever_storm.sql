CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	`descripcion` varchar(200),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_rol` int NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`telefono` varchar(20),
	`activo` tinyint NOT NULL DEFAULT 1,
	`intentos_fallidos` int NOT NULL DEFAULT 0,
	`bloqueado_hasta` datetime,
	`token_recuperacion` varchar(255),
	`token_expiracion` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime,
	`tipo_negocio` varchar(50) DEFAULT 'general',
	CONSTRAINT `usuarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`descripcion` varchar(255),
	`activa` tinyint NOT NULL DEFAULT 1,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proveedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`contacto` varchar(100),
	`telefono` varchar(20),
	`email` varchar(150),
	`direccion` varchar(255),
	`activo` tinyint NOT NULL DEFAULT 1,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime,
	CONSTRAINT `proveedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido` varchar(100) NOT NULL,
	`documento` varchar(20),
	`email` varchar(150),
	`telefono` varchar(20),
	`direccion` varchar(255),
	`activo` tinyint NOT NULL DEFAULT 1,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_categoria` int,
	`id_proveedor` int,
	`codigo` varchar(50) NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`descripcion` text,
	`precio_compra` decimal(12,2) DEFAULT '0.00',
	`precio_venta` decimal(12,2) NOT NULL,
	`stock_actual` int NOT NULL DEFAULT 0,
	`stock_minimo` int DEFAULT 0,
	`unidad_medida` varchar(50),
	`numero_serie` varchar(100),
	`tipo_control` varchar(50),
	`ficha_tecnica` text,
	`created_by` int,
	`activo` tinyint DEFAULT 1,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `productos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ventas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_cliente` int,
	`id_vendedor` int NOT NULL,
	`numero_factura` varchar(30) NOT NULL,
	`estado` enum('pendiente','completada','anulada') NOT NULL DEFAULT 'pendiente',
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	`descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
	`impuesto` decimal(12,2) NOT NULL DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`metodo_pago` enum('efectivo','tarjeta','transferencia','nequi','daviplata') NOT NULL DEFAULT 'efectivo',
	`observaciones` text,
	`anulada_por` int,
	`motivo_anulacion` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime,
	CONSTRAINT `ventas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detalle_ventas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_venta` int NOT NULL,
	`id_producto` int NOT NULL,
	`cantidad` int NOT NULL,
	`precio_unit` decimal(12,2) NOT NULL,
	`descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
	`subtotal` decimal(12,2) NOT NULL,
	CONSTRAINT `detalle_ventas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devoluciones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_venta` int NOT NULL,
	`id_producto` int NOT NULL,
	`id_usuario` int NOT NULL,
	`cantidad` int NOT NULL,
	`motivo` varchar(255) NOT NULL,
	`estado` enum('pendiente','aprobada','rechazada') DEFAULT 'aprobada',
	`monto_reembolsado` decimal(12,2) DEFAULT '0.00',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime,
	CONSTRAINT `devoluciones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_producto` int NOT NULL,
	`numero_lote` varchar(50) NOT NULL,
	`cantidad_inicial` int NOT NULL,
	`stock_actual` int NOT NULL DEFAULT 0,
	`fecha_fabricacion` date,
	`fecha_vencimiento` date NOT NULL,
	`activo` tinyint NOT NULL DEFAULT 1,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime,
	CONSTRAINT `lotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movimientos_inventario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_producto` int NOT NULL,
	`id_usuario` int,
	`tipo_movimiento` varchar(50) NOT NULL,
	`cantidad` int NOT NULL,
	`stock_anterior` int NOT NULL,
	`stock_nuevo` int NOT NULL,
	`motivo` varchar(255),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `movimientos_inventario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_usuario` int,
	`accion` varchar(100) NOT NULL,
	`tabla` varchar(100) NOT NULL,
	`id_registro` int,
	`datos_antes` json,
	`datos_despues` json,
	`ip_address` varchar(45),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_rol_roles_id_fk` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productos` ADD CONSTRAINT `productos_id_categoria_categorias_id_fk` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productos` ADD CONSTRAINT `productos_id_proveedor_proveedores_id_fk` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productos` ADD CONSTRAINT `productos_created_by_usuarios_id_fk` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_id_cliente_clientes_id_fk` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_id_vendedor_usuarios_id_fk` FOREIGN KEY (`id_vendedor`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_anulada_por_usuarios_id_fk` FOREIGN KEY (`anulada_por`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detalle_ventas` ADD CONSTRAINT `detalle_ventas_id_venta_ventas_id_fk` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detalle_ventas` ADD CONSTRAINT `detalle_ventas_id_producto_productos_id_fk` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `devoluciones` ADD CONSTRAINT `devoluciones_id_venta_ventas_id_fk` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `devoluciones` ADD CONSTRAINT `devoluciones_id_producto_productos_id_fk` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `devoluciones` ADD CONSTRAINT `devoluciones_id_usuario_usuarios_id_fk` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_id_producto_productos_id_fk` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_producto_productos_id_fk` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_usuario_usuarios_id_fk` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_id_usuario_usuarios_id_fk` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;