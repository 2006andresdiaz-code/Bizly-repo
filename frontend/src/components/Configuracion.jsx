// src/components/Configuracion.jsx
import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import { EmpresaContext } from '../context/EmpresaContext';
import './Dashboard.css';
import './Ventas.css'; // Reutilizamos estilos de tabla
import './Configuracion.css';

function Configuracion() {
  const [tabActiva, setTabActiva] = useState('empresa');
  const { nombreEmpresa, actualizarNombreEmpresa } = useContext(EmpresaContext);
  
  // Estado local para el formulario de empresa
  const [nombreInput, setNombreInput] = useState(nombreEmpresa);
  const [telefonoInput, setTelefonoInput] = useState('3001234567');
  const [emailInput, setEmailInput] = useState('negocio@email.com');
  const [direccionInput, setDireccionInput] = useState('Calle 1 # 2-3');

  const manejarGuardarEmpresa = (e) => {
    e.preventDefault();
    actualizarNombreEmpresa(nombreInput);
    alert('¡Información de la empresa actualizada con éxito!');
  };

  // Datos simulados de la tabla de usuarios
  const usuarios = [
    { id: 1, usuario: 'prueba 1', correo: 'soporte.bizly@gmail.com', verificado: false, rol: 'Empleado', estado: 'Activo' },
    { id: 2, usuario: '6 1', correo: 'hainermartinez722@gmail.com', verificado: false, rol: 'Empleado', estado: 'Activo' },
    { id: 3, usuario: 'pepito paez', correo: 'oreocon1litrodeleche@gmail.com', verificado: true, rol: 'Empleado', estado: 'Activo' },
    { id: 4, usuario: 'prueba 1', correo: 'acoldboy722@gmail.com', verificado: false, rol: 'Empleado', estado: 'Activo' },
    { id: 5, usuario: 'prueba 1', correo: 'popcorncinema069@gmail.com', verificado: false, rol: 'Empleado', estado: 'Activo' },
    { id: 6, usuario: 'Jhoan Sebastian Agudelo Rodríguez', correo: 'sebastianagudelo072@gmail.com', verificado: false, rol: 'Empleado', estado: 'Activo' },
    { id: 7, usuario: 'Admin Bizly', correo: 'admin@bizly.local', verificado: true, rol: 'Administrador', estado: 'Activo' },
  ];

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Configuración</div>
            <h1>Configuración</h1>
            <p className="subtitle">Administra la empresa, usuarios y parámetros del sistema</p>
          </div>
          <div className="header-actions">
            <div className="header-user">
              <strong>Admin Bizly</strong>
            </div>
          </div>
        </header>

        {/* Pestañas (Tabs) con eventos onClick para cambiar el estado */}
        <div className="tabs-nav">
          <button 
            className={`tab-link ${tabActiva === 'empresa' ? 'active' : ''}`} 
            onClick={() => setTabActiva('empresa')}
          >
            Mi empresa
          </button>
          <button 
            className={`tab-link ${tabActiva === 'usuarios' ? 'active' : ''}`} 
            onClick={() => setTabActiva('usuarios')}
          >
            Usuarios
          </button>
          <button 
            className={`tab-link ${tabActiva === 'plan' ? 'active' : ''}`} 
            onClick={() => setTabActiva('plan')}
          >
            Plan
          </button>
        </div>

        {/* --- CONTENIDO DINÁMICO SEGÚN LA PESTAÑA ACTIVA --- */}
        
        {/* Pestaña 1: Mi Empresa */}
        {tabActiva === 'empresa' && (
          <div className="config-panel">
            <h3 className="form-section-title">Información del negocio</h3>
            <form className="config-form" onSubmit={manejarGuardarEmpresa}>
              <div className="input-group">
                <label>Nombre del negocio <span>*</span></label>
                <input 
                  type="text" 
                  value={nombreInput} 
                  onChange={(e) => setNombreInput(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Teléfono</label>
                  <input 
                    type="text" 
                    value={telefonoInput} 
                    onChange={(e) => setTelefonoInput(e.target.value)} 
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={emailInput} 
                    onChange={(e) => setEmailInput(e.target.value)} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Dirección</label>
                <input 
                  type="text" 
                  value={direccionInput} 
                  onChange={(e) => setDireccionInput(e.target.value)} 
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Moneda</label>
                  <select defaultValue="COP">
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>IVA / Impuesto (%) <span>*</span></label>
                  <input type="number" defaultValue="19" />
                </div>
              </div>
              <div className="input-group">
                <label>Umbral de stock bajo <span>*</span></label>
                <input type="number" defaultValue="10" />
                <span className="helper-text" style={{marginTop: '5px', fontSize: '12px', color: '#888'}}>
                  El dashboard mostrará alerta cuando el stock sea igual o inferior a este valor.
                </span>
              </div>
              <button type="submit" className="btn-save">Guardar cambios</button>
            </form>
          </div>
        )}

        {/* Pestaña 2: Usuarios */}
        {tabActiva === 'usuarios' && (
          <div className="config-panel" style={{ maxWidth: '100%', padding: '0' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
              <h3 className="form-section-title" style={{ border: 'none', padding: 0, margin: 0 }}>Usuarios y permisos</h3>
              <button className="btn-secondary" style={{ padding: '8px 15px', fontSize: '13px' }}>↻ Actualizar</button>
            </div>
            
            <table className="bizly-table config-table">
              <thead>
                <tr>
                  <th>USUARIO</th>
                  <th>CORREO</th>
                  <th>VERIFICADO</th>
                  <th>ROL</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '500', color: '#333' }}>{user.usuario}</td>
                    <td>{user.correo}</td>
                    <td>
                      <span className={`status-badge ${user.verificado ? 'verified' : 'pending'}`}>
                        {user.verificado ? 'Si' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <select defaultValue={user.rol} className="table-select">
                        <option value="Empleado">Empleado</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>
                    <td>
                      <select defaultValue={user.estado} className="table-select">
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '15px 20px', fontSize: '11px', color: '#94a3b8' }}>
              Las rutas de auditoría, configuración y gestión de usuarios también están protegidas por rol en el backend; ocultar un botón en React no es el único control.
            </div>
          </div>
        )}

        {/* Pestaña 3: Plan */}
        {tabActiva === 'plan' && (
          <div className="config-panel">
            <h3 className="form-section-title">Plan actual</h3>
            <div className="plan-card">
              <div className="plan-icon">👑</div>
              <div className="plan-details">
                <h4>Business</h4>
                <p>Acceso completo a los módulos habilitados</p>
              </div>
              <div className="plan-status">Activo</div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Configuracion;