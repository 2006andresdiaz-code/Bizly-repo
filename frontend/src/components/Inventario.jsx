// src/components/Inventario.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import '../styles_components/Inventario.css'; 

function Inventario() {
  const { usuario } = useContext(AuthContext);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado para identificar si estamos editando un producto existente
  const [idProductoEditando, setIdProductoEditando] = useState(null);

  // Estados para búsqueda y filtros interactivos
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [filtroStock, setFiltroStock] = useState('todos');

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre: '',
    codigo: '',
    id_categoria: '',
    precio_venta: '',
    stock_actual: ''
  });

  const categoriasDB = [
    { id: 1, nombre: "Abarrotes" },
    { id: 2, nombre: "Lácteos y refrigerados" },
    { id: 3, nombre: "Bebidas" },
    { id: 4, nombre: "Aseo y hogar" },
    { id: 5, nombre: "Cuidado personal" }
  ];

  const cargarInventario = async () => {
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
      console.error('Error al conectar con el backend:', error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  // Abrir modal para Crear nuevo producto
  const abrirModalCrear = () => {
    setIdProductoEditando(null);
    setFormulario({ nombre: '', codigo: '', id_categoria: '', precio_venta: '', stock_actual: '' });
    setModalAbierto(true);
  };

  // Abrir modal para Editar un producto existente
  const abrirModalEditar = (producto) => {
    const idReal = producto.id || producto.id_producto;
    if (!idReal) {
      alert("Error: El producto no tiene un ID válido.");
      return;
    }

    setIdProductoEditando(idReal);
    setFormulario({
      nombre: producto.nombre || '',
      codigo: producto.codigo || '',
      id_categoria: producto.id_categoria || '',
      precio_venta: producto.precio_venta || '',
      stock_actual: producto.stock_actual || ''
    });
    setModalAbierto(true);
  };

  // Guardar producto (POST para nuevo, PUT para editar)
  const guardarProducto = async () => {
    if (!formulario.nombre || !formulario.codigo || !formulario.id_categoria || !formulario.precio_venta || !formulario.stock_actual) {
      alert("Por favor, llena todos los campos obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = idProductoEditando 
        ? `http://localhost:5000/api/productos/${idProductoEditando}` 
        : 'http://localhost:5000/api/productos';
      
      const metodo = idProductoEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formulario)
      });

      if (response.ok) {
        alert(idProductoEditando ? "¡Producto actualizado exitosamente!" : "¡Producto guardado exitosamente!");
        setModalAbierto(false); 
        setIdProductoEditando(null);
        setFormulario({ nombre: '', codigo: '', id_categoria: '', precio_venta: '', stock_actual: '' }); 
        cargarInventario(); 
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al guardar: ${errData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  // Desactivar / Eliminar producto conectado a MySQL
  const desactivarProducto = async (producto) => {
    const idReal = producto.id || producto.id_producto;
    if (!idReal) {
      alert("Error: No se pudo identificar el ID del producto.");
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas desactivar el producto "${producto.nombre}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/productos/${idReal}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        alert("Producto desactivado correctamente.");
        cargarInventario(); 
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`No se pudo desactivar el producto: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Error de conexión al eliminar producto:", error);
    }
  };

  const totalProductos = Array.isArray(productos) ? productos.length : 0;
  const stockBajoCount = Array.isArray(productos) ? productos.filter(p => p.stock_actual <= p.stock_minimo).length : 0;

  const productosFiltrados = Array.isArray(productos) ? productos.filter(producto => {
    const textoMatch = 
      (producto.nombre && producto.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (producto.codigo && producto.codigo.toLowerCase().includes(busqueda.toLowerCase()));

    const categoriaMatch = 
      categoriaSeleccionada === 'Todas' || producto.id_categoria.toString() === categoriaSeleccionada.toString();

    let stockMatch = true;
    if (filtroStock === 'bajo') {
      stockMatch = producto.stock_actual <= producto.stock_minimo;
    }

    return textoMatch && categoriaMatch && stockMatch;
  }) : [];

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Inventario</div>
            <h1>Inventario</h1>
            <p className="subtitle">{totalProductos} productos · {stockBajoCount} con stock bajo</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">⭳ Importar CSV</button>
            <button className="btn-primary" onClick={abrirModalCrear}>
              + Nuevo producto
            </button>
            <div className="header-user" style={{marginLeft: '20px'}}>
              <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            </div>
          </div>
        </header>

        {stockBajoCount > 0 && (
          <div 
            className="alert-warning" 
            onClick={() => setFiltroStock(filtroStock === 'bajo' ? 'todos' : 'bajo')}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            title="Haz clic para alternar el filtro de stock bajo"
          >
            ⚠️ {stockBajoCount} producto(s) con stock bajo o agotado.
          </div>
        )}

        <div className="action-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o SKU..." 
              className="search-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="Todas">Todas las categorías</option>
            {categoriasDB.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
          >
            <option value="todos">Todo el stock</option>
            <option value="bajo">Stock bajo</option>
          </select>
        </div>

        <div className="products-grid">
          {cargando ? (
            <p>Cargando inventario...</p>
          ) : productosFiltrados.length === 0 ? (
            <p>No se encontraron productos que coincidan con la búsqueda.</p>
          ) : (
            productosFiltrados.map((producto) => {
              let claseStockCard = '';
              if (producto.stock_actual === 0) {
                claseStockCard = 'card-agotado';
              } else if (producto.stock_actual <= producto.stock_minimo) {
                claseStockCard = 'card-stock-bajo';
              }

              return (
                <div className={`product-card ${claseStockCard}`} key={producto.id}>
                  <div className="product-image-placeholder">📦</div>
                  <div className="product-info">
                    <h4>{producto.nombre}</h4>
                    <span className="sku">Código: {producto.codigo}</span>
                    <span className="category-tag">Categoría ID: {producto.id_categoria}</span>
                    <div className="product-price-row">
                      <span className="price">$ {producto.precio_venta}</span>
                      <span className={`stock ${producto.stock_actual <= producto.stock_minimo ? 'low-stock' : ''}`}>
                        {producto.stock_actual} {producto.unidad_medida || 'und.'} {producto.stock_actual === 0 ? '(Agotado)' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className="btn-action" onClick={() => abrirModalEditar(producto)}>✎ Editar</button>
                    <button className="btn-action danger" onClick={() => desactivarProducto(producto)}>🗑 Desactivar</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal para Crear y Editar */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{idProductoEditando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="close-btn" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="input-row">
                <div className="input-group">
                  <label>Nombre del producto <span>*</span></label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={formulario.nombre} 
                    onChange={manejarCambio} 
                    placeholder="Ej. Café Molido 500g" 
                  />
                </div>
                <div className="input-group">
                  <label>SKU (Código) <span>*</span></label>
                  <input 
                    type="text" 
                    name="codigo" 
                    value={formulario.codigo} 
                    onChange={manejarCambio} 
                    placeholder="Ej. ABA-002" 
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label>Categoría <span>*</span></label>
                <select name="id_categoria" value={formulario.id_categoria} onChange={manejarCambio}>
                  <option value="">Seleccione una categoría...</option>
                  {categoriasDB.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Precio de venta ($) <span>*</span></label>
                  <input 
                    type="number" 
                    name="precio_venta" 
                    value={formulario.precio_venta} 
                    onChange={manejarCambio} 
                    placeholder="0" 
                  />
                </div>
                <div className="input-group">
                  <label>Stock inicial <span>*</span></label>
                  <input 
                    type="number" 
                    name="stock_actual" 
                    value={formulario.stock_actual} 
                    onChange={manejarCambio} 
                    placeholder="0" 
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarProducto}>
                {idProductoEditando ? 'Actualizar cambios' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;