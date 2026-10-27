// src/components/Ventas.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { EmpresaContext } from '../context/EmpresaContext';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css';
import '../styles_components/Ventas.css';

const CLIENTE_GENERICO = {
  id: 'generico', 
  nombre: 'Consumidor',
  apellido: 'Final',
  documento: '2222222222',
  telefono: '',
  direccion: ''
};

function Ventas() {
  const { usuario } = useContext(AuthContext);
  const { nombreEmpresa } = useContext(EmpresaContext);

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [cargando, setCargando] = useState(true);

  const [clientes, setClientes] = useState([]);
  // Aseguramos que el ID inicial sea String
  const [idCliente, setIdCliente] = useState(String(CLIENTE_GENERICO.id)); 
  const [buscaCliente, setBuscaCliente] = useState('');

  const [facturaGenerada, setFacturaGenerada] = useState(null);

  const clienteActual = clientes.find(c => String(c.id) === String(idCliente)) || CLIENTE_GENERICO;

  const nombreCliente = (c) =>
    [c.nombre, c.apellido].filter(Boolean).join(' ').trim() || c.razon_social || c.nombre_completo || 'Sin nombre';

  const documentoCliente = (c) => c.documento || c.nit || c.cedula || c.identificacion || '';

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

  const obtenerClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/clientes', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        let lista = Array.isArray(data) ? data : data.clientes || [];
        
        // 1. Buscamos en qué posición está el consumidor final real
        const indexCF = lista.findIndex(c => String(documentoCliente(c)) === '2222222222');
        
        if (indexCF !== -1) {
          // 2. Lo extraemos de la lista
          const consumidorFinalDB = lista[indexCF];
          lista.splice(indexCF, 1);
          // 3. Lo ponemos al inicio (posición 0)
          lista.unshift(consumidorFinalDB);
          
          setClientes(lista);
          // 4. Forzamos String para que el <select> de React haga match perfecto
          setIdCliente(String(consumidorFinalDB.id)); 
        } else {
          setClientes([CLIENTE_GENERICO, ...lista]);
          setIdCliente(String(CLIENTE_GENERICO.id));
        }
      } else {
        setClientes([CLIENTE_GENERICO]);
        setIdCliente(String(CLIENTE_GENERICO.id));
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientes([CLIENTE_GENERICO]);
      setIdCliente(String(CLIENTE_GENERICO.id));
    }
  };

  useEffect(() => {
    obtenerProductos();
    obtenerClientes();
  }, []);

  const handleBuscarCliente = (e) => {
    const texto = e.target.value;
    setBuscaCliente(texto);

    const filtrados = clientes.filter(c => {
      const busquedaTexto = `${nombreCliente(c)} ${documentoCliente(c)}`.toLowerCase();
      return busquedaTexto.includes(texto.toLowerCase());
    });

    if (filtrados.length > 0) {
      setIdCliente(String(filtrados[0].id));
    } else {
      setIdCliente(''); 
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const texto = `${nombreCliente(c)} ${documentoCliente(c)}`.toLowerCase();
    return texto.includes(buscaCliente.toLowerCase());
  });

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
    if (!idCliente) return alert("Elige un cliente antes de cobrar.");

    const payload = {
      id_cliente: isNaN(Number(idCliente)) ? 1 : Number(idCliente),
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
        
        const numeroFactura = resData.id_venta 
          ? String(resData.id_venta).padStart(6, '0') 
          : String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

        setFacturaGenerada({
          numero: numeroFactura,
          fecha: new Date().toLocaleString(),
          cajero: `${usuario?.nombre || 'Admin'} ${usuario?.apellido || ''}`,
          cliente: {
            nombre: nombreCliente(clienteActual),
            documento: documentoCliente(clienteActual),
            telefono: clienteActual.telefono || '',
            direccion: clienteActual.direccion || ''
          },
          items: [...carrito],
          total: totalVenta,
          metodo: metodoPago
        });

        // REINICIAR AL CONSUMIDOR FINAL DESPUÉS DE LA VENTA
        setCarrito([]);
        const consumidorFinalDB = clientes.find(c => String(documentoCliente(c)) === '2222222222');
        setIdCliente(consumidorFinalDB ? String(consumidorFinalDB.id) : String(CLIENTE_GENERICO.id));
        
        setBuscaCliente('');
        obtenerProductos();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Motivo del rechazo (Backend): ${errorData.error || errorData.mensaje || 'Datos incompletos'}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
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
          <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '0 0 15px 0' }} />

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85em', color: '#64748b', marginBottom: '6px' }}>
              Cliente de esta venta
            </label>

            {clientes.length > 8 && (
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre o documento..."
                value={buscaCliente}
                onChange={handleBuscarCliente}
                onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} 
                style={{ width: '100%', marginBottom: '8px', padding: '8px' }}
              />
            )}

            <select
              className="filter-select"
              value={String(idCliente)} /* Forzamos String aquí también */
              onChange={(e) => setIdCliente(e.target.value)}
              style={{ width: '100%' }}
            >
              {clientesFiltrados.length === 0 && <option value="">Sin resultados</option>}
              {clientesFiltrados.map(c => (
                <option key={c.id} value={c.id}>
                  {nombreCliente(c)}{documentoCliente(c) ? ` — ${documentoCliente(c)}` : ''}
                </option>
              ))}
            </select>

            <div style={{ fontSize: '0.8em', color: '#475569', marginTop: '6px' }}>
              Se facturará a <strong>{nombreCliente(clienteActual)}</strong>
              {documentoCliente(clienteActual) ? ` (${documentoCliente(clienteActual)})` : ''}
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '0 0 15px 0' }} />

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

              <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '15px 0' }} />

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
                <h2>{nombreEmpresa}</h2>
                <p style={{ margin: '5px 0' }}>NIT: 900.123.456-7</p>
                <p style={{ margin: '5px 0' }}>Factura de Venta No. {facturaGenerada.numero}</p>
                <p style={{ margin: '5px 0' }}>Fecha: {facturaGenerada.fecha}</p>
                <p style={{ margin: '5px 0' }}>Cajero: {facturaGenerada.cajero}</p>
              </div>

              <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px', fontSize: '0.9em' }}>
                <p style={{ margin: '3px 0' }}>Cliente: {facturaGenerada.cliente.nombre}</p>
                {facturaGenerada.cliente.documento && (
                  <p style={{ margin: '3px 0' }}>Doc: {facturaGenerada.cliente.documento}</p>
                )}
                {facturaGenerada.cliente.telefono && (
                  <p style={{ margin: '3px 0' }}>Tel: {facturaGenerada.cliente.telefono}</p>
                )}
                {facturaGenerada.cliente.direccion && (
                  <p style={{ margin: '3px 0' }}>Dir: {facturaGenerada.cliente.direccion}</p>
                )}
              </div>

              <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9em', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Cant.</th>
                      <th style={{ width: '60%' }}>Producto</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturaGenerada.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ verticalAlign: 'top' }}>{item.cantidad}</td>
                        <td style={{ wordBreak: 'break-word', paddingRight: '10px' }}>
                          {item.nombre}
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>$ {(item.cantidad * item.precio_venta).toLocaleString()}</td>
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
                <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir</button>
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