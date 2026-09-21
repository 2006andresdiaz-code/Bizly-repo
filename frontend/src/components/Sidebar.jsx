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

  return (
    <aside className="sidebar">
      {/* Bloque de marca unificado y dinámico */}
      <div className="sidebar-brand">
        <img src={logoBizly} alt="Bizly Logo" className="sidebar-logo" />
        <div>
          <h2>{nombreEmpresa}</h2>
          <p>{usuario?.nombre} {usuario?.apellido}</p>
        </div>
      </div>

      <div className="sidebar-badge">Plan Business</div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/ventas" className={`nav-item ${location.pathname === '/ventas' ? 'active' : ''}`}>Ventas</Link>
        <Link to="/inventario" className={`nav-item ${location.pathname === '/inventario' ? 'active' : ''}`}>Inventario</Link>
        <Link to="/clientes" className={`nav-item ${location.pathname === '/clientes' ? 'active' : ''}`}>Clientes</Link>
        <Link to="/reportes" className={`nav-item ${location.pathname === '/reportes' ? 'active' : ''}`}>Reportes</Link>        
        <Link to="/auditoria" className={`nav-item ${location.pathname === '/auditoria' ? 'active' : ''}`}>Auditoría</Link>
        <Link to="/configuracion" className={`nav-item ${location.pathname === '/configuracion' ? 'active' : ''}`}>Configuración</Link>
        <Link to="/micuenta" className={`nav-item ${location.pathname === '/micuenta' ? 'active' : ''}`}>Mi cuenta</Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
          </div>
          <div className="user-info">
            <span className="name">{usuario?.nombre} {usuario?.apellido}</span>
            <span className="role">
              {usuario?.id_rol === 1 ? 'Administrador' : 'Vendedor'}
            </span>
          </div>
        </div>
        <button onClick={cerrarSesion} className="logout-btn">Salir</button>
      </div>
    </aside>
  );
}

export default Sidebar;