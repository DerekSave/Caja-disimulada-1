import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Importamos jspdf
import jsPDF from "jspdf";

const Dashboard = () => {
  const [cashRegister, setCashRegister] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // 1. Obtener usuario
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserId(response.data.id);
    } catch (err) {
      setError("Error al obtener la información del usuario");
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  // 2. Carga inicial
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchUserDetails().then(() => fetchCashRegister());
    }
  }, [token, navigate]);

  // 3. Obtener caja activa
  const fetchCashRegister = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/cash_registers/active",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCashRegister(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al obtener la caja activa"
      );
      setCashRegister(null);
    }
  };

  // 4. Obtener transacciones
  useEffect(() => {
    if (cashRegister) {
      fetchTransactions(cashRegister.id);
    }
  }, [cashRegister]);

  const fetchTransactions = async (cashRegisterId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/cash_registers/${cashRegisterId}/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al obtener las transacciones"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Iniciar el día
  const handleStartDay = async () => {
    if (!userId) {
      setError("Error: No se pudo obtener el ID del usuario");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/cash_registers/start-day",
        {
          user_id: userId,
          branch: "Sucursal Central",
          monto_inicial: 1000,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCashRegister(response.data.cashRegister);
      setError(null);
      alert("Inicio de día exitoso");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar el día");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Cerrar caja
  const closeCashRegister = async () => {
    if (!cashRegister) {
      setError("No hay caja activa para cerrar");
      return;
    }
    setIsLoading(true);
    try {
      await axios.patch(
        `http://localhost:3000/api/cash_registers/${cashRegister.id}/close`,
        { monto_final: cashRegister.monto_final || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCashRegister(null);
      setError(null);
      alert("Caja cerrada con éxito");
    } catch (err) {
      setError(err.response?.data?.message || "Error al cerrar la caja");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Registrar Salida de Efectivo
  const handleWithdraw = async (amount, description) => {
    if (!cashRegister) {
      setError("No hay caja activa");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/transactions/withdraw",
        {
          cash_register_id: cashRegister.id,
          monto: amount,
          descripcion: description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refrescar las transacciones
      fetchTransactions(cashRegister.id);
      alert("Retiro realizado con éxito");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al realizar el retiro");
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Registrar Entrada de Efectivo
  const handleDeposit = async (amount, description) => {
    if (!cashRegister) {
      setError("No hay caja activa");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/transactions/deposit",
        {
          cash_register_id: cashRegister.id,
          monto: amount,
          descripcion: description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refrescar las transacciones
      fetchTransactions(cashRegister.id);
      alert("Depósito realizado con éxito");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al realizar el depósito");
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Generar Recibo con jsPDF
  const handleGenerateReceipt = async (transactionId) => {
    setIsLoading(true);
    try {
      // Llamamos al endpoint de recibo
      const response = await axios.post(
        "http://localhost:3000/api/transactions/receipt",
        { transaction_id: transactionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { receiptData } = response.data;

      // Generar PDF con jsPDF
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Recibo de Transacción", 20, 20);

      doc.setFontSize(12);
      doc.text(`Transacción ID: ${receiptData.transaction_id}`, 20, 40);
      doc.text(`Tipo: ${receiptData.type}`, 20, 50);
      doc.text(`Monto: $${receiptData.monto}`, 20, 60);
      doc.text(`Descripción: ${receiptData.descripcion}`, 20, 70);
      doc.text(`Caja ID: ${receiptData.caja_id}`, 20, 80);
      doc.text(`Sucursal: ${receiptData.branch}`, 20, 90);
      doc.text(
        `Fecha: ${new Date(receiptData.created_at).toLocaleString()}`,
        20,
        100
      );

      doc.save(`recibo_${receiptData.transaction_id}.pdf`);

      alert("Recibo generado con éxito");
    } catch (err) {
      setError(err.response?.data?.message || "Error al generar el recibo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Botón para iniciar el día */}
      {!cashRegister && (
        <div className="mb-6">
          <button
            onClick={handleStartDay}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}>
            {isLoading ? "Iniciando Día..." : "Iniciar Día"}
          </button>
        </div>
      )}

      {/* Información de la caja activa */}
      {cashRegister && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-bold">Información de la Caja</h2>
          <p>
            <strong>ID:</strong> {cashRegister.id}
          </p>
          <p>
            <strong>Estado:</strong> {cashRegister.estado}
          </p>
          <p>
            <strong>Monto Inicial:</strong> ${cashRegister.monto_inicial}
          </p>
          <p>
            <strong>Monto Final:</strong> ${cashRegister.monto_final || 0}
          </p>
          <p>
            <strong>Fecha Apertura:</strong>{" "}
            {new Date(cashRegister.fecha_apertura).toLocaleString()}
          </p>
          <button
            onClick={closeCashRegister}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={isLoading}>
            {isLoading ? "Cerrando..." : "Cerrar Caja"}
          </button>
        </div>
      )}

      {/* Formulario para entrada de efectivo */}
      {cashRegister && (
        <div className="mt-6 p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Registrar Entrada de Efectivo
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const amount = parseFloat(e.target.amount.value);
              const description = e.target.description.value;
              if (isNaN(amount) || amount <= 0) {
                setError("Por favor, ingresa un monto válido");
                return;
              }
              handleDeposit(amount, description);
              e.target.reset();
            }}
            className="space-y-4">
            <div>
              <label className="block font-medium">Monto</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Descripción</label>
              <input
                type="text"
                name="description"
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={isLoading}>
              {isLoading ? "Procesando..." : "Registrar Entrada de Efectivo"}
            </button>
          </form>
        </div>
      )}

      {/* Formulario para salida de efectivo */}
      {cashRegister && (
        <div className="mt-6 p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Registrar Salida de Efectivo
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const amount = parseFloat(e.target.amount.value);
              const description = e.target.description.value;
              if (!amount || amount <= 0) {
                setError("Por favor, ingresa un monto válido");
                return;
              }
              handleWithdraw(amount, description);
              e.target.reset();
            }}
            className="space-y-4">
            <div>
              <label className="block font-medium">Monto</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Descripción</label>
              <input
                type="text"
                name="description"
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              disabled={isLoading}>
              {isLoading ? "Procesando..." : "Registrar Salida de Efectivo"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de transacciones */}
      {cashRegister && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Transacciones</h2>
          {transactions.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className={`p-2 border rounded shadow ${
                    transaction.type === "salida"
                      ? "bg-red-50"
                      : transaction.type === "entrada"
                      ? "bg-green-50"
                      : ""
                  }`}>
                  <p>
                    <strong>Tipo:</strong> {transaction.type}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${transaction.monto}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {transaction.descripcion}
                  </p>

                  {/* Botón para generar recibo */}
                  <button
                    onClick={() => handleGenerateReceipt(transaction.id)}
                    className="mt-2 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    disabled={isLoading}>
                    {isLoading ? "Generando..." : "Generar Recibo"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-600">
              No hay transacciones registradas
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
