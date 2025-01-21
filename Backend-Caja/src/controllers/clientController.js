// controllers/clientController.js
import Client from "../models/Client.js";

// Crear cliente
export const createClient = async (req, res) => {
  try {
    const { nombre, apellido, documento, direccion, telefono, email } =
      req.body;

    // Validar si el cliente ya existe por su documento
    const existingClient = await Client.findOne({ where: { documento } });
    if (existingClient) {
      return res.status(400).json({ message: "El cliente ya existe" });
    }

    const newClient = await Client.create({
      nombre,
      apellido,
      documento,
      direccion,
      telefono,
      email,
    });

    res
      .status(201)
      .json({ message: "Cliente creado con éxito", client: newClient });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear cliente", error: err.message });
  }
};

// Obtener cliente por documento
export const getClientByDocument = async (req, res) => {
  try {
    const { documento } = req.params;
    const client = await Client.findOne({ where: { documento } });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(client);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al buscar cliente", error: err.message });
  }
};
