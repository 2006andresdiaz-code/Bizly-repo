// src/components/RecuperarPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoBizly from '../assets/logo-bizly.png';
import '../styles_components/Login.css';

function RecuperarPassword() {
  const [paso, setPaso] = useState(1);
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Paso 1: Solicitar el código al correo
  const enviarCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.mensaje || "Te enviamos un código de 6 dígitos a tu correo.");
        setPaso(2);
      } else {
        alert(data.error || "No se pudo enviar el código.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // Paso 2: Validar código y guardar nueva contraseña
  const cambiarPassword = async (e) => {
    e.preventDefault();

    if (nuevaPassword !== confirmarPassword) {
      return alert("Las contraseñas no coinciden.");
    }

    setCargando(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: correo,
          codigo,
          nuevaPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.");
        navigate('/');
      } else {
        alert(data.error || "Código inválido o expirado.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-placeholder">
            <img src={logoBizly} alt="Bizly Logo" className="bizly-logo" />
            <h2>Bizly</h2>
          </div>
          <h3>Recuperar contraseña</h3>
          <p>
            {paso === 1
              ? "Te enviaremos un código de 6 dígitos."
              : `Ingresa el código enviado a ${correo}`}
          </p>
        </div>

        {paso === 1 ? (
          <form onSubmit={enviarCodigo} className="login-form">
            <div className="input-group">
              <label>Correo electrónico <span>*</span></label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={cambiarPassword} className="login-form">
            <div className="input-group">
              <label>Código de 6 dígitos <span>*</span></label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Nueva contraseña <span>*</span></label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirmar nueva contraseña <span>*</span></label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}

        <div className="login-footer">
          {paso === 2 && (
            <>
              <a
                href="#reenviar"
                onClick={(e) => {
                  e.preventDefault();
                  setPaso(1);
                }}
              >
                Cambiar correo
              </a>
              <span>·</span>
            </>
          )}
          <Link to="/">← Volver al login</Link>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;