-- =============================================================================
-- EV ChargeOps — schema relacional e massa de teste
-- Enterprise Challenge 2026 — FIAP + GoodWe
--
-- Decisoes de modelagem registradas aqui para defesa tecnica:
--
-- 1. Valores monetarios sao INTEGER em centavos. SQLite nao possui tipo
--    decimal real: DECIMAL(10,2) vira REAL e acumula erro de ponto flutuante.
--    Como o sistema gera cobranca, a camada Python opera com Decimal e
--    persiste centavos. Energia (kWh) continua REAL por ser medicao fisica.
--
-- 2. Sessao_Recarga.id_fatura e NULL na ingestao. A fatura e gerada A PARTIR
--    das sessoes, entao exigir a fatura no momento do registro seria uma
--    dependencia circular. O vinculo e escrito no fechamento do ciclo.
--
-- 3. A tabela Fatura nasce vazia. As faturas sao produzidas pelo motor de
--    rateio a partir das sessoes, o que garante que o que aparece no
--    dashboard sempre reconcilia com o consumo registrado.
--
-- 4. Tensao e corrente sao REAL (volts e amperes), nao texto. A unidade vai
--    no nome da coluna. Isso e pre-requisito para alimentar o modelo de
--    deteccao de anomalias.
--
-- 5. Bandeira tarifaria e um adicional proprio, separado do custo base do
--    kWh, para permitir atualizacao independente via ANEEL Open Data.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- =========================== LIMPEZA (idempotente) ===========================
DROP TABLE IF EXISTS Alerta;
DROP TABLE IF EXISTS Leitura_Medicao;
DROP TABLE IF EXISTS Sessao_Recarga;
DROP TABLE IF EXISTS Reserva_Carregador;
DROP TABLE IF EXISTS Fatura;
DROP TABLE IF EXISTS Tarifa;
DROP TABLE IF EXISTS Carregador;
DROP TABLE IF EXISTS Unidade_Usuario;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Unidade;

-- ================================== DDL ======================================

CREATE TABLE Unidade (
    id_unidade    INTEGER PRIMARY KEY,
    id_condominio INTEGER NOT NULL,
    cd_unidade    TEXT    NOT NULL,
    tipo          TEXT    NOT NULL CHECK (tipo IN ('residencial', 'comercial')),
    status        TEXT    NOT NULL CHECK (status IN ('ativo', 'inativo'))
);

CREATE TABLE Usuario (
    id_usuario   INTEGER PRIMARY KEY,
    nome         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    telefone     TEXT,
    tipo_vinculo TEXT NOT NULL,
    id_rfid      TEXT NOT NULL UNIQUE,
    id_app       TEXT UNIQUE
);

CREATE TABLE Unidade_Usuario (
    id_unidade INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    PRIMARY KEY (id_unidade, id_usuario),
    FOREIGN KEY (id_unidade) REFERENCES Unidade(id_unidade),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Carregador (
    id_carregador       INTEGER PRIMARY KEY,
    fabricante_modelo   TEXT NOT NULL,
    localizacao         TEXT NOT NULL,
    potencia_nominal_kw REAL NOT NULL,
    tipo_conector       TEXT NOT NULL,
    id_sems             TEXT NOT NULL UNIQUE,
    estado_operacional  TEXT NOT NULL
        CHECK (estado_operacional IN ('online', 'offline', 'manutencao'))
);

CREATE TABLE Tarifa (
    id_tarifa                    INTEGER PRIMARY KEY,
    referencia_mes_ano           TEXT    NOT NULL UNIQUE,   -- 'YYYY-MM'
    distribuidora                TEXT    NOT NULL,
    valor_kwh_centavos           INTEGER NOT NULL,          -- custo base do kWh
    bandeira_vigente             TEXT    NOT NULL,
    adicional_bandeira_centavos  INTEGER NOT NULL DEFAULT 0,
    taxa_infraestrutura_centavos INTEGER NOT NULL
);

CREATE TABLE Fatura (
    id_fatura               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_unidade              INTEGER NOT NULL,
    id_tarifa               INTEGER NOT NULL,
    periodo                 TEXT    NOT NULL,               -- 'YYYY-MM'
    politica_rateio         TEXT    NOT NULL,
    energia_total_kwh       REAL    NOT NULL,
    qtd_sessoes             INTEGER NOT NULL,
    valor_variavel_centavos INTEGER NOT NULL,
    valor_taxa_centavos     INTEGER NOT NULL,
    valor_total_centavos    INTEGER NOT NULL,
    status_pgto             TEXT    NOT NULL DEFAULT 'pendente'
        CHECK (status_pgto IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    gerada_em               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_unidade, periodo),                           -- fechamento idempotente
    FOREIGN KEY (id_unidade) REFERENCES Unidade(id_unidade),
    FOREIGN KEY (id_tarifa)  REFERENCES Tarifa(id_tarifa)
);

CREATE TABLE Sessao_Recarga (
    id_sessao         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sessao_sems    TEXT UNIQUE,          -- chave externa da GoodWe: idempotencia
    id_carregador     INTEGER NOT NULL,
    id_usuario        INTEGER NOT NULL,
    id_unidade        INTEGER NOT NULL,
    id_fatura         INTEGER,              -- NULL ate o fechamento do ciclo
    dt_inicio         TIMESTAMP NOT NULL,
    dt_fim            TIMESTAMP,
    energia_kwh       REAL    NOT NULL CHECK (energia_kwh >= 0),
    potencia_media_kw REAL,
    potencia_max_kw   REAL,
    status_final      TEXT    NOT NULL
        CHECK (status_final IN ('concluida', 'interrompida', 'erro', 'em_andamento')),
    anomaly_score     REAL,                 -- preenchido pelo modulo de IA
    is_anomaly        INTEGER NOT NULL DEFAULT 0,
    registrada_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carregador) REFERENCES Carregador(id_carregador),
    FOREIGN KEY (id_usuario)    REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_unidade)    REFERENCES Unidade(id_unidade),
    FOREIGN KEY (id_fatura)     REFERENCES Fatura(id_fatura)
);

CREATE INDEX idx_sessao_periodo ON Sessao_Recarga (dt_inicio);
CREATE INDEX idx_sessao_unidade ON Sessao_Recarga (id_unidade);

CREATE TABLE Leitura_Medicao (
    id_leitura              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sessao               INTEGER NOT NULL,
    timestamp               TIMESTAMP NOT NULL,
    energia_acumulada_kwh   REAL NOT NULL,
    potencia_instantanea_kw REAL NOT NULL,
    tensao_v                REAL NOT NULL,
    corrente_a              REAL NOT NULL,
    FOREIGN KEY (id_sessao) REFERENCES Sessao_Recarga(id_sessao)
);

CREATE INDEX idx_leitura_sessao ON Leitura_Medicao (id_sessao);

CREATE TABLE Alerta (
    id_alerta  INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo       TEXT NOT NULL
        CHECK (tipo IN ('anomalia', 'capacidade', 'falha_sessao')),
    id_sessao  INTEGER,
    id_unidade INTEGER,
    severidade TEXT NOT NULL DEFAULT 'media'
        CHECK (severidade IN ('baixa', 'media', 'alta')),
    mensagem   TEXT NOT NULL,
    resolvido  INTEGER NOT NULL DEFAULT 0,
    criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sessao)  REFERENCES Sessao_Recarga(id_sessao),
    FOREIGN KEY (id_unidade) REFERENCES Unidade(id_unidade)
);

CREATE TABLE Reserva_Carregador (
    id_reserva         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carregador      INTEGER NOT NULL,
    id_usuario         INTEGER NOT NULL,
    id_unidade         INTEGER NOT NULL,
    dt_inicio_agendado TIMESTAMP NOT NULL,
    dt_fim_agendado    TIMESTAMP NOT NULL,
    status_reserva     TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status_reserva IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
    criado_em          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carregador) REFERENCES Carregador(id_carregador),
    FOREIGN KEY (id_usuario)    REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_unidade)    REFERENCES Unidade(id_unidade)
);

-- ================================== DML ======================================

INSERT INTO Unidade (id_unidade, id_condominio, cd_unidade, tipo, status) VALUES
(1,  100, 'Apt 42 - Bloco B', 'residencial', 'ativo'),
(2,  100, 'Apt 43 - Bloco B', 'residencial', 'ativo'),
(3,  100, 'Loja 01 - Terreo', 'comercial',   'ativo'),
(4,  100, 'Apt 55 - Bloco A', 'residencial', 'ativo'),
(5,  100, 'Apt 11 - Bloco B', 'residencial', 'ativo'),
(6,  100, 'Apt 21 - Bloco B', 'residencial', 'ativo'),
(7,  100, 'Apt 31 - Bloco A', 'residencial', 'ativo'),
(8,  100, 'Apt 32 - Bloco A', 'residencial', 'ativo'),
(9,  100, 'Apt 71 - Bloco C', 'residencial', 'ativo'),
(10, 100, 'Apt 72 - Bloco C', 'residencial', 'ativo');

INSERT INTO Usuario (id_usuario, nome, email, telefone, tipo_vinculo, id_rfid, id_app) VALUES
(10, 'Juan de Lucas Frois',  'juan.frois@email.com',      '(11) 98888-7777', 'proprietario', 'TAG_ABC123', 'APP_9876'),
(11, 'Flavia R. Pennachin',  'flavia.p@email.com',        '(11) 99999-5555', 'inquilino',    'TAG_XYZ789', 'APP_5432'),
(12, 'Pedro Valente Toledo', 'pedro.toledo@email.com',    '(11) 97777-4444', 'proprietario', 'TAG_DEF456', 'APP_1122'),
(13, 'Mariana Silva',        'mariana.s@email.com',       '(11) 96666-3333', 'inquilino',    'TAG_GHI789', 'APP_3344'),
(14, 'Carlos Souza',         'carlos.souza@email.com',    '(11) 95555-2222', 'comercial',    'TAG_JKL012', 'APP_5566'),
(15, 'Ana Beatriz Costa',    'ana.costa@email.com',       '(11) 94444-1111', 'proprietario', 'TAG_MNO345', 'APP_7788'),
(16, 'Roberto Almeida',      'roberto.almeida@email.com', '(11) 93333-2222', 'inquilino',    'TAG_PQR678', 'APP_9900'),
(17, 'Camila Rocha',         'camila.rocha@email.com',    '(11) 92222-3333', 'proprietario', 'TAG_STU901', 'APP_1234'),
(18, 'Fernando Oliveira',    'fernando.oli@email.com',    '(11) 91111-4444', 'proprietario', 'TAG_VWX234', 'APP_5678'),
(19, 'Juliana Mendes',       'juliana.mendes@email.com',  '(11) 90000-5555', 'inquilino',    'TAG_YZA567', 'APP_9012'),
-- Segundo veiculo da unidade 1: caso excepcional "multiplos VEs na mesma unidade"
(20, 'Renata Frois',         'renata.frois@email.com',    '(11) 98888-6666', 'proprietario', 'TAG_BCD890', 'APP_2468');

INSERT INTO Unidade_Usuario (id_unidade, id_usuario) VALUES
(1, 10), (2, 11), (3, 12), (4, 13), (5, 14),
(6, 15), (7, 16), (8, 17), (9, 18), (10, 19),
(1, 20);

INSERT INTO Carregador (id_carregador, fabricante_modelo, localizacao, potencia_nominal_kw, tipo_conector, id_sems, estado_operacional) VALUES
(5, 'GoodWe HCA G2', 'Subsolo 1 - Vaga 12',     7.4,  'Tipo 2', 'GW_HCA_1234', 'online'),
(6, 'GoodWe HCA G2', 'Terreo - Vaga Visitante', 11.0, 'Tipo 2', 'GW_HCA_5678', 'online'),
(7, 'GoodWe HCA G2', 'Subsolo 2 - Vaga 45',     7.4,  'Tipo 2', 'GW_HCA_9012', 'manutencao');

-- Tarifas em centavos: R$ 0,92/kWh = 92 centavos
INSERT INTO Tarifa (id_tarifa, referencia_mes_ano, distribuidora, valor_kwh_centavos, bandeira_vigente, adicional_bandeira_centavos, taxa_infraestrutura_centavos) VALUES
(7, '2026-05', 'ENEL SP', 92, 'Amarela',  2, 5000),
(8, '2026-06', 'ENEL SP', 92, 'Verde',    0, 5000),
(9, '2026-07', 'ENEL SP', 95, 'Vermelha', 8, 5000);

-- Sessoes de recarga. A tabela Fatura nasce VAZIA de proposito: as faturas
-- sao geradas pelo motor de rateio a partir destas sessoes.
INSERT INTO Sessao_Recarga (id_sessao_sems, id_carregador, id_usuario, id_unidade, dt_inicio, dt_fim, energia_kwh, potencia_media_kw, potencia_max_kw, status_final) VALUES
-- Unidade 1: dois veiculos (usuarios 10 e 20) no mesmo periodo
('SEMS-2026-06-0001', 5, 10, 1, '2026-06-03 22:10:00', '2026-06-04 02:05:00', 28.50, 7.20, 7.40, 'concluida'),
('SEMS-2026-06-0002', 5, 20, 1, '2026-06-07 21:40:00', '2026-06-08 01:10:00', 24.80, 7.10, 7.40, 'concluida'),
('SEMS-2026-06-0003', 5, 10, 1, '2026-06-14 23:00:00', '2026-06-15 05:30:00', 46.20, 7.10, 7.40, 'concluida'),
('SEMS-2026-06-0004', 5, 20, 1, '2026-06-21 20:30:00', '2026-06-22 00:00:00', 24.50, 7.00, 7.40, 'concluida'),
-- Unidade 2: uso regular matinal
('SEMS-2026-06-0005', 5, 11, 2, '2026-06-02 08:30:00', '2026-06-02 11:45:00', 21.00, 6.80, 7.40, 'concluida'),
('SEMS-2026-06-0006', 5, 11, 2, '2026-06-09 09:00:00', '2026-06-09 12:00:00', 21.30, 7.10, 7.40, 'concluida'),
('SEMS-2026-06-0007', 5, 11, 2, '2026-06-16 08:45:00', '2026-06-16 11:50:00', 20.60, 6.90, 7.40, 'concluida'),
-- Unidade 3 (comercial): inclui sessao INTERROMPIDA, cobrada pela energia entregue
('SEMS-2026-06-0008', 6, 12, 3, '2026-06-05 14:00:00', '2026-06-05 17:00:00', 33.00, 11.00, 11.00, 'concluida'),
('SEMS-2026-06-0009', 6, 12, 3, '2026-06-12 13:00:00', '2026-06-12 16:30:00', 38.50, 11.00, 11.00, 'concluida'),
('SEMS-2026-06-0010', 6, 12, 3, '2026-06-19 15:00:00', '2026-06-19 15:22:00',  4.05, 11.00, 11.00, 'interrompida'),
-- Unidade 4: sessao abaixo do minimo faturavel (plugue solto), nao gera cobranca
('SEMS-2026-06-0011', 5, 13, 4, '2026-06-08 19:00:00', '2026-06-08 19:02:00',  0.05,  1.50,  1.60, 'interrompida'),
-- Unidade 5: perfil intensivo; a sessao 0014 e propositalmente anomala
('SEMS-2026-06-0012', 6, 14, 5, '2026-06-04 10:00:00', '2026-06-04 14:00:00', 44.00, 11.00, 11.00, 'concluida'),
('SEMS-2026-06-0013', 6, 14, 5, '2026-06-11 10:15:00', '2026-06-11 14:10:00', 42.80, 11.00, 11.00, 'concluida'),
('SEMS-2026-06-0014', 6, 14, 5, '2026-06-18 02:00:00', '2026-06-18 03:00:00', 39.60, 39.60, 41.00, 'concluida'),
-- Unidade 7: uso esporadico
('SEMS-2026-06-0015', 5, 16, 7, '2026-06-10 18:00:00', '2026-06-10 21:00:00', 19.80,  6.60,  7.40, 'concluida'),
-- Unidade 9: fim de semana
('SEMS-2026-06-0016', 5, 18, 9, '2026-06-06 10:00:00', '2026-06-06 14:30:00', 31.40,  7.00,  7.40, 'concluida'),
('SEMS-2026-06-0017', 5, 18, 9, '2026-06-20 09:30:00', '2026-06-20 13:40:00', 29.10,  7.00,  7.40, 'concluida'),
-- Sessao com erro: nao entra no faturamento
('SEMS-2026-06-0018', 7, 17, 8, '2026-06-13 20:00:00', '2026-06-13 20:04:00',  0.00,  0.00,  0.00, 'erro'),
-- Mes anterior (2026-05), para dar historico ao modulo de IA
('SEMS-2026-05-0001', 5, 10, 1, '2026-05-12 22:00:00', '2026-05-13 02:00:00', 27.90,  7.00,  7.40, 'concluida'),
('SEMS-2026-05-0002', 5, 11, 2, '2026-05-14 08:30:00', '2026-05-14 11:30:00', 20.10,  6.70,  7.40, 'concluida'),
('SEMS-2026-05-0003', 6, 14, 5, '2026-05-20 10:00:00', '2026-05-20 13:50:00', 41.90, 11.00, 11.00, 'concluida');
-- Unidades 6 e 10 nao possuem sessoes: caso excepcional "mes sem recarga".
-- Elas NAO devem receber fatura nenhuma.

INSERT INTO Reserva_Carregador (id_carregador, id_usuario, id_unidade, dt_inicio_agendado, dt_fim_agendado, status_reserva) VALUES
(5, 10, 1, '2026-09-20 20:00:00', '2026-09-20 23:00:00', 'pendente'),
(5, 11, 2, '2026-09-21 08:00:00', '2026-09-21 11:00:00', 'confirmada'),
(6, 12, 3, '2026-09-21 14:00:00', '2026-09-21 17:00:00', 'pendente');
