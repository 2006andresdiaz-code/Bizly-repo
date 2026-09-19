// src/components/Ventas.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import './Dashboard.css';
import './Ventas.css';

function Ventas() {
  const { usuario } = useContext(AuthContext);

  // Estados de productos y carrito
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [cargando, setCargando] = useState(true);

  // 1. Cargar productos desde el Backend con Token JWT
  const obtenerProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/productos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : data.productos || []);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al obtener productos para venta:', error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // 2. Agregar un producto al Carrito
  const agregarAlCarrito = (producto) => {
    if (producto.stock_actual <= 0) {
      alert("¡Producto sin stock disponible!");
      return;
    }

    const existe = carrito.find(item => item.id === producto.id);

    if (existe) {
      if (existe.cantidad >= producto.stock_actual) {
        alert("No puedes vender más unidades de las disponibles en inventario.");
        return;
      }
      setCarrito(carrito.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // 3. Modificar cantidad en el Carrito
  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > item.stock_actual) {
          alert("Límite de stock alcanzado.");
          return item;
        }
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }));
  };

  // 4. Eliminar del Carrito
  const eliminarItem = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // 5. Cálculos de dinero
  const totalVenta = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

  // 6. Enviar la venta al Backend con Token JWT
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío. Agrega al menos un producto.");
      return;
    }

    const payload = {
      id_cliente: 1, // Cliente general por defecto
      id_vendedor: usuario?.id || 1,
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
        alert(`¡Venta #${resData.numero_factura || 'registrada'} registrada con éxito!`);
        setCarrito([]); // Limpiar carrito
        obtenerProductos(); // Recargar inventario para ver el stock actualizado
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al procesar la venta: ${errData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error al registrar la venta:", error);
    }
  };

  // Filtro de búsqueda seguro
  const productosFiltrados = Array.isArray(productos) ? productos.filter(p =>
    (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()))
  ) : [];

  return (
    <div className="admin-container">
      <Sidebar />

      <main className="main-content" style={{ display: 'flex', gap: '20px' }}>
        
        {/* Catálogo de Productos (Izquierda) */}
        <div style={{ flex: 2 }}>
          <header className="top-header">
            <div>
              <div className="breadcrumbs">Bizly / Ventas</div>
              <h1>Punto de Venta (POS)</h1>
            </div>
            <div className="header-user">
              <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            </div>
          </header>

          <div className="action-bar" style={{ marginBottom: '20px' }}>
            <div className="search-container" style={{ width: '100%' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                className="search-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="products-grid">
            {cargando ? (
              <p>Cargando productos...</p>
            ) : productosFiltrados.length === 0 ? (
              <p>No se encontraron productos disponibles.</p>
            ) : (
              productosFiltrados.map(producto => {
                let estiloStockCard = { cursor: 'pointer', border: '1px solid #e2e8f0' };
                if (producto.stock_actual === 0) {
                  estiloStockCard = { cursor: 'pointer', border: '2px solid #ef4444', backgroundColor: '#fef2f2' };
                } else if (producto.stock_actual <= producto.stock_minimo) {
                  estiloStockCard = { cursor: 'pointer', border: '2px solid #f59e0b', backgroundColor: '#fffbeb' };
                }

                return (
                  <div 
                    key={producto.id} 
                    className="product-card"
                    onClick={() => agregarAlCarrito(producto)}
                    style={estiloStockCard}
                  >
                    <div className="product-info">
                      <h4>{producto.nombre}</h4>
                      <span className="sku">Código: {producto.codigo}</span>
                      <div className="product-price-row" style={{ marginTop: '10px' }}>
                        <span className="price">$ {producto.precio_venta}</span>
                        <span className={`stock ${producto.stock_actual <= producto.stock_minimo ? 'low-stock' : ''}`} style={{ fontWeight: 'bold' }}>
                          Stock: {producto.stock_actual} {producto.stock_actual === 0 ? '(Agotado)' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Carrito y Facturación (Derecha) */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3>Resumen de Venta</h3>
          <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />

          {carrito.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', margin: '40px 0' }}>El carrito está vacío. Haz clic en un producto para agregarlo.</p>
          ) : (
            <div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {carrito.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f5f5f5', paddingBottom: '8px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9em' }}>{item.nombre}</strong>
                      <span style={{ fontSize: '0.8em', color: '#666' }}>$ {item.precio_venta} c/u</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => cambiarCantidad(item.id, -1)} className="btn-secondary" style={{ padding: '2px 8px' }}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.id, 1)} className="btn-secondary" style={{ padding: '2px 8px' }}>+</button>
                      <button onClick={() => eliminarItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>

              <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Método de Pago:</label>
                <select 
                  value={metodoPago} 
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                  <option value="Nequi/Daviplata">Transferencia (Nequi/Daviplata)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', fontWeight: 'bold', marginBottom: '20px' }}>
                <span>TOTAL:</span>
                <span style={{ color: '#2563eb' }}>$ {totalVenta.toLocaleString()}</span>
              </div>

              <button 
                onClick={procesarVenta} 
                className="btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '1.1em' }}
              >
                💳 Registrar y Cobrar
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Ventas;