-- ============================================================
-- Esquema SQL: Odontología Ombú - Sistema de turnos online
-- Compatible con PostgreSQL (ajustar tipos para MySQL si aplica)
-- ============================================================

-- ---------------------------------------------------------
-- 1. TRATAMIENTOS (servicios ofrecidos)
-- ---------------------------------------------------------
CREATE TABLE tratamientos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,        -- "Limpieza Dental", "Ortodoncia", etc.
    descripcion     TEXT,
    duracion_min    INTEGER NOT NULL DEFAULT 30,  -- duración estimada en minutos
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. ODONTÓLOGOS (profesionales)
-- ---------------------------------------------------------
CREATE TABLE odontologos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(60) NOT NULL,
    apellido        VARCHAR(60) NOT NULL,
    iniciales       VARCHAR(4),                   -- "LF", "MS", "CR"
    especialidad    VARCHAR(150),                 -- "Ortodoncia y ortopedia"
    email           VARCHAR(120),
    telefono        VARCHAR(30),
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------
-- 3. RELACIÓN ODONTÓLOGO <-> TRATAMIENTO (qué hace cada uno)
-- ---------------------------------------------------------
CREATE TABLE odontologo_tratamiento (
    odontologo_id   INTEGER NOT NULL REFERENCES odontologos(id) ON DELETE CASCADE,
    tratamiento_id  INTEGER NOT NULL REFERENCES tratamientos(id) ON DELETE CASCADE,
    PRIMARY KEY (odontologo_id, tratamiento_id)
);

-- ---------------------------------------------------------
-- 4. OBRAS SOCIALES
-- ---------------------------------------------------------
CREATE TABLE obras_sociales (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(80) NOT NULL UNIQUE   -- "OSDE", "Swiss Medical", "Galeno", "Medifé"
);

-- ---------------------------------------------------------
-- 5. PACIENTES
-- ---------------------------------------------------------
CREATE TABLE pacientes (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(60) NOT NULL,
    apellido        VARCHAR(60) NOT NULL,
    telefono        VARCHAR(30) NOT NULL,
    email           VARCHAR(120) NOT NULL,
    obra_social_id  INTEGER REFERENCES obras_sociales(id),
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Nota: si querés permitir "particular/sin obra social", dejá obra_social_id NULL.

-- ---------------------------------------------------------
-- 6. HORARIOS DE ATENCIÓN POR ODONTÓLOGO (disponibilidad recurrente)
-- ---------------------------------------------------------
CREATE TABLE disponibilidad (
    id              SERIAL PRIMARY KEY,
    odontologo_id   INTEGER NOT NULL REFERENCES odontologos(id) ON DELETE CASCADE,
    dia_semana      SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo ... 6=Sábado
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL
);

-- ---------------------------------------------------------
-- 7. TURNOS (citas reservadas)
-- ---------------------------------------------------------
CREATE TABLE turnos (
    id              SERIAL PRIMARY KEY,
    paciente_id     INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    odontologo_id   INTEGER NOT NULL REFERENCES odontologos(id),
    tratamiento_id  INTEGER NOT NULL REFERENCES tratamientos(id),
    fecha           DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    comentario      TEXT,                          -- comentario opcional del paciente
    estado          VARCHAR(20) NOT NULL DEFAULT 'confirmado'
                    CHECK (estado IN ('confirmado', 'cancelado', 'reprogramado', 'completado')),
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Evita que un mismo odontólogo tenga dos turnos superpuestos en el mismo horario
    CONSTRAINT uq_turno_odontologo_fecha_hora UNIQUE (odontologo_id, fecha, hora_inicio)
);

-- ---------------------------------------------------------
-- Índices útiles
-- ---------------------------------------------------------
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_paciente ON turnos(paciente_id);
CREATE INDEX idx_turnos_odontologo ON turnos(odontologo_id);
CREATE INDEX idx_pacientes_email ON pacientes(email);