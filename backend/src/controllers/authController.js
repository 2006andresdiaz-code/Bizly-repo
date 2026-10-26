// src/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- OBTENER TODOS LOS USUARIOS (GET) ---
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_rol, nombre, apellido, email, activo, created_at FROM usuarios WHERE activo = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios', detalle: error.message });
  }
};

// --- REGISTRAR USUARIO (POST) ---
exports.registrar = async (req, res) => {
  // 1. Extraemos los campos nuevos: id_rol y codigo_admin
  const { nombre, apellido, email, password, id_rol, codigo_admin } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, email, password)' });
  }

  // 2. --- VALIDACIÓN DE SEGURIDAD PARA ADMINISTRADORES ---
  if (String(id_rol) === '1') {
    const CODIGO_SECRETO = 'BIZLY2026'; // Aquí defines tu clave maestra
    
    if (codigo_admin !== CODIGO_SECRETO) {
      return res.status(403).json({ error: 'Código de administrador incorrecto. Acceso denegado.' });
    }
  }

  try {
    const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Se agrega 'apellido' en el INSERT para evitar el error de campo vacío
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) VALUES (?, ?, ?, ?, ?, 1)`,
      [nombre, apellido || '', email, passwordHash, id_rol || 2] 
    );

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor al registrar el usuario', detalle: error.message });
  }
};

// --- LOGIN CON GENERACIÓN DE JWT ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor ingresa correo y contraseña' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre, apellido, email, password_hash, id_rol FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.id_rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token, 
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.id_rol
      }
    });

  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Error de servidor al intentar iniciar sesión', detalle: error.message });
  }
};