// src/components/RecuperarPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logoBizly from '../assets/logo-bizly.png';
import './Login.css';

function RecuperarPassword() {
  const [correo, setCorreo] = useState("");

  const enviarCodigo = (e) => {
    e.preventDefault();
    console.log("Enviando código de recuperación a:", correo);
    alert("Si el correo existe, recibirás un código de 6 dígitos.");
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
          <p>Te enviaremos un código de 6 dígitos.</p>
        </div>

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

          <button type="submit" className="btn-submit">
            Enviar código
          </button>
        </form>

        <div className="login-footer">
          <Link to="/">← Volver al login</Link>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;