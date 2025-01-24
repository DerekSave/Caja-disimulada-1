import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const ClientRegister = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    direccion: "",
    telefono: "",
    email: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar que todos los campos estén llenos
    for (const key in formData) {
      if (!formData[key].trim()) {
        setError("Por favor, complete todos los campos.");
        return;
      }
    }

    try {
      // Recuperar el token del usuario administrador (si es necesario)
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError(
          "No tienes permisos para registrar un cliente. Inicia sesión primero."
        );
        return;
      }

      // Llamada al endpoint para registrar un cliente
      const response = await axios.post(
        "http://localhost:3000/api/clients/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
          },
        }
      );

      setSuccess("Cliente registrado con éxito.");
      console.log("Registro exitoso:", response.data);

      // Limpiar el formulario
      setFormData({
        nombre: "",
        apellido: "",
        documento: "",
        direccion: "",
        telefono: "",
        email: "",
      });

      // Redirigir al inicio de sesión o dashboard (opcional)
      setTimeout(() => navigate("/client-login"), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Ocurrió un error al registrar al cliente.";
      setError(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-8 text-center">
          Registro de Cliente
        </h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <TextField
            required
            id="nombre"
            name="nombre"
            label="Nombre"
            variant="outlined"
            type="text"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full"
          />
          <TextField
            required
            id="apellido"
            name="apellido"
            label="Apellido"
            variant="outlined"
            type="text"
            value={formData.apellido}
            onChange={handleInputChange}
            className="w-full"
          />
          <TextField
            required
            id="documento"
            name="documento"
            label="Documento de Identidad"
            variant="outlined"
            type="text"
            value={formData.documento}
            onChange={handleInputChange}
            className="w-full"
          />
          <TextField
            required
            id="direccion"
            name="direccion"
            label="Dirección"
            variant="outlined"
            type="text"
            value={formData.direccion}
            onChange={handleInputChange}
            className="w-full"
          />
          <TextField
            required
            id="telefono"
            name="telefono"
            label="Teléfono"
            variant="outlined"
            type="tel"
            value={formData.telefono}
            onChange={handleInputChange}
            className="w-full"
          />
          <TextField
            required
            id="email"
            name="email"
            label="Correo Electrónico"
            variant="outlined"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
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
            Registrar Cliente
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClientRegister;
