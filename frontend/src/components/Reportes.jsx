// src/components/Reportes.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css'; 
import '../styles_components/Ventas.css'; 
import '../styles_components/Reportes.css'; 

function Reportes() {
  const { usuario } = useContext(AuthContext);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState('Todo'); 

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

  const ventasPorFecha = ventas.filter(v => {
    if (filtroTiempo === 'Todo') return true;
    
    const fechaVenta = new Date(v.created_at);
    const hoy = new Date();
    
    if (filtroTiempo === 'Hoy') {
      return fechaVenta.toDateString() === hoy.toDateString();
    }
    if (filtroTiempo === 'Semana') {
      const hace7Dias = new Date();
      hace7Dias.setDate(hoy.getDate() - 7);
      return fechaVenta >= hace7Dias;
    }
    if (filtroTiempo === 'Mes') {
      return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear();
    }
    return true;
  });

  const ventasFiltradas = ventasPorFecha.filter(v => {
    const numFacturaStr = `FAC-${String(v.id).padStart(5, '0')}`;
    return (
      numFacturaStr.toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.metodo_pago && v.metodo_pago.toLowerCase().includes(busqueda.toLowerCase()))
    );
  });

  const totalVentas = ventasFiltradas.length;
  const ingresos = ventasFiltradas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;
  const ivaRecaudado = ingresos * 0.19;

  const ingresosEfectivo = ventasFiltradas.filter(v => v.metodo_pago?.toLowerCase().includes('efectivo')).reduce((acc, v) => acc + Number(v.total), 0);
  const ingresosTarjeta = ventasFiltradas.filter(v => v.metodo_pago?.toLowerCase().includes('tarjeta')).reduce((acc, v) => acc + Number(v.total), 0);
  const ingresosTransf = ventasFiltradas.filter(v => v.metodo_pago?.toLowerCase().includes('nequi') || v.metodo_pago?.toLowerCase().includes('transf') || v.metodo_pago?.toLowerCase().includes('daviplata')).reduce((acc, v) => acc + Number(v.total), 0);

  const exportarAExcel = () => {
    if (ventasFiltradas.length === 0) return alert("No hay datos para exportar.");
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "NO. FACTURA,FECHA,METODO DE PAGO,TOTAL\n";

    ventasFiltradas.forEach(v => {
      const factura = `FAC-${String(v.id).padStart(5, '0')}`;
      const fecha = v.created_at ? new Date(v.created_at).toLocaleString() : 'N/A';
      const metodo = v.metodo_pago || 'N/A';
      const total = Number(v.total || 0);
      csvContent += `${factura},${fecha},${metodo},${total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Ventas_${filtroTiempo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <button className="btn-secondary" onClick={exportarAExcel} style={{ marginRight: '10px', color: '#16a34a', borderColor: '#16a34a' }}>
              📊 Exportar Excel
            </button>
            <button className="btn-secondary" onClick={() => window.print()}>
              ⭳ Imprimir Reporte
            </button>
            <div className="header-user" style={{marginLeft: '20px'}}>
              <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            </div>
          </div>
        </header>

        {/* Botones de Filtro Rápido */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {['Hoy', 'Semana', 'Mes', 'Todo'].map(filtro => (
            <button 
              key={filtro}
              onClick={() => setFiltroTiempo(filtro)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: filtroTiempo === filtro ? '#2563eb' : '#fff',
                color: filtroTiempo === filtro ? '#fff' : '#475569',
                cursor: 'pointer',
                fontWeight: filtroTiempo === filtro ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {filtro === 'Semana' ? 'Últimos 7 días' : filtro === 'Mes' ? 'Este Mes' : filtro === 'Todo' ? 'Histórico Completo' : 'Hoy'}
            </button>
          ))}
        </div>

        {/* 4 Tarjetas de resumen dinámicas - AHORA FORZADAS A 4 COLUMNAS */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div className="metric-card">
            <div className="metric-icon metric-icon-green">📄</div>
            <div className="metric-info">
              <h3>Ventas Totales</h3>
              <p className="metric-value">{cargando ? '...' : totalVentas}</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon metric-icon-blue">💰</div>
            <div className="metric-info">
              <h3>Ingresos Totales</h3>
              <p className="metric-value">$ {cargando ? '...' : ingresos.toLocaleString()}</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon metric-icon-blue">📈</div>
            <div className="metric-info">
              <h3>Ticket promedio</h3>
              <p className="metric-value">$ {cargando ? '...' : Math.round(ticketPromedio).toLocaleString()}</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon metric-icon-red">🏛️</div>
            <div className="metric-info">
              <h3>IVA estimado (19%)</h3>
              <p className="metric-value">$ {cargando ? '...' : Math.round(ivaRecaudado).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Desglose por Método de Pago - 3 COLUMNAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#64748b' }}>💵 Efectivo</h4>
            <strong style={{ fontSize: '1.2em', color: '#1e293b' }}>$ {ingresosEfectivo.toLocaleString()}</strong>
          </div>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#64748b' }}>💳 Tarjeta</h4>
            <strong style={{ fontSize: '1.2em', color: '#1e293b' }}>$ {ingresosTarjeta.toLocaleString()}</strong>
          </div>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#64748b' }}>📱 Transferencia (Nequi)</h4>
            <strong style={{ fontSize: '1.2em', color: '#1e293b' }}>$ {ingresosTransf.toLocaleString()}</strong>
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

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="bizly-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
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
                    <td colSpan="4" className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>No se encontraron facturas en este periodo.</td>
                  </tr>
                ) : (
                  ventasFiltradas.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#2563eb' }}>
                        FAC-{String(v.id).padStart(5, '0')}
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        {v.created_at ? new Date(v.created_at).toLocaleString() : 'Fecha no disponible'}
                      </td>
                      <td style={{ padding: '12px', color: '#475569', textTransform: 'capitalize' }}>{v.metodo_pago}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>$ {Number(v.total).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Reportes;