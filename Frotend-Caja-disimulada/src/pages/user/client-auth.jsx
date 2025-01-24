import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const ClientAuth = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-8 text-center">
          Cliente - Seleccione una opción
        </h2>
        <div className="space-y-6">
          <Button
            variant="contained"
            onClick={() => navigate("/client-register")}
            className="w-full"
            sx={{
              backgroundColor: "#4f46e5",
              "&:hover": { backgroundColor: "#4338ca" },
            }}>
            Registrar Cliente
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/client-login")}
            className="w-full">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientAuth;
