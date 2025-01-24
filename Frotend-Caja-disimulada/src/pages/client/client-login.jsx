import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const ClientLogin = () => {
  const [documento, setDocumento] = useState(""); // Documento del cliente
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar que el documento no esté vacío
    if (!documento.trim()) {
      setError("Por favor, ingrese su documento de identidad.");
      return;
    }

    try {
      // Recuperar el token del usuario logueado
      const token = localStorage.getItem("authToken");

      // Verificar si el token está disponible
      if (!token) {
        setError("No token provided. Inicia sesión como usuario primero.");
        return;
      }

      // Llamada al endpoint para validar el cliente
      const response = await axios.get(
        `http://localhost:3000/api/clients/${documento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
          },
        }
      );

      // Manejar la respuesta si el cliente es válido
      const client = response.data;
      console.log("Cliente encontrado:", client);

      // Guardar los datos del cliente en el localStorage (opcional)
      localStorage.setItem("clientData", JSON.stringify(client));

      // Redirigir al dashboard del cliente
      navigate("/dashboard");
    } catch (err) {
      // Manejo de errores con mensajes detallados
      const errorMessage =
        err.response?.data?.message ||
        "Ocurrió un error al intentar iniciar sesión.";
      setError(`Error al iniciar sesión: ${errorMessage}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-8 text-center">
          Iniciar Sesión - Cliente
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <TextField
              required
              id="documento"
              label="Documento de Identidad"
              variant="outlined"
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="w-full"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          <Button
            type="submit"
            variant="contained"
            className="w-full"
            sx={{
              backgroundColor: "#4f46e5",
              "&:hover": { backgroundColor: "#4338ca" },
            }}
            size="large">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClientLogin;
