CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    branch VARCHAR(100) NOT NULL, -- La sucursal a la que pertenece el cajero
    role VARCHAR(50) DEFAULT 'cajero', -- Puede ser 'cajero' o 'supervisor'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL, -- Documento de identidad
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cash_register (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Relacionado con el cajero
    branch VARCHAR(100) NOT NULL,
    monto_inicial DECIMAL(15,2) NOT NULL,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    monto_final DECIMAL(15,2),
    estado VARCHAR(20) DEFAULT 'abierta', -- Puede ser 'abierta' o 'cerrada'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    cash_register_id INT REFERENCES cash_register(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'entrada', 'salida', 'pago_consulta', etc.
    monto DECIMAL(15,2) NOT NULL,
    descripcion TEXT, -- Detalle de la transacción (como nombre de procedimiento, etc.)
    client_id INT REFERENCES clients(id), -- En caso de que la transacción esté asociada a un cliente
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    offline BOOLEAN DEFAULT FALSE, -- Indica si la transacción fue fuera de línea
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offline_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------
--PROCEDURES-------------------------------
-------------------------------------------

--1. Procedimiento para iniciar el día (Abrir caja)
--Este procedimiento inicializa la caja al comienzo del día, insertando un registro de apertura con el monto inicial proporcionado.
CREATE OR REPLACE PROCEDURE iniciar_dia(
    p_user_id INT,
    p_branch VARCHAR(100),
    p_monto_inicial DECIMAL(15,2),
    OUT p_cash_register_id INT  -- Declara la variable OUT para devolver el id de la caja
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Inserta una nueva sesión de caja
    INSERT INTO cash_register (user_id, branch, monto_inicial, estado)
    VALUES (p_user_id, p_branch, p_monto_inicial, 'abierta')
    RETURNING id INTO p_cash_register_id;  -- Usamos la variable OUT para obtener el id

END;
$$;


--2. Procedimiento para cerrar el día (Cierre de caja)
--Este procedimiento actualiza el monto final de la caja, registra la fecha de cierre y cambia el estado de la caja a cerrada.

CREATE OR REPLACE PROCEDURE cerrar_dia(
    p_cash_register_id INT,
    p_monto_final DECIMAL(15,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualiza el monto final y cierra la caja
    UPDATE cash_register
    SET monto_final = p_monto_final, fecha_cierre = CURRENT_TIMESTAMP, estado = 'cerrada'
    WHERE id = p_cash_register_id;
END;
$$;

--3. Procedimiento para agregar una transacción
--Este procedimiento permite agregar transacciones de entrada de efectivo, salida de efectivo, y pagos a la base de datos.

CREATE OR REPLACE PROCEDURE agregar_transaccion(
    p_cash_register_id INT,
    p_type VARCHAR(50), -- 'entrada', 'salida', 'pago_consulta', etc.
    p_monto DECIMAL(15,2),
    p_descripcion TEXT,
    p_client_id INT DEFAULT NULL, -- Si la transacción está asociada a un cliente
    p_offline BOOLEAN DEFAULT FALSE -- Indica si la transacción fue fuera de línea
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Inserta una nueva transacción
    INSERT INTO transactions (cash_register_id, type, monto, descripcion, client_id, offline)
    VALUES (p_cash_register_id, p_type, p_monto, p_descripcion, p_client_id, p_offline);
END;
$$;

-- 4. Procedimiento para validar el usuario y clave del cajero
-- Este procedimiento valida si el usuario y la clave proporcionados coinciden con los datos almacenados en la base de datos.
CREATE OR REPLACE PROCEDURE validar_usuario(
    p_username VARCHAR(100),
    p_password VARCHAR(255), -- La clave debe estar cifrada en la base de datos
    OUT p_valid BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_password_hash TEXT;
BEGIN
    -- Buscar el usuario
    SELECT password_hash INTO v_password_hash
    FROM users
    WHERE username = p_username;
    
    -- Comparar la contraseña cifrada
    IF v_password_hash IS NOT NULL AND v_password_hash = p_password THEN
        p_valid := TRUE;
    ELSE
        p_valid := FALSE;
    END IF;
END;
$$;

-- 5. Procedimiento para validar cliente por documento de identidad
-- Este procedimiento valida si el cliente existe en la base de datos utilizando su documento de identidad.

CREATE OR REPLACE PROCEDURE validar_cliente(
    p_documento VARCHAR(50),
    OUT p_client_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Buscar el cliente por documento
    SELECT id INTO p_client_id
    FROM clients
    WHERE documento = p_documento;
    
    -- Si no se encuentra, devuelve NULL
    IF p_client_id IS NULL THEN
        RAISE EXCEPTION 'Cliente no encontrado';
    END IF;
END;
$$;

-- 6. Procedimiento para iniciar una transacción fuera de línea
-- Este procedimiento se usa para registrar transacciones cuando el sistema no está conectado, y posteriormente sincronizarlas cuando se restablezca la conexión.

CREATE OR REPLACE PROCEDURE iniciar_transaccion_fuera_de_linea(
    p_cash_register_id INT,
    p_type VARCHAR(50), -- 'entrada', 'salida', 'pago_consulta', etc.
    p_monto DECIMAL(15,2),
    p_descripcion TEXT,
    p_client_id INT DEFAULT NULL -- Si la transacción está asociada a un cliente
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Inserta la transacción fuera de línea
    INSERT INTO transactions (cash_register_id, type, monto, descripcion, client_id, offline)
    VALUES (p_cash_register_id, p_type, p_monto, p_descripcion, p_client_id, TRUE);
END;
$$;

-- 7. Procedimiento para aplicar transacciones fuera de línea
-- Este procedimiento se encarga de aplicar todas las transacciones fuera de línea cuando la conexión con el sistema es restablecida.

CREATE OR REPLACE PROCEDURE aplicar_transacciones_fuera_de_linea()
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Seleccionar todas las transacciones fuera de línea
    FOR rec IN
        SELECT id, cash_register_id, type, monto, descripcion, client_id
        FROM transactions
        WHERE offline = TRUE
    LOOP
        -- Aplicar cada transacción
        INSERT INTO transactions (cash_register_id, type, monto, descripcion, client_id, offline)
        VALUES (rec.cash_register_id, rec.type, rec.monto, rec.descripcion, rec.client_id, FALSE);
        
        -- Marcar como aplicada la transacción fuera de línea
        UPDATE transactions
        SET offline = FALSE
        WHERE id = rec.id;
    END LOOP;
END;
$$;

-- 8. Procedimiento para hacer el cuadre de caja
-- Este procedimiento realiza el cuadre de la caja, comparando las transacciones realizadas con el monto final de la caja.

CREATE OR REPLACE PROCEDURE cuadre_de_caja(
    p_cash_register_id INT,
    OUT p_diferencia DECIMAL(15,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_monto_inicial DECIMAL(15,2);
    v_transacciones_totales DECIMAL(15,2);
BEGIN
    -- Obtener el monto inicial de la caja
    SELECT monto_inicial INTO v_monto_inicial
    FROM cash_register
    WHERE id = p_cash_register_id;

    -- Obtener el total de las transacciones realizadas
    SELECT COALESCE(SUM(monto), 0) INTO v_transacciones_totales
    FROM transactions
    WHERE cash_register_id = p_cash_register_id;

    -- Calcular la diferencia
    p_diferencia := v_monto_inicial + v_transacciones_totales;
END;
$$;
