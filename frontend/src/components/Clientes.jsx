// src/components/Clientes.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles_components/Dashboard.css';
import '../styles_components/Ventas.css';
import '../styles_components/Inventario.css';
import '../styles_components/Clientes.css';

const CLIENTE_VACIO = {
  id: null,
  nombre: '',
  apellido: '',
  documento: '',
  tipo_documento: 'CC',
  telefono: '',
  email: ''
};

function Clientes() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [verInactivos, setVerInactivos] = useState(false);

  // Datos del formulario (sirve tanto para crear como para editar)
  const [form, setForm] = useState(CLIENTE_VACIO);
  const editando = Boolean(form.id);

  const obtenerClientes = () => {
    const token = localStorage.getItem('token');
    const parametro = verInactivos ? '?activo=0' : '?activo=1';

    return fetch(`http://localhost:5000/api/clientes${parametro}`, {
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
        setClientes(Array.isArray(data) ? data : data.clientes || []);
      })
      .catch(err => {
        console.error("Error al cargar clientes:", err);
        setClientes([]);
      });
  };

  useEffect(() => {
    setLoading(true);
    obtenerClientes().finally(() => setLoading(false));
  }, [verInactivos]);

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

  const abrirModalNuevo = () => {
    setForm(CLIENTE_VACIO);
    setModalAbierto(true);
  };

  const abrirModalEditar = (cliente) => {
    setForm({
      id: cliente.id || cliente.id_cliente,
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      documento: cliente.documento || '',
      tipo_documento: cliente.tipo_documento || 'CC',
      telefono: cliente.telefono || '',
      email: cliente.email || ''
    });
    setModalAbierto(true);
  };

  const actualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }

    setGuardando(true);
    const token = localStorage.getItem('token');
    const esEdicion = Boolean(form.id);
    const url = esEdicion
      ? `http://localhost:5000/api/clientes/${form.id}`
      : 'http://localhost:5000/api/clientes';

    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      documento: form.documento,
      tipo_documento: form.tipo_documento,
      telefono: form.telefono,
      email: form.email
    };

    try {
      const response = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await obtenerClientes();
        setModalAbierto(false);
        setForm(CLIENTE_VACIO);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`No se pudo guardar el cliente: ${errorData.error || errorData.mensaje || 'Datos inválidos'}`);
        console.error("Detalle del error del backend:", errorData);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarDesactivacion = async (cliente) => {
    const id = cliente.id || cliente.id_cliente;
    const confirmar = window.confirm(`¿Desactivar al cliente "${cliente.nombre}"? Sus ventas históricas se conservarán.`);
    if (!confirmar) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/clientes/${id}/desactivar`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        await obtenerClientes();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`No se pudo desactivar: ${errorData.error || errorData.mensaje || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const reactivarCliente = async (cliente) => {
    const id = cliente.id || cliente.id_cliente;
    const confirmar = window.confirm(`¿Reactivar al cliente "${cliente.nombre}"?`);
    if (!confirmar) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/clientes/${id}/reactivar`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        await obtenerClientes();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`No se pudo reactivar: ${errorData.error || errorData.mensaje || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
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
            <button
              className="btn-secondary"
              onClick={() => setVerInactivos(prev => !prev)}
              style={{ marginRight: '10px' }}
            >
              {verInactivos ? '← Ver clientes activos' : 'Ver clientes desactivados'}
            </button>
            <button className="btn-primary" onClick={abrirModalNuevo}>
              + Nuevo cliente
            </button>
            <div className="header-user" style={{ marginLeft: '20px' }}>
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
            <p>{verInactivos ? 'No hay clientes desactivados.' : 'No se encontraron clientes registrados o la sesión requiere reautenticación.'}</p>
          ) : (
            clientesFiltrados.map((cliente) => {
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
                    {verInactivos ? (
                      <button className="btn-action" onClick={() => reactivarCliente(cliente)}>
                        ↺ Reactivar
                      </button>
                    ) : (
                      <>
                        <button className="btn-action" onClick={() => abrirModalEditar(cliente)}>✎ Editar</button>
                        <button
                          className="btn-action danger"
                          onClick={() => confirmarDesactivacion(cliente)}
                        >
                          🗑 Desactivar
                        </button>
                      </>
                    )}
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
              <h2>{editando ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button className="close-btn" onClick={() => setModalAbierto(false)}>✕</button>
            </div>

            <form className="modal-body" onSubmit={guardarCliente}>
              <div className="input-group">
                <label>Nombre <span>*</span></label>
                <input
                  type="text"
                  placeholder="Ej. Carlos"
                  value={form.nombre}
                  onChange={(e) => actualizarCampo('nombre', e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Apellido</label>
                <input
                  type="text"
                  placeholder="Ej. Pérez"
                  value={form.apellido}
                  onChange={(e) => actualizarCampo('apellido', e.target.value)}
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Documento</label>
                  <input
                    type="text"
                    placeholder="Ej. 10203040"
                    value={form.documento}
                    onChange={(e) => actualizarCampo('documento', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Tipo</label>
                  <select
                    value={form.tipo_documento}
                    onChange={(e) => actualizarCampo('tipo_documento', e.target.value)}
                  >
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
                  <input
                    type="text"
                    placeholder="Ej. 3101234567"
                    value={form.telefono}
                    onChange={(e) => actualizarCampo('telefono', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="correo@example.com"
                    value={form.email}
                    onChange={(e) => actualizarCampo('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', padding: '10px 0 0' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#624bff' }} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
