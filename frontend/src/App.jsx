import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Auditoria from './components/Auditoria';
import Configuracion from './components/Configuracion';
import Clientes from './components/Clientes';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Registro from './components/Registro';
import RecuperarPassword from './components/RecuperarPassword';
import Ventas from './components/Ventas';
import Inventario from './components/Inventario';
import Reportes from './components/Reportes';
import MiCuenta from './components/MiCuenta';

// 🔒 Componente Guardia de Seguridad
const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando Bizly...</div>;
  }

  if (!usuario) {
    // Si no está logueado, lo patea al Login
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<RecuperarPassword />} />

          {/* 🔒 Rutas Protegidas (Requieren Login) */}
          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/ventas" element={<RutaProtegida><Ventas /></RutaProtegida>} />
          <Route path="/inventario" element={<RutaProtegida><Inventario /></RutaProtegida>} />
          <Route path="/clientes" element={<RutaProtegida><Clientes /></RutaProtegida>} />
          <Route path="/reportes" element={<RutaProtegida><Reportes /></RutaProtegida>} />
          <Route path="/auditoria" element={<RutaProtegida><Auditoria /></RutaProtegida>} />
          <Route path="/configuracion" element={<RutaProtegida><Configuracion /></RutaProtegida>} />
          <Route path="/micuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;