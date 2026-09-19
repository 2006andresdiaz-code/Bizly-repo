-- ------------------------------------------------------
-- Script de Base de Datos para Bizly (Sistema de Inventario)
-- Estructura limpia para primera instalación
-- Host: 127.0.0.1    Database: bizly_db
-- ------------------------------------------------------
SET NAMES utf8mb4;
SET TIME_ZONE = '+00:00';
SET UNIQUE_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
-- Crear y usar la base de datos
CREATE DATABASE IF NOT EXISTS `bizly_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bizly_db`;
-- -----------------------------------------------------
-- Table `categorias`
-- -----------------------------------------------------
CREATE TABLE `categorias` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `activa` tinyint(1) NOT NULL DEFAULT '1',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_categorias_nombre` (`nombre`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `clientes`
-- -----------------------------------------------------
CREATE TABLE `clientes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT '1',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_clientes_documento` (`documento`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `proveedores`
-- -----------------------------------------------------
CREATE TABLE `proveedores` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `contacto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT '1',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `usuarios`
-- -----------------------------------------------------
CREATE TABLE `usuarios` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'empleado',
    `activo` tinyint(1) NOT NULL DEFAULT '1',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_usuarios_email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `productos`
-- -----------------------------------------------------
CREATE TABLE `productos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_categoria` int NOT NULL,
    `id_proveedor` int DEFAULT NULL,
    `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `precio_compra` decimal(12, 2) NOT NULL DEFAULT '0.00',
    `precio_venta` decimal(12, 2) NOT NULL,
    `stock_actual` int NOT NULL DEFAULT '0',
    `stock_minimo` int NOT NULL DEFAULT '5',
    `unidad_medida` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unidad',
    `activo` tinyint(1) NOT NULL DEFAULT '1',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_productos_codigo` (`codigo`),
    KEY `fk_productos_categoria` (`id_categoria`),
    KEY `fk_productos_proveedor` (`id_proveedor`),
    KEY `fk_productos_usuario` (`created_by`),
    KEY `idx_productos_stock` (`stock_actual`),
    CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`),
    CONSTRAINT `fk_productos_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id`),
    CONSTRAINT `fk_productos_usuario` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `ventas`
-- -----------------------------------------------------
CREATE TABLE `ventas` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_cliente` int DEFAULT NULL,
    `id_usuario` int NOT NULL,
    `total` decimal(12, 2) NOT NULL,
    `metodo_pago` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_ventas_cliente` (`id_cliente`),
    KEY `fk_ventas_usuario` (`id_usuario`),
    CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`),
    CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `detalle_ventas`
-- -----------------------------------------------------
CREATE TABLE `detalle_ventas` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_venta` int NOT NULL,
    `id_producto` int NOT NULL,
    `cantidad` int NOT NULL,
    `precio_unit` decimal(12, 2) NOT NULL,
    `descuento` decimal(12, 2) NOT NULL DEFAULT '0.00',
    `subtotal` decimal(12, 2) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_detalle_venta` (`id_venta`),
    KEY `fk_detalle_producto` (`id_producto`),
    CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
    CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `devoluciones`
-- -----------------------------------------------------
CREATE TABLE `devoluciones` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_venta` int NOT NULL,
    `id_producto` int NOT NULL,
    `id_usuario` int NOT NULL,
    `cantidad` int NOT NULL,
    `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `estado` enum('pendiente', 'aprobada', 'rechazada') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
    `monto_reembolso` decimal(12, 2) NOT NULL DEFAULT '0.00',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_dev_venta` (`id_venta`),
    KEY `fk_dev_producto` (`id_producto`),
    KEY `fk_dev_usuario` (`id_usuario`),
    CONSTRAINT `fk_dev_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
    CONSTRAINT `fk_dev_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
    CONSTRAINT `fk_dev_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `movimientos_inventario`
-- -----------------------------------------------------
CREATE TABLE `movimientos_inventario` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_producto` int NOT NULL,
    `id_usuario` int NOT NULL,
    `tipo` enum('entrada', 'salida', 'ajuste') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `cantidad` int NOT NULL,
    `stock_antes` int NOT NULL,
    `stock_despues` int NOT NULL,
    `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `referencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_mov_producto` (`id_producto`),
    KEY `fk_mov_usuario` (`id_usuario`),
    CONSTRAINT `fk_mov_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
    CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Table `auditoria`
-- -----------------------------------------------------
CREATE TABLE `auditoria` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_usuario` int DEFAULT NULL,
    `accion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `tabla` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `id_registro` int DEFAULT NULL,
    `datos_antes` json DEFAULT NULL,
    `datos_despues` json DEFAULT NULL,
    `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_auditoria_usuario` (`id_usuario`),
    KEY `idx_auditoria_fecha` (`created_at`),
    CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Reactivar validaciones
SET UNIQUE_CHECKS = 1;
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_MODE = '';