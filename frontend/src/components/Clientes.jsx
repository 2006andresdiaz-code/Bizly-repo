// src/components/Clientes.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import './Ventas.css'; 
import './Inventario.css'; 
import './Clientes.css'; 

function Clientes() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar clientes desde el Backend al iniciar el componente con autenticación por Token
  useEffect(() => {
    const token = localStorage.getItem('token'); // Recupera el token guardado en el login

    fetch('http://localhost:5000/api/clientes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Aseguramos que data sea un arreglo antes de pasarlo al estado
        setClientes(Array.isArray(data) ? data : data.clientes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar clientes:", err);
        setClientes([]); // Evita que quede en undefined o texto plano
        setLoading(false);
      });
  }, []);

  // Filtrar clientes según el buscador de forma segura
  const clientesFiltrados = Array.isArray(clientes) ? clientes.filter(cliente => {
    const texto = busqueda.toLowerCase();
    return (
      (cliente.nombre && cliente.nombre.toLowerCase().includes(texto)) ||
      (cliente.documento && cliente.documento.toString().includes(texto)) ||
      (cliente.telefono && cliente.telefono.toString().includes(texto)) ||
      (cliente.email && cliente.email.toLowerCase().includes(texto))
    );
  }) : [];

  const confirmarDesactivacion = (nombreCliente) => {
    const confirmar = window.confirm(`¿Desactivar al cliente "${nombreCliente}"? Sus ventas históricas se conservarán.`);
    if (confirmar) {
      console.log(`Cliente ${nombreCliente} desactivado.`);
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div>
            <div className="breadcrumbs">Bizly / Clientes</div>
            <h1>Clientes</h1>
            <p className="subtitle">{clientes.length} registrados</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setModalAbierto(true)}>
              + Nuevo cliente
            </button>
            <div className="header-user" style={{marginLeft: '20px'}}>
              <strong>Admin Bizly</strong>
            </div>
          </div>
        </header>

        {/* Buscador */}
        <div className="action-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre, documento, teléfono o email..." 
              className="search-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Cuadrícula de Tarjetas de Clientes Dinámica */}
        <div className="products-grid">
          {loading ? (
            <p>Cargando clientes desde la base de datos...</p>
          ) : clientesFiltrados.length === 0 ? (
            <p>No se encontraron clientes registrados o la sesión requiere reautenticación.</p>
          ) : (
            clientesFiltrados.map((cliente) => {
              // Generar iniciales para el Avatar
              const iniciales = cliente.nombre ? cliente.nombre.substring(0, 2).toUpperCase() : 'CL';
              
              return (
                <div className="product-card client-card" key={cliente.id || cliente.id_cliente}>
                  <div className="client-header">
                    <div className="client-avatar">{iniciales}</div>
                    <div className="client-info">
                      <h4>{cliente.nombre} {cliente.apellido || ''}</h4>
                      <span className="client-doc">CC {cliente.documento}</span>
                    </div>
                  </div>
                  <div className="client-body">
                    <div className="client-stats">
                      <span>🛍️ 0 compras</span>
                      <span className="client-spent">$ 0</span>
                    </div>
                    <div className="client-contact">
                      <span>📞 {cliente.telefono || 'Sin teléfono'}</span>
                      <span>✉️ {cliente.email || 'Sin correo'}</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className="btn-action" onClick={() => setModalAbierto(true)}>✎ Editar</button>
                    <button 
                      className="btn-action danger" 
                      onClick={() => confirmarDesactivacion(cliente.nombre)}
                    >
                      🗑 Desactivar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* --- VENTANA MODAL (Nuevo / Editar Cliente) --- */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <div className="modal-header">
              <h2>Nuevo cliente</h2>
              <button className="close-btn" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            
            <form className="modal-body" onSubmit={(e) => { e.preventDefault(); setModalAbierto(false); }}>
              <div className="input-group">
                <label>Nombre completo <span>*</span></label>
                <input type="text" placeholder="Ej. Carlos Pérez" required />
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Documento</label>
                  <input type="text" placeholder="Ej. 10203040" />
                </div>
                <div className="input-group">
                  <label>Tipo</label>
                  <select defaultValue="CC">
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Teléfono</label>
                  <input type="text" placeholder="Ej. 3101234567" />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" placeholder="correo@example.com" />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', padding: '10px 0 0' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#624bff' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;