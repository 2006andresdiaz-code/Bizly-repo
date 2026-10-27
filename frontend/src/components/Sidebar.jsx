// src/components/Sidebar.jsx
import { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { EmpresaContext } from '../context/EmpresaContext';
import logoBizly from '../assets/logo-bizly.png';

function Sidebar() {
  const { nombreEmpresa } = useContext(EmpresaContext);
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const cerrarSesion = () => {
    logout();
    navigate('/'); 
  };

  const obtenerNombreRol = (rol) => {
    if (String(rol) === '1') return 'Administrador';
    if (String(rol) === '2' || String(rol) === '3') return 'Vendedor';
    return 'Administrador'; 
  };

  // Variable clave para saber si es admin (rol 1)
  const esAdmin = String(usuario?.rol || usuario?.id_rol) === '1';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoBizly} alt="Bizly Logo" className="sidebar-logo" />
        <div>
          <h2>{nombreEmpresa}</h2>
          <p>{usuario?.nombre} {usuario?.apellido}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Módulos para TODOS (Admin y Vendedor) */}
        <Link to="/ventas" className={`nav-item ${location.pathname === '/ventas' ? 'active' : ''}`}>Ventas</Link>
        <Link to="/devoluciones" className={`nav-item ${location.pathname === '/devoluciones' ? 'active' : ''}`}>Devoluciones</Link>
        <Link to="/clientes" className={`nav-item ${location.pathname === '/clientes' ? 'active' : ''}`}>Clientes</Link>

        {/* Módulos SOLO para ADMINISTRADORES */}
        {esAdmin && (
          <>
            <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/inventario" className={`nav-item ${location.pathname === '/inventario' ? 'active' : ''}`}>Inventario</Link>
            <Link to="/reportes" className={`nav-item ${location.pathname === '/reportes' ? 'active' : ''}`}>Reportes</Link>        
            <Link to="/auditoria" className={`nav-item ${location.pathname === '/auditoria' ? 'active' : ''}`}>Auditoría</Link>
            <Link to="/configuracion" className={`nav-item ${location.pathname === '/configuracion' ? 'active' : ''}`}>Configuración</Link>
          </>
        )}

        {/* Mi cuenta siempre visible para quien inicie sesión */}
        <Link to="/micuenta" className={`nav-item ${location.pathname === '/micuenta' ? 'active' : ''}`}>Mi cuenta</Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {usuario?.nombre?.charAt(0) || ''}{usuario?.apellido?.charAt(0) || ''}
          </div>
          <div className="user-info">
            <span className="name">{usuario?.nombre} {usuario?.apellido}</span>
            <span className="role">
              {obtenerNombreRol(usuario?.rol || usuario?.id_rol)}
            </span>
          </div>
        </div>
        <button onClick={cerrarSesion} className="logout-btn">Salir</button>
      </div>
    </aside>
  );
}

export default Sidebar;