// src/components/Reportes.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import './Ventas.css'; 
import './Reportes.css'; 

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ventas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVentas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error de conexión al cargar reportes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  // Cálculos dinámicos globales
  const totalVentas = ventas.length;
  const ingresos = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;
  const ivaRecaudado = ingresos * 0.19;

  const ventasFiltradas = ventas.filter(v => 
    (v.numero_factura && v.numero_factura.toLowerCase().includes(busqueda.toLowerCase())) ||
    (v.metodo_pago && v.metodo_pago.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Reportes e Historial</div>
            <h1>Reportes y Facturación</h1>
            <p className="subtitle">Historial completo sincronizado con la base de datos</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => window.print()}>⭳ Imprimir Reporte</button>
            <div className="header-user" style={{marginLeft: '20px'}}>
              <strong>Samuel Torres</strong>
            </div>
          </div>
        </header>

        {/* 4 Tarjetas de resumen dinámicas */}
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-title">Ventas Totales</div>
            <div className="stat-value">{cargando ? '...' : totalVentas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Ingresos Totales</div>
            <div className="stat-value">$ {cargando ? '...' : ingresos.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Ticket promedio</div>
            <div className="stat-value">$ {cargando ? '...' : Math.round(ticketPromedio).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">IVA estimado (19%)</div>
            <div className="stat-value">$ {cargando ? '...' : Math.round(ivaRecaudado).toLocaleString()}</div>
          </div>
        </div>

        {/* Tabla Detallada de Facturas */}
        <div className="panel table-panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>HISTORIAL DE FACTURAS EMITIDAS</h3>
            <input 
              type="text" 
              placeholder="Filtrar por factura o método..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px' }}
            />
          </div>

          <table className="bizly-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>NO. FACTURA</th>
                <th style={{ padding: '12px' }}>FECHA Y HORA</th>
                <th style={{ padding: '12px' }}>MÉTODO DE PAGO</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="4" className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>Cargando registros...</td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>No se encontraron facturas.</td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#2563eb' }}>{v.numero_factura || `FAC-${v.id}`}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{new Date(v.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px', color: '#475569', textTransform: 'capitalize' }}>{v.metodo_pago}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>$ {Number(v.total).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default Reportes;