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
  const [idProductoEditando, setIdProductoEditando] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [filtroStock, setFiltroStock] = useState('todos');

  const estadoInicialForm = {
    codigo: '',
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    precio_compra: '',
    stock_actual: '',
    stock_minimo: 5,
    unidad_medida: 'unidad',
    tipo_control: 'ESTANDAR',
    numero_serie: '',
    ficha_tecnica: {}
  };
  
  const [formulario, setFormulario] = useState(estadoInicialForm);

  const categoriasDB = [
    { id: 1, nombre: "Abarrotes / General" },
    { id: 2, nombre: "Lácteos y refrigerados" },
    { id: 3, nombre: "Bebidas" },
    { id: 4, nombre: "Aseo y hogar" },
    { id: 5, nombre: "Cuidado personal" },
    { id: 6, nombre: "Tecnología / Repuestos" }
  ];

  const cargarInventario = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/productos', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarInventario(); }, []);

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleFichaTecnicaChange = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      ficha_tecnica: { ...prev.ficha_tecnica, [campo]: valor }
    }));
  };

  const abrirModalCrear = () => {
    setIdProductoEditando(null);
    setFormulario(estadoInicialForm);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setIdProductoEditando(producto.id);
    setFormulario({
      codigo: producto.codigo || '',
      nombre: producto.nombre || '',
      id_categoria: producto.id_categoria || '',
      precio_venta: producto.precio_venta || '',
      precio_compra: producto.precio_compra || '',
      stock_actual: producto.stock_actual || '',
      stock_minimo: producto.stock_minimo || 5,
      unidad_medida: producto.unidad_medida || 'unidad',
      tipo_control: producto.tipo_control || 'ESTANDAR',
      numero_serie: producto.numero_serie || '',
      ficha_tecnica: producto.ficha_tecnica || {}
    });
    setModalAbierto(true);
  };

  const guardarProducto = async () => {
    if (!formulario.nombre || !formulario.codigo || !formulario.id_categoria || !formulario.precio_venta) {
      alert("Por favor, llena los campos obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = idProductoEditando ? `http://localhost:5000/api/productos/${idProductoEditando}` : 'http://localhost:5000/api/productos';
      const response = await fetch(url, {
        method: idProductoEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({...formulario, created_by: usuario?.id})
      });

      if (response.ok) {
        alert(idProductoEditando ? "Actualizado exitosamente" : "Guardado exitosamente");
        setModalAbierto(false); 
        cargarInventario(); 
      } else {
        const err = await response.json().catch(()=>({}));
        alert(`Error: ${err.error || err.mensaje}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const desactivarProducto = async (producto) => {
    if (!window.confirm(`¿Desactivar "${producto.nombre}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/productos/${producto.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) cargarInventario(); 
    } catch (error) { console.error(error); }
  };

  const productosFiltrados = productos.filter(producto => {
    const textoMatch = (producto.nombre?.toLowerCase().includes(busqueda.toLowerCase())) ||
                       (producto.codigo?.toLowerCase().includes(busqueda.toLowerCase()));
    const categoriaMatch = categoriaSeleccionada === 'Todas' || String(producto.id_categoria) === String(categoriaSeleccionada);
    const stockMatch = filtroStock === 'bajo' ? producto.stock_actual <= (producto.stock_minimo || 5) : true;
    return textoMatch && categoriaMatch && stockMatch;
  });

  const stockBajoCount = productos.filter(p => p.stock_actual <= (p.stock_minimo || 5)).length;

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main-content">
        
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Inventario</div>
            <h1>Inventario</h1>
            <p className="subtitle">{productos.length} productos · {stockBajoCount} con stock bajo</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">⭳ Importar CSV</button>
            <button className="btn-primary" onClick={abrirModalCrear}>+ Nuevo producto</button>
            <div className="header-user" style={{marginLeft: '20px'}}>
              <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            </div>
          </div>
        </header>

        {stockBajoCount > 0 && (
          <div className="alert-warning" onClick={() => setFiltroStock(filtroStock === 'bajo' ? 'todos' : 'bajo')} style={{ cursor: 'pointer' }}>
            ⚠️ {stockBajoCount} producto(s) con stock bajo o agotado.
          </div>
        )}

        <div className="action-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar por nombre o SKU..." className="search-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <select className="filter-select" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
            <option value="Todas">Todas las categorías</option>
            {categoriasDB.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
          <select className="filter-select" value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)}>
            <option value="todos">Todo el stock</option>
            <option value="bajo">Stock bajo</option>
          </select>
        </div>

        <div className="products-grid">
          {cargando ? <p>Cargando...</p> : productosFiltrados.map((producto) => (
            <div className="product-card" key={producto.id}>
              <div className="product-image-placeholder">
                📦
                <span className={`badge-tipo badge-${producto.tipo_control?.toLowerCase() || 'estandar'}`}>
                  {producto.tipo_control || 'ESTANDAR'}
                </span>
              </div>
              <div className="product-info">
                <h4>{producto.nombre}</h4>
                <span className="sku">Código: {producto.codigo}</span>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <span className="category-tag">{producto.categoria || `Cat: ${producto.id_categoria}`}</span>
                </div>
                <div className="product-price-row">
                  <span className="price">$ {producto.precio_venta}</span>
                  <span className={`stock ${producto.stock_actual <= (producto.stock_minimo||5) ? 'low-stock' : ''}`}>
                    {producto.stock_actual} {producto.unidad_medida}
                  </span>
                </div>
              </div>
              <div className="product-actions">
                <button className="btn-action" onClick={() => abrirModalEditar(producto)}>✎ Editar</button>
                <button className="btn-action danger" onClick={() => desactivarProducto(producto)}>🗑 Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{idProductoEditando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="close-btn" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="input-row">
                <div className="input-group">
                  <label>Nombre del producto <span>*</span></label>
                  <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} placeholder="Ej. Moto Eléctrica / Yogurt Fresa" required />
                </div>
                <div className="input-group">
                  <label>SKU (Código) <span>*</span></label>
                  <input type="text" name="codigo" value={formulario.codigo} onChange={manejarCambio} placeholder="Ej. MOT-001 o YOG-002" required />
                </div>
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Categoría <span>*</span></label>
                  <select name="id_categoria" value={formulario.id_categoria} onChange={manejarCambio} required>
                    <option value="">Seleccione una categoría...</option>
                    {categoriasDB.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Unidad de medida</label>
                  <select name="unidad_medida" value={formulario.unidad_medida} onChange={manejarCambio}>
                    <option value="unidad">Unidad (und.)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="litro">Litro (L)</option>
                    <option value="libra">Libra (lb)</option>
                  </select>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Precio de venta ($) <span>*</span></label>
                  <input type="number" step="0.01" name="precio_venta" value={formulario.precio_venta} onChange={manejarCambio} placeholder="0" required />
                </div>
                <div className="input-group">
                  <label>Stock inicial <span>*</span></label>
                  <input type="number" name="stock_actual" value={formulario.stock_actual} onChange={manejarCambio} placeholder="0" required />
                </div>
              </div>

              {/* Clasificación Operativa */}
              <div className="input-group" style={{ marginTop: '15px' }}>
                <label>Clasificación Operativa (Trazabilidad) <span>*</span></label>
                <select name="tipo_control" value={formulario.tipo_control} onChange={manejarCambio} style={{ backgroundColor: '#f8fafc', fontWeight: '500', color: '#334155' }}>
                  <option value="ESTANDAR">📦 Estándar (Sin requisitos especiales)</option>
                  <option value="SERIALIZADO">🛵 Serializado (Motos, Tecnología, Maquinaria, Repuestos)</option>
                  <option value="LOTE_PERECEDERO">🥛 Lote Perecedero (Lácteos, Alimentos, Refrigerados)</option>
                  <option value="GRANEL">🌾 Granel / Presentación (Arroz, Granos, Azúcar)</option>
                </select>
              </div>

              {/* Ficha Técnica Dinámica - Serializado */}
              {formulario.tipo_control === 'SERIALIZADO' && (
                <div className="ficha-tecnica-box" style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                  <h4 style={{ color: '#475569', fontSize: '13px', marginBottom: '15px' }}>
                    🛵 Ficha Técnica: Producto Serializado / Vehículo / Maquinaria
                  </h4>
                  
                  <div className="input-row">
                    <div className="input-group">
                      <label>Marca <span>*</span></label>
                      <input type="text" value={formulario.ficha_tecnica?.marca || ''} onChange={(e) => handleFichaTecnicaChange('marca', e.target.value)} placeholder="Ej. Auteco, Caterpillar, Sony" />
                    </div>
                    <div className="input-group">
                      <label>Modelo / Referencia</label>
                      <input type="text" value={formulario.ficha_tecnica?.modelo || ''} onChange={(e) => handleFichaTecnicaChange('modelo', e.target.value)} placeholder="Ej. E-City 2026 / PC200" />
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label>Número de Serie / Placa / Chasis</label>
                      <input type="text" name="numero_serie" value={formulario.numero_serie} onChange={manejarCambio} placeholder="Ej. SERIE-847294 o PLACA-X" />
                    </div>
                    <div className="input-group">
                      <label>Tipo de motorización</label>
                      <select value={formulario.ficha_tecnica?.tipo_motorizacion || ''} onChange={(e) => handleFichaTecnicaChange('tipo_motorizacion', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        <option value="Eléctrico">Eléctrico</option>
                        <option value="Combustión">Combustión</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="No aplica">No aplica</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label>Potencia (Watts / HP)</label>
                      <input type="text" value={formulario.ficha_tecnica?.potencia || ''} onChange={(e) => handleFichaTecnicaChange('potencia', e.target.value)} placeholder="Ej. 3000" />
                    </div>
                    <div className="input-group">
                      <label>Compatibilidad (separar por comas)</label>
                      <input type="text" value={Array.isArray(formulario.ficha_tecnica?.compatibilidad) ? formulario.ficha_tecnica.compatibilidad.join(', ') : (formulario.ficha_tecnica?.compatibilidad || '')} onChange={(e) => handleFichaTecnicaChange('compatibilidad', e.target.value.split(',').map(s => s.trim()))} placeholder="Ej. CAT 320D, Komatsu PC200" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ficha Técnica Dinámica - Lote Perecedero */}
              {formulario.tipo_control === 'LOTE_PERECEDERO' && (
                <div className="ficha-tecnica-box" style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                  <h4 style={{ color: '#475569', fontSize: '13px', marginBottom: '15px' }}>🥛 Ficha Técnica: Alimento / Lácteo Perecedero</h4>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Temperatura de conservación</label>
                      <input type="text" value={formulario.ficha_tecnica?.temperatura || ''} onChange={(e) => handleFichaTecnicaChange('temperatura', e.target.value)} placeholder="Ej. 2C-6C" />
                    </div>
                    <div className="input-group">
                      <label>Contenido Neto</label>
                      <input type="text" value={formulario.ficha_tecnica?.contenido_neto || ''} onChange={(e) => handleFichaTecnicaChange('contenido_neto', e.target.value)} placeholder="Ej. 900 g, 1 L, 250 ml" />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Sabor / Variedad</label>
                      <input type="text" value={formulario.ficha_tecnica?.sabor || ''} onChange={(e) => handleFichaTecnicaChange('sabor', e.target.value)} placeholder="Ej. Fresa, Melocotón, Natural" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ficha Técnica Dinámica - Granel */}
              {formulario.tipo_control === 'GRANEL' && (
                <div className="ficha-tecnica-box" style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                  <h4 style={{ color: '#475569', fontSize: '13px', marginBottom: '15px' }}>🌾 Ficha Técnica: Producto a Granel / Granos</h4>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Tipo de grano</label>
                      <input type="text" value={formulario.ficha_tecnica?.tipo_grano || ''} onChange={(e) => handleFichaTecnicaChange('tipo_grano', e.target.value)} placeholder="Ej. largo, redondo" />
                    </div>
                    <div className="input-group">
                      <label>Presentación comercial / Peso</label>
                      <input type="text" value={formulario.ficha_tecnica?.presentacion || ''} onChange={(e) => handleFichaTecnicaChange('presentacion', e.target.value)} placeholder="Ej. 1_libra, 500g" />
                    </div>
                  </div>
                </div>
              )}

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