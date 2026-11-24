// src/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configuración del transporte de correo (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- OBTENER TODOS LOS USUARIOS (GET) ---
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_rol, nombre, apellido, email, tipo_negocio, activo, created_at FROM usuarios WHERE activo = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios', detalle: error.message });
  }
};

// --- REGISTRAR USUARIO (POST) ---
exports.registrar = async (req, res) => {
  const { nombre, apellido, email, password, id_rol, codigo_admin, tipo_negocio } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, email, password)' });
  }

  if (String(id_rol) === '1') {
    const CODIGO_SECRETO = 'BIZLY2026';

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

    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, tipo_negocio, activo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, apellido || '', email, passwordHash, id_rol || 2, tipo_negocio || 'general']
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
      'SELECT id, nombre, apellido, email, password_hash, id_rol, tipo_negocio FROM usuarios WHERE email = ? AND activo = 1',
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
      { id: usuario.id, email: usuario.email, rol: usuario.id_rol, tipo_negocio: usuario.tipo_negocio },
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
        rol: usuario.id_rol,
        tipo_negocio: usuario.tipo_negocio
      }
    });

  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Error de servidor al intentar iniciar sesión', detalle: error.message });
  }
};

// --- PASO 1: SOLICITAR CÓDIGO DE RECUPERACIÓN ---
exports.solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Por favor ingresa tu correo electrónico' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta activa asociada a ese correo' });
    }

    const usuario = rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await db.query(
      'UPDATE usuarios SET reset_code = ?, reset_code_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
      [codigo, usuario.id]
    );

    await transporter.sendMail({
      from: `"Soporte Bizly" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código de recuperación de contraseña - Bizly',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b; margin-bottom: 10px;">Hola, ${usuario.nombre}</h2>
          <p style="color: #475569; font-size: 15px;">Recibimos una solicitud para restablecer tu contraseña en <strong>Bizly</strong>. Usa el siguiente código de verificación:</p>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #16a34a;">${codigo}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">Este código expirará en <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `
    });

    res.json({ mensaje: 'Código enviado correctamente a tu correo electrónico' });

  } catch (error) {
    console.error('Error al enviar código de recuperación:', error);
    res.status(500).json({
      error: 'No se pudo enviar el correo. Verifica la configuración EMAIL_USER/EMAIL_PASS en el servidor.',
      detalle: error.message
    });
  }
};

// --- PASO 2: VERIFICAR CÓDIGO Y CAMBIAR CONTRASEÑA ---
exports.restablecerPassword = async (req, res) => {
  const { email, codigo, nuevaPassword } = req.body;

  if (!email || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (nuevaPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? AND activo = 1 AND reset_code = ? AND reset_code_expires > NOW()',
      [email, String(codigo).trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'El código es incorrecto o ya expiró' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);

    await db.query(
      'UPDATE usuarios SET password_hash = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?',
      [passwordHash, rows[0].id]
    );

    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error interno al actualizar la contraseña', detalle: error.message });
  }
};