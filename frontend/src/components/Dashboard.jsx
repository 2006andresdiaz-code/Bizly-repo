// src/components/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext) || {};
  
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]); 
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': token ? `Bearer ${token}` : '' };

        const [resVentas, resProductos] = await Promise.all([
          fetch('http://localhost:5000/api/ventas', { headers }),
          fetch('http://localhost:5000/api/productos', { headers })
        ]);

        if (resVentas.ok) {
          const dataVentas = await resVentas.json();
          setVentas(Array.isArray(dataVentas) ? dataVentas : []);
        }

        if (resProductos.ok) {
          const dataProductos = await resProductos.json();
          setProductos(Array.isArray(dataProductos) ? dataProductos : []);
        }

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosDashboard();
  }, []);

  const totalIngresos = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const totalFacturas = ventas.length;
  const ultimasVentas = ventas.slice(0, 5); 

  const stockBajoCount = productos.filter(p => Number(p.stock_actual) <= Number(p.stock_minimo || 5)).length;

  const obtenerNombreRol = (rol) => {
    if (String(rol) === '1') return 'Administrador';
    if (String(rol) === '2' || String(rol) === '3') return 'Vendedor';
    return rol || 'Administrador'; 
  };

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Dashboard</div>
            <h1>Bienvenido de vuelta, {usuario?.nombre || 'Usuario'}</h1>
            <p className="subtitle">Aquí tienes el resumen de tu negocio en tiempo real.</p>
          </div>
          <div className="header-user">
            <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            <span style={{ textTransform: 'capitalize' }}>
              {obtenerNombreRol(usuario?.rol)}
            </span>
          </div>
        </header>

        <div className="metrics-grid">
          
          <div className="metric-card" onClick={() => navigate('/reportes')} title="Ver reportes detallados">
            <div className="metric-icon metric-icon-blue">📊</div>
            <div className="metric-info">
              <h3>Ingresos Totales</h3>
              <p className="metric-value">$ {cargando ? '...' : totalIngresos.toLocaleString()}</p>
              <span className="metric-trend positive">↑ En tiempo real</span>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate('/ventas')} title="Ver módulo de ventas">
            <div className="metric-icon metric-icon-green">📄</div>
            <div className="metric-info">
              <h3>Ventas Realizadas</h3>
              <p className="metric-value">{cargando ? '...' : totalFacturas}</p>
              <span className="metric-trend neutral">Facturas emitidas</span>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate('/inventario')} title="Gestionar inventario y stock">
            <div className="metric-icon metric-icon-red">⚠️</div>
            <div className="metric-info">
              <h3>Alertas de Stock</h3>
              <p className="metric-value">{cargando ? '...' : stockBajoCount}</p>
              <span className="metric-trend negative">Productos por agotar</span>
            </div>
          </div>

        </div>

        <div className="panel">
          <h3>Últimas ventas registradas</h3>
          
          <table className="sales-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Método de Pago</th>
                <th className="align-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="3" className="cell-center">Cargando...</td></tr>
              ) : ultimasVentas.length === 0 ? (
                <tr><td colSpan="3" className="cell-center">No hay ventas registradas aún.</td></tr>
              ) : (
                ultimasVentas.map((v) => (
                  <tr key={v.id}>
                    {/* AQUÍ ESTÁ LA MAGIA: Formateamos el ID secuencial con ceros a la izquierda */}
                    <td className="cell-link" onClick={() => navigate('/reportes')}>
                      FAC-{String(v.id).padStart(5, '0')}
                    </td>
                    <td className="cell-method">{v.metodo_pago}</td>
                    <td className="cell-total">$ {Number(v.total).toLocaleString()}</td>
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