// src/components/Devolucion.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles_components/Devolucion.css'; 

const Devolucion = () => {
  const [formData, setFormData] = useState({
    id_venta: '',
    id_producto: '',
    id_usuario: '',
    cantidad: 1,
    motivo: '',
    monto_reembolso: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/devoluciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Devolución registrada con éxito.');
        setFormData({ id_venta: '', id_producto: '', id_usuario: '', cantidad: 1, motivo: '', monto_reembolso: '' });
      } else {
        alert('Error al registrar la devolución.');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  return (
    <div className="admin-container">
      {/* Menú lateral (Izquierda) */}
      <Sidebar />

      {/* Área de contenido principal (Derecha) */}
      <main className="main-content">
        
        <div className="page-header">
          <div className="breadcrumbs">Bizly / Devoluciones</div>
          <h1>Registro de Devoluciones</h1>
          <p className="subtitle">Ingresa los datos correspondientes para procesar el reembolso en el sistema.</p>
        </div>

        <div className="devolucion-card">
          <form onSubmit={handleSubmit} className="devolucion-form">
            
            <div className="form-row">
              <div className="form-group">
                <label>ID de la Venta: <span>*</span></label>
                <input type="number" name="id_venta" className="bizly-input" value={formData.id_venta} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>ID del Producto: <span>*</span></label>
                <input type="number" name="id_producto" className="bizly-input" value={formData.id_producto} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ID del Usuario: <span>*</span></label>
                <input type="number" name="id_usuario" className="bizly-input" value={formData.id_usuario} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Cantidad a devolver: <span>*</span></label>
                <input type="number" name="cantidad" className="bizly-input" value={formData.cantidad} onChange={handleChange} min="1" required />
              </div>
            </div>

            <div className="form-group">
              <label>Monto a reembolsar ($): <span>*</span></label>
              <input type="number" step="0.01" name="monto_reembolso" className="bizly-input" value={formData.monto_reembolso} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Motivo de la devolución: <span>*</span></label>
              <textarea name="motivo" className="bizly-input textarea-motivo" value={formData.motivo} onChange={handleChange} rows="3" required />
            </div>

            <button type="submit" className="btn-primary-dev">
              Procesar Devolución
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};

export default Devolucion;