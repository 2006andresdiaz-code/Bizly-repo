import { createContext, useState, useEffect } from 'react';

// 1. Creamos el Contexto
export const AuthContext = createContext();

// 2. Creamos el Proveedor (Provider) que envolverá a toda tu aplicación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cuando la app carga, busca si ya había alguien logueado en la memoria del navegador
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('bizly_usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // Función mágica para cuando el backend nos dice "Login Exitoso"
  const login = (datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem('bizly_usuario', JSON.stringify(datosUsuario));
  };

  // Función para el botón de "Salir"
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('bizly_usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};