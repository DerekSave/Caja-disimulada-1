import app from "./app.js";
import sequelize from "./config/db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log("Conexión a Postgres exitosa");

    // Sincroniza tus modelos con la base de datos
    // (force: true) elimina y recrea tablas -> útil solo en desarrollo
    await sequelize.sync({ force: false });
    console.log("Modelos sincronizados con la BD");

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con la BD:", error);
  }
})();
