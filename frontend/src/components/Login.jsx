// src/components/Login.jsx
//Correo de prueva: samuel.torres393@example.com
//y su contraseña es: 123456
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Login.css';
import logoBizly from '../assets/logo-bizly.png'; 

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: correo, password: password }) 
      });

      const data = await response.json();

      if (response.ok) {
        console.log('¡Bienvenido!', data.usuario);
        
        // 🔑 GUARDAMOS EL TOKEN EN EL LOCALSTORAGE PARA LAS PETICIONES PROTEGIDAS
        if (data.token) {
          localStorage.setItem('token', data.token);
        } else if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
        }

        login(data.usuario);
        navigate('/dashboard'); 
      } else {
        alert(data.error || "Credenciales incorrectas"); 
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error al conectar con el servidor. ¿El backend en Node está encendido?');
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
          <h3>Bienvenido de vuelta</h3>
          <p>Inicia sesión para continuar</p>
        </div>
        
        <form onSubmit={iniciarSesion} className="login-form">
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
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Iniciar sesión
          </button>
        </form>

        <div className="login-footer">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
          <span>·</span>
          <Link to="/registro">Crear cuenta</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;