import { Routes, Route } from "react-router-dom";
import UserLogin from "./pages/user/user-login"; // Login de usuario
import ClientLogin from "./pages/client/client-login"; // Login de cliente
import Dashboard from "./pages/client/dashboard"; // Pantalla principal
import CashRegister from "./pages/client/cash-register"; // Gestión de caja
import ClientRegister from "./pages/client/client-register"; // Registro de clientes
import ClientAuth from "./pages/user/client-auth";
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLogin />} />
      <Route path="/client-auth" element={<ClientAuth />} />
      <Route path="/client-login" element={<ClientLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/cash-register" element={<CashRegister />} />
      <Route path="/client-register" element={<ClientRegister />} />
    </Routes>
  );
};

export default AppRouter;
