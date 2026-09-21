// src/components/Ventas.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import './Dashboard.css';
import './Ventas.css';

function Ventas() {
  const { usuario } = useContext(AuthContext);

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [cargando, setCargando] = useState(true);
  
  const [facturaGenerada, setFacturaGenerada] = useState(null);

  const obtenerProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/productos', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : data.productos || []);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const agregarAlCarrito = (producto) => {
    if (producto.stock_actual <= 0) {
      alert("¡Producto sin stock disponible!");
      return;
    }
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      if (existe.cantidad >= producto.stock_actual) return alert("Límite de stock en inventario.");
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > item.stock_actual) { alert("Límite de stock alcanzado."); return item; }
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }));
  };

  const eliminarItem = (id) => setCarrito(carrito.filter(item => item.id !== id));
  const totalVenta = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

  const procesarVenta = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío.");

    // AQUÍ ESTÁ EL CAMBIO CLAVE: id_usuario en lugar de id_vendedor
    const payload = {
      id_cliente: 1, 
      id_usuario: usuario?.id || 1,
      total: totalVenta,
      metodo_pago: metodoPago,
      carrito: carrito
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ventas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        setFacturaGenerada({
          // Ajustado para leer el id_venta real que retorna el backend
          numero: resData.id_venta || Math.floor(Math.random() * 1000000),
          fecha: new Date().toLocaleString(),
          cajero: `${usuario?.nombre || 'Admin'} ${usuario?.apellido || ''}`,
          items: [...carrito],
          total: totalVenta,
          metodo: metodoPago
        });
        
        setCarrito([]); 
        obtenerProductos(); 
      } else {
        // Manejo de errores detallado
        const errorData = await response.json().catch(() => ({}));
        alert(`Motivo del rechazo (Backend): ${errorData.error || errorData.mensaje || 'Datos incompletos'}`);
        console.error("Detalle del error del backend:", errorData);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const imprimirFactura = () => {
    window.print();
  };

  const productosFiltrados = Array.isArray(productos) ? productos.filter(p =>
    (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()))
  ) : [];

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', gap: '20px', position: 'relative' }}>
        
        {/* Catálogo de Productos */}
        <div style={{ flex: 2 }}>
          <header className="top-header">
            <div>
              <div className="breadcrumbs">Bizly / Ventas</div>
              <h1>Punto de Venta (POS)</h1>
            </div>
          </header>

          <div className="action-bar" style={{ marginBottom: '20px' }}>
            <div className="search-container" style={{ width: '100%' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar producto..."
                className="search-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="products-grid">
            {cargando ? <p>Cargando...</p> : productosFiltrados.map(producto => (
              <div key={producto.id} className="product-card" onClick={() => agregarAlCarrito(producto)} style={{ cursor: 'pointer', border: '1px solid #e2e8f0', opacity: producto.stock_actual === 0 ? 0.5 : 1 }}>
                <div className="product-info">
                  <h4>{producto.nombre}</h4>
                  <span className="sku">{producto.codigo}</span>
                  <div className="product-price-row" style={{ marginTop: '10px' }}>
                    <span className="price">$ {producto.precio_venta}</span>
                    <span className="stock">Stock: {producto.stock_actual}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div className="cart-panel" style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Resumen de Venta</h3>
          <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '0 0 15px 0' }}/>
          
          {carrito.length === 0 ? (
            <p style={{ textAlign: 'center', margin: '40px 0', color: '#888' }}>El carrito está vacío.</p>
          ) : (
            <div>
              <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '5px' }}>
                {carrito.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-info">
                      <span className="cart-item-title">{item.nombre}</span>
                      <span className="cart-item-price">$ {item.precio_venta} c/u</span>
                    </div>
                    <div className="cart-actions">
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => cambiarCantidad(item.id, -1)}>-</button>
                        <span className="qty-value">{item.cantidad}</span>
                        <button className="qty-btn" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                      </div>
                      <button className="btn-delete" onClick={() => eliminarItem(item.id)} title="Eliminar">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '15px 0' }}/>
              
              <select className="filter-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', marginBottom: '15px' }}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                <option value="Nequi/Daviplata">Transferencia (Nequi/Daviplata)</option>
              </select>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', fontWeight: 'bold', marginBottom: '20px' }}>
                <span>TOTAL:</span>
                <span style={{ color: '#2563eb' }}>$ {totalVenta.toLocaleString()}</span>
              </div>
              
              <button onClick={procesarVenta} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05em' }}>
                💳 Registrar y Cobrar
              </button>
            </div>
          )}
        </div>

        {/* MODAL DE FACTURA */}
        {facturaGenerada && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="ticket-impresion" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '350px', color: '#000', fontFamily: 'monospace' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
                <h2>OVER_SMART_PC</h2>
                <p style={{ margin: '5px 0' }}>NIT: 900.123.456-7</p>
                <p style={{ margin: '5px 0' }}>Factura de Venta No. {facturaGenerada.numero}</p>
                <p style={{ margin: '5px 0' }}>Fecha: {facturaGenerada.fecha}</p>
                <p style={{ margin: '5px 0' }}>Cajero: {facturaGenerada.cajero}</p>
              </div>
              
              <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9em' }}>
                  <thead>
                    <tr>
                      <th>Cant.</th>
                      <th>Producto</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturaGenerada.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.cantidad}</td>
                        <td>{item.nombre.substring(0, 15)}...</td>
                        <td style={{ textAlign: 'right' }}>$ {(item.cantidad * item.precio_venta).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ textAlign: 'right', fontSize: '1.1em', fontWeight: 'bold', marginBottom: '20px' }}>
                <p>TOTAL: $ {facturaGenerada.total.toLocaleString()}</p>
                <p style={{ fontSize: '0.8em', fontWeight: 'normal' }}>Método: {facturaGenerada.metodo}</p>
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                <button onClick={imprimirFactura} style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir</button>
                <button onClick={() => setFacturaGenerada(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Ventas;