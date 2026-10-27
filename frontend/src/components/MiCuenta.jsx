// src/components/MiCuenta.jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import React from 'react';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css';
import '../styles_components/MiCuenta.css';

function MiCuenta() {
  const { usuario } = useContext(AuthContext);
  
  // Estados para el modal de cambio de contraseña
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirmar, setPassConfirmar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const obtenerNombreRol = (rol) => {
    if (String(rol) === '1') return 'Administrador';
    if (String(rol) === '2' || String(rol) === '3') return 'Vendedor';
    return 'Administrador'; 
  };

  const esAdmin = String(usuario?.rol || usuario?.id_rol) === '1';

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (passNueva !== passConfirmar) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }
    
    setGuardando(true);
    // Aquí luego conectaremos con el backend real
    setTimeout(() => {
      alert("¡Contraseña actualizada con éxito! (Simulación)");
      setGuardando(false);
      setModalPasswordAbierto(false);
      setPassActual('');
      setPassNueva('');
      setPassConfirmar('');
    }, 1000);
  };

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
              <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            </div>
          </div>
        </header>

        <div className="account-grid">
          
          {/* Tarjeta de Perfil */}
          <div className="account-card">
            <div className="card-header-title">PERFIL</div>
            
            <div className="info-group">
              <span className="info-label">NOMBRE</span>
              <span className="info-value">{usuario?.nombre} {usuario?.apellido}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">CORREO</span>
              <span className="info-value">{usuario?.email}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">ROL</span>
              <span className="info-value">
                {obtenerNombreRol(usuario?.rol || usuario?.id_rol)}
              </span>
            </div>
          </div>

          {/* Tarjeta de Seguridad */}
          <div className="account-card">
            <div className="card-header-title">SEGURIDAD</div>
            <p className="security-text" style={{ marginBottom: '20px' }}>
              Gestiona el acceso a tu cuenta. Puedes actualizar tu contraseña de acceso o revocar sesiones activas en otros equipos si sospechas de actividad inusual.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                className="btn-security" 
                onClick={() => setModalPasswordAbierto(true)}
              >
                <span className="btn-icon" style={{ fontSize: '1.2em' }}>🔒</span> Cambiar contraseña
              </button>

              <button className="btn-outline">
                <span className="btn-icon">💻</span> Cerrar sesión en otros dispositivos
              </button>
            </div>
          </div>

        </div>

        {/* Tarjeta de Zona de Riesgo (Solo visible para Administradores) */}
        {esAdmin && (
          <div className="risk-zone-card">
            <div className="risk-header">Zona de riesgo</div>
            <div className="risk-body">
              <p>
                Eliminar la cuenta la desactiva, anonimiza el correo y cierra todas las sesiones. Los registros contables y de auditoría necesarios para conservar la integridad del negocio no se eliminan.
              </p>
              <button className="btn-danger" onClick={() => alert('Solo administradores de base de datos pueden ejecutar esta acción por seguridad contable.')}>
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        )}

      </main>

      {/* --- VENTANA MODAL PARA CAMBIO DE CONTRASEÑA --- */}
      {modalPasswordAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <h2>🔒 Cambiar contraseña</h2>
              <button className="close-btn" onClick={() => setModalPasswordAbierto(false)}>✕</button>
            </div>

            <form className="modal-body" onSubmit={handleCambiarPassword}>
              <div className="input-group">
                <label>Contraseña actual <span>*</span></label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={passActual}
                  onChange={(e) => setPassActual(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Nueva contraseña <span>*</span></label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={passNueva}
                  onChange={(e) => setPassNueva(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="input-group">
                <label>Confirmar nueva contraseña <span>*</span></label>
                <input
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  value={passConfirmar}
                  onChange={(e) => setPassConfirmar(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', padding: '10px 0 0' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalPasswordAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-security" disabled={guardando}>
                  {guardando ? 'Actualizando...' : 'Guardar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiCuenta;