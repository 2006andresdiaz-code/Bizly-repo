// src/components/Reportes.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import './Ventas.css'; 
import './Reportes.css'; 

function Reportes() {
  // Estados para los filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('2026-09-01');
  const [fechaFin, setFechaFin] = useState('2026-09-07');
  
  // Estados para los datos del reporte
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ingresos: 0,
    ticketPromedio: 0,
    ivaRecaudado: 0
  });
  const [cargando, setCargando] = useState(true);

  // Cargar reportes desde el Backend filtrando por fechas
  const cargarReportes = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      // Ajusta la ruta según el endpoint que haya creado Jonathan para reportes (ej. /api/ventas/reportes o /api/reportes)
      const response = await fetch(`http://localhost:5000/api/ventas?inicio=${fechaInicio}&fin=${fechaFin}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Si tu backend devuelve un arreglo de ventas, calculamos los totales aquí de forma segura:
        const ventasArray = Array.isArray(data) ? data : data.ventas || [];
        
        const totalVentas = ventasArray.length;
        const ingresos = ventasArray.reduce((acc, v) => acc + Number(v.total || 0), 0);
        const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;
        const ivaRecaudado = ingresos * 0.19; // Ajusta si el IVA se calcula diferente en tu proyecto

        setEstadisticas({
          totalVentas,
          ingresos,
          ticketPromedio,
          ivaRecaudado
        });
      } else {
        console.error("Error al obtener datos de ventas para reportes");
      }
    } catch (error) {
      console.error("Error de conexión al cargar reportes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin]); // Se recarga automáticamente si cambian las fechas

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Reportes</div>
            <h1>Reportes</h1>
            <p className="subtitle">Análisis generado por el backend y exportación de datos</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">⭳ Exportar período</button>
            <div className="header-user" style={{marginLeft: '20px'}}>
              <strong>Admin Bizly</strong>npm 
            </div>
          </div>
        </header>

        {/* Barra de filtro de fechas */}
        <div className="date-filter-bar">
          <span className="date-label">Período:</span>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
            className="date-input" 
          />
          <span className="date-label">hasta</span>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
            className="date-input" 
          />
        </div>

        {/* 4 Tarjetas de resumen dinámicas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Ventas del período</div>
            <div className="stat-value">{cargando ? '...' : estadisticas.totalVentas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Ingresos</div>
            <div className="stat-value">$ {cargando ? '...' : estadisticas.ingresos.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Ticket promedio</div>
            <div className="stat-value">$ {cargando ? '...' : Math.round(estadisticas.ticketPromedio).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">IVA recaudado</div>
            <div className="stat-value">$ {cargando ? '...' : Math.round(estadisticas.ivaRecaudado).toLocaleString()}</div>
          </div>
        </div>

        {/* Paneles de Gráficos */}
        <div className="dashboard-panels" style={{ marginBottom: '20px' }}>
          <div className="panel chart-panel">
            <h3>TENDENCIA MENSUAL (6 MESES)</h3>
            <div className="placeholder-content" style={{ height: '250px' }}>
              <div className="chart-mockup">
                <div className="y-axis">
                  <span>$500k</span><span>$ 400k</span><span>$300k</span><span>$ 200k</span>
                  <span>$100k</span><span>$ 50k</span><span>$10k</span><span>$ 0k</span>
                </div>
                <div className="x-axis">
                  <span>abr de 26</span><span>may de 26</span><span>jun de 26</span>
                  <span>jul de 26</span><span>ago de 26</span><span>sept de 26</span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel list-panel">
            <h3>MÉTODOS DE PAGO</h3>
            <div className="placeholder-content" style={{ height: '250px', border: 'none' }}>
              {cargando ? 'Cargando...' : 'Efectivo: 100%'}
            </div>
          </div>
        </div>

        {/* Tabla Inferior: Top Productos */}
        <div className="panel table-panel">
          <h3>TOP 5 PRODUCTOS POR INGRESOS</h3>
          <table className="bizly-table">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>UNIDADES</th>
                <th>INGRESOS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="empty-state" style={{ padding: '40px' }}>
                  {cargando ? 'Cargando datos...' : 'Sin datos en el período'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default Reportes;