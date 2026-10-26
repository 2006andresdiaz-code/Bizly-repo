// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar ventas reales para el resumen del Dashboard
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/ventas', {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (response.ok) {
          const data = await response.json();
          setVentas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosDashboard();
  }, []);

  // Calcular métricas reales
  const totalIngresos = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const totalFacturas = ventas.length;
  const ultimasVentas = ventas.slice(0, 5); // Tomamos las últimas 5

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Dashboard</div>
            <h1>Bienvenido de vuelta, Samuel</h1>
            <p className="subtitle">Aquí tienes el resumen de tu negocio en tiempo real.</p>
          </div>
          <div className="header-user">
            <strong>Samuel Torres</strong>
            <span>Administrador</span>
          </div>
        </header>

        {/* Tarjetas de Resumen Interactivas */}
        <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          
          {/* Tarjeta 1: Ingresos Totales -> Lleva a Reportes */}
          <div 
            className="product-card" 
            onClick={() => navigate('/reportes')} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '20px' }}
            title="Ver reportes detallados"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#eef2ff', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>📊</div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Ingresos Totales</p>
                <h3 style={{ fontSize: '24px', color: '#1e293b', margin: '5px 0' }}>
                  $ {cargando ? '...' : totalIngresos.toLocaleString()}
                </h3>
                <span style={{ fontSize: '12px', color: '#10b981' }}>↑ En tiempo real</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Ventas Realizadas -> Lleva a Ventas */}
          <div 
            className="product-card" 
            onClick={() => navigate('/ventas')} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '20px' }}
            title="Ver módulo de ventas"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>📄</div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Ventas Realizadas</p>
                <h3 style={{ fontSize: '24px', color: '#1e293b', margin: '5px 0' }}>
                  {cargando ? '...' : totalFacturas}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Facturas emitidas</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Alertas de Stock -> Lleva a Inventario */}
          <div 
            className="product-card" 
            onClick={() => navigate('/inventario')} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '20px' }}
            title="Gestionar inventario y stock"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>⚠️</div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Alertas de Stock</p>
                <h3 style={{ fontSize: '24px', color: '#1e293b', margin: '5px 0' }}>3</h3>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>Productos por agotar</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sección de Últimas Ventas Dinámica */}
        <div className="product-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>Últimas ventas registradas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '10px' }}>Factura</th>
                <th style={{ padding: '10px' }}>Método de Pago</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="3" style={{ padding: '15px', textAlign: 'center' }}>Cargando...</td></tr>
              ) : ultimasVentas.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>No hay ventas registradas aún.</td></tr>
              ) : (
                ultimasVentas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', color: '#2563eb', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate('/reportes')}>
                      {v.numero_factura || `FAC-${v.id}`}
                    </td>
                    <td style={{ padding: '12px', color: '#475569', textTransform: 'capitalize' }}>{v.metodo_pago}</td>
                    <td style={{ padding: '12px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>$ {Number(v.total).toLocaleString()}</td>
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

export default Dashboard;