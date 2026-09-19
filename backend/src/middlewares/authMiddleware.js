// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de autenticación.' });
    }

    // El formato suele ser "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token mal formado o ausente.' });
    }

    try {
        const
            verificado = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
        req.usuario = verificado; // Guardamos los datos del usuario decodificados en la petición
        next(); // Continuamos con la ejecución de la ruta
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };