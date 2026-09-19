// src/components/MiCuenta.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import './MiCuenta.css'; // Estilos específicos para esta vista

function MiCuenta() {
  // 1. Aquí "extraemos" al usuario de nuestra caja fuerte (Contexto)
  const { usuario } = useContext(AuthContext);

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Mi cuenta</div>
            <h1>Mi cuenta</h1>
            <p className="subtitle">Información personal y seguridad de sesión</p>
          </div>
          <div className="header-actions">
            <div className="header-user">
              {/* 2. Actualizamos el nombre en la esquina superior derecha */}
              <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            </div>
          </div>
        </header>

        {/* Contenedor de las dos tarjetas superiores */}
        <div className="account-grid">
          
          {/* Tarjeta de Perfil */}
          <div className="account-card">
            <div className="card-header-title">PERFIL</div>
            
            <div className="info-group">
              <span className="info-label">NOMBRE</span>
              {/* 3. Reemplazamos el nombre estático */}
              <span className="info-value">{usuario?.nombre} {usuario?.apellido}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">CORREO</span>
              {/* 4. Reemplazamos el correo estático */}
              <span className="info-value">{usuario?.email}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">ROL</span>
              {/* 5. Asignamos el rol basado en su id de la base de datos */}
              <span className="info-value">
                {usuario?.id_rol === 1 ? 'Administrador' : 'Vendedor'}
              </span>
            </div>
          </div>

          {/* Tarjeta de Seguridad */}
          <div className="account-card">
            <div className="card-header-title">SEGURIDAD</div>
            <p className="security-text">
              Si perdiste acceso a otro equipo o sospechas que alguien inició sesión con tu cuenta, puedes revocar todas las sesiones activas.
            </p>
            <button className="btn-outline">
              <span className="btn-icon">💻</span> Cerrar sesión en todos los dispositivos
            </button>
          </div>

        </div>

        {/* Tarjeta de Zona de Riesgo */}
        <div className="risk-zone-card">
          <div className="risk-header">Zona de riesgo</div>
          <div className="risk-body">
            <p>
              Eliminar la cuenta la desactiva, anonimiza el correo y cierra todas las sesiones. Los registros contables y de auditoría necesarios para conservar la integridad del negocio no se eliminan.
            </p>
            <button className="btn-danger">Eliminar mi cuenta</button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default MiCuenta;