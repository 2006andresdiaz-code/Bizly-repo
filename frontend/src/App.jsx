// src/App.jsx
import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { EmpresaProvider } from './context/EmpresaContext';

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
import Devolucion from './components/Devolucion';

// Componente Guardia de Seguridad (Ahora con validación de roles)
const RutaProtegida = ({ children, soloAdmin = false }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando Bizly...</div>;
  }

  // 1. Si no hay sesión, al login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // 2. Si la ruta exige ser Admin, verificamos el rol
  if (soloAdmin) {
    const esAdmin = String(usuario.rol || usuario.id_rol) === '1';
    if (!esAdmin) {
      // Si es un vendedor de curioso intentando entrar por URL, lo rebotamos a ventas
      return <Navigate to="/ventas" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <EmpresaProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<RecuperarPassword />} />

            {/* 🟢 Rutas Protegidas Generales (Acceso para Admin y Vendedores) */}
            <Route path="/ventas" element={<RutaProtegida><Ventas /></RutaProtegida>} />
            <Route path="/devoluciones" element={<RutaProtegida><Devolucion /></RutaProtegida>} />
            <Route path="/clientes" element={<RutaProtegida><Clientes /></RutaProtegida>} />
            <Route path="/micuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />
            
            {/* 🔴 Rutas Protegidas ESTRICTAS (Solo Administradores) */}
            <Route path="/dashboard" element={<RutaProtegida soloAdmin={true}><Dashboard /></RutaProtegida>} />
            <Route path="/inventario" element={<RutaProtegida soloAdmin={true}><Inventario /></RutaProtegida>} />
            <Route path="/reportes" element={<RutaProtegida soloAdmin={true}><Reportes /></RutaProtegida>} />
            <Route path="/auditoria" element={<RutaProtegida soloAdmin={true}><Auditoria /></RutaProtegida>} />
            <Route path="/configuracion" element={<RutaProtegida soloAdmin={true}><Configuracion /></RutaProtegida>} />
          </Routes>
        </BrowserRouter>
      </EmpresaProvider>
    </AuthProvider>
  );
}

export default App;