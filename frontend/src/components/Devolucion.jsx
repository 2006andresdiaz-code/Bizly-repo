// src/components/Devolucion.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { EmpresaContext } from '../context/EmpresaContext';
import Sidebar from './Sidebar';
import '../styles_components/Devolucion.css'; 

const Devolucion = () => {
  const { usuario } = useContext(AuthContext) || {};
  const { nombreEmpresa } = useContext(EmpresaContext) || {};

  const [formData, setFormData] = useState({
    id_venta: '',
    id_producto: '',
    cantidad: 1,
    motivo: '',
    monto_reembolso: '',
    dar_de_baja: 'no' 
  });

  const [productosVenta, setProductosVenta] = useState([]);
  const [precioProducto, setPrecioProducto] = useState(0);
  const [maxCantidad, setMaxCantidad] = useState(1); 
  const [ticketDevolucion, setTicketDevolucion] = useState(null);

  useEffect(() => {
    if (precioProducto > 0 && formData.cantidad > 0) {
      const total = (precioProducto * formData.cantidad).toFixed(2);
      setFormData(prev => ({ ...prev, monto_reembolso: total }));
    } else {
      setFormData(prev => ({ ...prev, monto_reembolso: '' }));
    }
  }, [precioProducto, formData.cantidad]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cantidad' && value > maxCantidad) {
      alert(`Solo puedes devolver un máximo de ${maxCantidad} unidades de este producto.`);
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const buscarDetalleVenta = async () => {
    if (!formData.id_venta) return;

    try {
      const response = await fetch(`http://localhost:5000/api/ventas/${formData.id_venta}/productos`);
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setProductosVenta(data);
      } else if (response.status === 400) {
        alert(`⚠️ ${data.mensaje}`);
        setProductosVenta([]);
        setPrecioProducto(0);
      } else {
        alert('⚠️ No se encontró la factura.');
        setProductosVenta([]);
        setPrecioProducto(0);
      }
    } catch (error) {
      console.error('Error buscando la factura:', error);
    }
  };

  const handleProductoSelect = (e) => {
    const idProd = e.target.value;
    const producto = productosVenta.find(p => p.id_producto.toString() === idProd);
    
    if (producto) {
      setPrecioProducto(producto.precio);
      setMaxCantidad(producto.cantidad);
      setFormData({ ...formData, id_producto: idProd, cantidad: 1 });
    } else {
      setPrecioProducto(0);
      setMaxCantidad(1);
      setFormData({ ...formData, id_producto: '', cantidad: 1 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      dar_de_baja: formData.dar_de_baja === 'si'
    };

    try {
      const response = await fetch('http://localhost:5000/api/devoluciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert(`✅ ${data.mensaje || 'El ajuste de devolución se realizó con éxito.'}`);
        
        const prodDevuelto = productosVenta.find(p => p.id_producto.toString() === formData.id_producto) || {};
        
        const saldoProductos = productosVenta.map(p => {
          if (p.id_producto.toString() === formData.id_producto) {
            return { ...p, cantidad: p.cantidad - Number(formData.cantidad) };
          }
          return p;
        }).filter(p => p.cantidad > 0); 

        setTicketDevolucion({
          num_comprobante: data?.ticket?.num_comprobante || String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
          num_factura_origen: formData.id_venta,
          fecha: new Date().toLocaleString(),
          cajero: `${usuario?.nombre || 'Admin'} ${usuario?.apellido || ''}`,
          cliente: data?.ticket?.cliente || { nombre: 'Consumidor', documento: '', telefono: '', direccion: '' },
          item_devuelto: {
            nombre: prodDevuelto.nombre_producto || 'Producto devuelto',
            cantidad: formData.cantidad,
            reembolso: formData.monto_reembolso
          },
          motivo: formData.motivo,
          dado_de_baja: formData.dar_de_baja === 'si',
          items_restantes: saldoProductos
        });

        setFormData({ id_venta: '', id_producto: '', cantidad: 1, motivo: '', monto_reembolso: '', dar_de_baja: 'no' });
        setProductosVenta([]);
        setPrecioProducto(0);
        setMaxCantidad(1);
      } else {
        alert(`❌ Error al procesar: ${data.error || 'Revisa los datos'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('❌ Error crítico: No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />

      <main className="main-content" style={{ position: 'relative' }}>
        
        <div className="page-header">
          <div className="breadcrumbs">Bizly / Devoluciones</div>
          <h1>Registro de Devoluciones</h1>
          <p className="subtitle">Ingresa los datos para procesar el reembolso y generar la nota de crédito.</p>
        </div>

        <div className="devolucion-card">
          <form onSubmit={handleSubmit} className="devolucion-form">
            
            <div className="form-row">
              <div className="form-group">
                <label>ID de la Venta (Factura): <span>*</span></label>
                <input 
                  type="text" 
                  name="id_venta" 
                  className="bizly-input" 
                  value={formData.id_venta} 
                  onChange={handleChange} 
                  onBlur={buscarDetalleVenta}
                  placeholder="Ej: FAC-000008"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Producto a devolver: <span>*</span></label>
                <select 
                  name="id_producto" 
                  className="bizly-input" 
                  value={formData.id_producto} 
                  onChange={handleProductoSelect} 
                  required
                  disabled={productosVenta.length === 0}
                >
                  <option value="">Selecciona un producto...</option>
                  {productosVenta.map((prod) => (
                    <option key={prod.id_producto} value={prod.id_producto}>
                      {prod.nombre_producto} (Disponibles: {prod.cantidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cantidad a devolver (Máx {maxCantidad}): <span>*</span></label>
                <input 
                  type="number" 
                  name="cantidad" 
                  className="bizly-input" 
                  value={formData.cantidad} 
                  onChange={handleChange} 
                  min="1" 
                  max={maxCantidad}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Monto a reembolsar ($): <span>*</span></label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="monto_reembolso" 
                  className="bizly-input" 
                  value={formData.monto_reembolso} 
                  readOnly 
                  style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Estado del producto post-devolución: <span>*</span></label>
              <select 
                name="dar_de_baja" 
                className="bizly-input" 
                value={formData.dar_de_baja} 
                onChange={handleChange}
              >
                <option value="no">Buen estado (Regresa a inventario para venta)</option>
                <option value="si">Dañado / Defectuoso (Dar de baja)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Motivo de la devolución: <span>*</span></label>
              <textarea 
                name="motivo" 
                className="bizly-input textarea-motivo" 
                value={formData.motivo} 
                onChange={handleChange} 
                rows="3" 
                required 
              />
            </div>

            <button type="submit" className="btn-primary-dev">
              Procesar Devolución
            </button>
          </form>
        </div>

        {/* MODAL DE LA FACTURA DE DEVOLUCIÓN A PRUEBA DE FALLOS */}
        {ticketDevolucion && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="ticket-impresion" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '380px', color: '#000', fontFamily: 'monospace' }}>
              
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
                <h2>{nombreEmpresa || 'PlugStore'}</h2>
                <p style={{ margin: '5px 0' }}>NIT: 900.123.456-7</p>
                <p style={{ margin: '5px 0' }}><strong>FACTURA DE DEVOLUCIÓN No. {ticketDevolucion?.num_comprobante}</strong></p>
                <p style={{ margin: '5px 0' }}>Fac. Afectada: {ticketDevolucion?.num_factura_origen}</p>
                <p style={{ margin: '5px 0' }}>Fecha: {ticketDevolucion?.fecha}</p>
                <p style={{ margin: '5px 0' }}>Cajero: {ticketDevolucion?.cajero}</p>
              </div>

              <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px', fontSize: '0.9em' }}>
                <p style={{ margin: '3px 0' }}>Cliente: {ticketDevolucion?.cliente?.nombre}</p>
                {ticketDevolucion?.cliente?.documento && <p style={{ margin: '3px 0' }}>Doc: {ticketDevolucion.cliente.documento}</p>}
                {ticketDevolucion?.cliente?.telefono && <p style={{ margin: '3px 0' }}>Tel: {ticketDevolucion.cliente.telefono}</p>}
                {ticketDevolucion?.cliente?.direccion && <p style={{ margin: '3px 0' }}>Dir: {ticketDevolucion.cliente.direccion}</p>}
              </div>

              {/* Producto Devuelto */}
              <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '0.9em' }}>DETALLE DE DEVOLUCIÓN</p>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9em', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Cant.</th>
                      <th style={{ width: '60%' }}>Producto</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>-{ticketDevolucion?.item_devuelto?.cantidad}</td>
                      {/* ESTE ES EL CAMBIO PARA DEVOLUCIÓN */}
                      <td style={{ wordBreak: 'break-word', paddingRight: '10px' }}>
                        {ticketDevolucion?.item_devuelto?.nombre}
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'top' }}>-$ {Number(ticketDevolucion?.item_devuelto?.reembolso).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Productos Restantes (Muestra lo que le queda válido al cliente) */}
              {ticketDevolucion?.items_restantes?.length > 0 && (
                <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '0.9em' }}>SALDO DE PRODUCTOS EN FACTURA</p>
                  <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9em', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '15%' }}>Cant.</th>
                        <th style={{ width: '60%' }}>Producto</th>
                        <th style={{ width: '25%', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketDevolucion.items_restantes.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ verticalAlign: 'top' }}>{item.cantidad}</td>
                          {/* ESTE ES EL CAMBIO PARA LOS RESTANTES */}
                          <td style={{ wordBreak: 'break-word', paddingRight: '10px' }}>
                            {item.nombre_producto}
                          </td>
                          <td style={{ textAlign: 'right', verticalAlign: 'top' }}>$ {(item.cantidad * item.precio).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ textAlign: 'right', fontSize: '1.1em', fontWeight: 'bold', marginBottom: '20px' }}>
                <p style={{ color: '#ef4444' }}>REEMBOLSO TOTAL: $ {Number(ticketDevolucion?.item_devuelto?.reembolso).toLocaleString()}</p>
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir</button>
                <button onClick={() => setTicketDevolucion(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Devolucion;