// src/components/Auditoria.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css'; 
import '../styles_components/Ventas.css'; 
import '../styles_components/Auditoria.css'; 

function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando,setCargando] = useState(true);

  // Cargar registros de auditoría reales desde el Backend con Token JWT
  useEffect(() => {
    const cargarAuditoria = async () => {
      try {
        const token = localStorage.getItem('token');
        // Ajusta la ruta '/api/auditoria' si Jonathan la nombró diferente en backend/src/routes/
        const response = await fetch('http://localhost:5000/api/auditoria', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRegistros(Array.isArray(data) ? data : data.auditoria || []);
        } else {
          setRegistros([]);
        }
      } catch (error) {
        console.error("Error al cargar auditoría:", error);
        setRegistros([]);
      } finally {
        setCargando(false);
      }
    };

    cargarAuditoria();
  }, []);

  // Filtrar registros de auditoría de forma segura
  const registrosFiltrados = Array.isArray(registros) ? registros.filter(reg => {
    const texto = busqueda.toLowerCase();
    return (
      (reg.accion && reg.accion.toLowerCase().includes(texto)) ||
      (reg.tabla && reg.tabla.toLowerCase().includes(texto)) ||
      (reg.usuario && reg.usuario.toLowerCase().includes(texto))
    );
  }) : [];

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Auditoría</div>
            <h1>Centro de Auditoría</h1>
            <p className="subtitle">Actividad registrada automáticamente por el servidor</p>
          </div>
          <div className="header-user" style={{marginLeft: '20px'}}>
            <strong>Admin Bizly</strong>
          </div>
        </header>

        {/* Buscador */}
        <div className="action-bar">
          <div className="search-container" style={{ width: '100%' }}>
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por usuario, acción o módulo..." 
              className="search-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Auditoría Dinámica con datos reales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {cargando ? (
            <p>Cargando registros de auditoría...</p>
          ) : registrosFiltrados.length === 0 ? (
            <p>No hay registros de auditoría en la base de datos o la ruta del servidor requiere validación.</p>
          ) : (
            registrosFiltrados.map((reg) => {
              const iniciales = reg.usuario ? reg.usuario.substring(0, 2).toUpperCase() : 'US';
              const fechaFormateada = reg.created_at ? new Date(reg.created_at).toLocaleString() : '';

              return (
                <div key={reg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                      {iniciales}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong>{reg.usuario || 'Usuario del Sistema'}</strong>
                        <span style={{ fontSize: '0.8em', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>{reg.accion}</span>
                        <span style={{ fontSize: '0.8em', color: '#64748b' }}>Tabla: {reg.tabla}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: '#475569' }}>Registro ID: {reg.id_registro || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                    {fechaFormateada}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Auditoria;