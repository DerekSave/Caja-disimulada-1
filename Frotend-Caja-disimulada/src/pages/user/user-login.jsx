import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const UserLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Por favor, complete todos los campos");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
          username,
          password,
        }
      );

      const { token } = response.data;

      // Guardar el token en localStorage
      localStorage.setItem("authToken", token);

      // Redirigir al dashboard
      navigate("/client-auth");
    } catch (err) {
      setError(
        `Usuario o contraseña incorrectos: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-8 text-center">
          Inicio de Sesión
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <TextField
              required
              id="outlined-basic"
              label="username"
              type="usernmae"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <TextField
              required
              id="outlined-basic"
              label="Contraseña"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
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

export default UserLogin;
