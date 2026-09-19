// src/components/Registro.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import logoBizly from '../assets/logo-bizly.png';
import './Login.css'; 

function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  const navigate = useNavigate();

  const registrarUsuario = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    try {
      // CORREGIDO: Apuntando a '/api/auth/registro' tal como está en el backend de Jonathan
      const response = await fetch('http://localhost:5000/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          email: correo,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
        navigate('/'); // Redirige al login tras un registro exitoso
      } else {
        alert(data.error || "Hubo un error al registrar el usuario");
      }
    } catch (error) {
      console.error("Error de conexión al registrar:", error);
      alert("No se pudo conectar con el servidor backend.");
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
          <h3>Crear cuenta</h3>
          <p>Regístrate para empezar a usar Bizly</p>
        </div>

        <form onSubmit={registrarUsuario} className="login-form">
          <div className="input-row">
            <div className="input-group">
              <label>Nombre <span>*</span></label>
              <input
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <input
                type="text"
                placeholder="Pérez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
          </div>

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

          <div className="input-group">
            <label>Contraseña <span>*</span></label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirmar contraseña <span>*</span></label>
            <input
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="terminos" 
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              required 
            />
            <label htmlFor="terminos">
              Acepto los <a href="#">términos de uso</a> y la <a href="#">política de privacidad</a>. <span>*</span>
            </label>
          </div>

          <button type="submit" className="btn-submit">
            Crear cuenta
          </button>
        </form>

        <div className="login-footer">
          <span>¿Ya tienes cuenta?</span> <Link to="/">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default Registro;