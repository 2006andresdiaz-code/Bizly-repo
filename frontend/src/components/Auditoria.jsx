// src/components/Auditoria.jsx
import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import './Ventas.css'; // Usaremos el buscador de ventas
import './Auditoria.css'; // Estilos nuevos para la lista

function Auditoria() {
  // Simulamos los datos que llegarían de la base de datos
  const logs = [
    { id: 1, avatar: 'PP', name: 'pepito paez', action: 'Cerró', module: 'Auth', desc: 'Cerró sesión', time: '06 de sept de 2026, 08:40 p. m.', type: 'blue' },
    { id: 2, avatar: 'PP', name: 'pepito paez', action: 'Verificó', module: 'Auth', desc: 'Verificó su correo electrónico', time: '06 de sept de 2026, 08:27 p. m.', type: 'green' },
    { id: 3, avatar: 'AB', name: 'Admin Bizly', action: 'Inició', module: 'Auth', desc: 'Inició sesión', time: '06 de sept de 2026, 06:31 p. m.', type: 'green' },
    { id: 4, avatar: 'AB', name: 'Admin Bizly', action: 'Cerró', module: 'Auth', desc: 'Cerró sesión', time: '06 de sept de 2026, 05:58 p. m.', type: 'blue' },
    { id: 5, avatar: 'AB', name: 'Admin Bizly', action: 'Inició', module: 'Auth', desc: 'Inició sesión', time: '06 de sept de 2026, 05:55 p. m.', type: 'green' }
  ];

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
          <div className="header-actions">
            <div className="header-user">
              <strong>Admin Bizly</strong>
            </div>
          </div>
        </header>

        {/* Buscador */}
        <div className="action-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar por usuario, acción o módulo..." className="search-input" />
          </div>
        </div>

        {/* Lista de Auditoría */}
        <div className="audit-list">
          {logs.map((log) => (
            <div className="audit-item" key={log.id}>
              <div className="audit-avatar-container">
                <div className={`audit-avatar ${log.avatar === 'AB' ? 'bg-blue' : 'bg-purple'}`}>
                  {log.avatar}
                </div>
              </div>
              <div className="audit-info">
                <div className="audit-title-row">
                  <span className="audit-name">{log.name}</span>
                  <span className={`audit-badge ${log.type === 'green' ? 'badge-green' : 'badge-blue'}`}>
                    {log.action}
                  </span>
                  <span className="audit-module">{log.module}</span>
                </div>
                <div className="audit-desc">{log.desc}</div>
              </div>
              <div className="audit-time">{log.time}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Auditoria;