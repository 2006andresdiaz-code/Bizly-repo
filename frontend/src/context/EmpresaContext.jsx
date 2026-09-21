// src/context/EmpresaContext.jsx
import { createContext, useState, useEffect } from 'react';

export const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
  const [nombreEmpresa, setNombreEmpresa] = useState(() => {
    return localStorage.getItem('nombreEmpresa') || 'OVER_SMART_PC';
  });

  const actualizarNombreEmpresa = (nuevoNombre) => {
    setNombreEmpresa(nuevoNombre);
    localStorage.setItem('nombreEmpresa', nuevoNombre);
  };

  return (
    <EmpresaContext.Provider value={{ nombreEmpresa, actualizarNombreEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
};