// src/components/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Dashboard</div>
            <h1>Bienvenido de vuelta, Samuel </h1>
            <p className="subtitle">Aquí tienes el resumen de tu negocio de hoy.</p>
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
                <h3 style={{ fontSize: '24px', color: '#1e293b', margin: '5px 0' }}>$ 16.600</h3>
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
                <h3 style={{ fontSize: '24px', color: '#1e293b', margin: '5px 0' }}>2</h3>
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

        {/* Sección de Últimas Ventas */}
        <div className="product-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>Últimas 5 ventas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '10px' }}>Factura</th>
                <th style={{ padding: '10px' }}>Método de Pago</th>
                <th style={{ padding: '10px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', color: '#624bff', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate('/ventas')}>FAC-1789610758404</td>
                <td style={{ padding: '12px', color: '#475569' }}>efectivo</td>
                <td style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>$ 8300</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', color: '#624bff', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate('/ventas')}>FAC-1789529055903</td>
                <td style={{ padding: '12px', color: '#475569' }}>efectivo</td>
                <td style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>$ 8300</td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;