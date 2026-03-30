import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null);

  function loginAdmin() {
    setUsuario({ nome: "Admin", tipo: "admin" });
  }

  function loginCliente() {
    setUsuario({ nome: "Cliente", tipo: "cliente" });
  }

  function logout() {
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loginAdmin,
        loginCliente,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}