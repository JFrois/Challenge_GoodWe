
-- ==========================================
-- LIMPEZA DO BANCO
-- ==========================================
/*
DROP TABLE IF EXISTS Leitura_Medicao;
DROP TABLE IF EXISTS Sessao_Recarga;
DROP TABLE IF EXISTS Fatura;
DROP TABLE IF EXISTS Tarifa;
DROP TABLE IF EXISTS Carregador;
DROP TABLE IF EXISTS Unidade_Usuario;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Unidade;
*/

-- ==========================================
-- DDL: CRIAÇÃO DAS TABELAS
-- ==========================================

CREATE TABLE Unidade (
    id_unidade INTEGER PRIMARY KEY,
    id_condominio INTEGER NOT NULL,
    cd_unidade VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE Usuario (
    id_usuario INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    tipo_vinculo VARCHAR(50) NOT NULL,
    id_rfid VARCHAR(50) UNIQUE NOT NULL,
    id_app VARCHAR(50) UNIQUE
);

CREATE TABLE Unidade_Usuario (
    id_unidade INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    PRIMARY KEY (id_unidade, id_usuario),
    FOREIGN KEY (id_unidade) REFERENCES Unidade(id_unidade),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Carregador (
    id_carregador INTEGER PRIMARY KEY,
    fabricante_modelo VARCHAR(100) NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    potencia_nominal_kw DECIMAL(5,2) NOT NULL,
    tipo_conector VARCHAR(50) NOT NULL,
    id_sems VARCHAR(50) UNIQUE NOT NULL,
    estado_operacional VARCHAR(20) NOT NULL
);

CREATE TABLE Tarifa (
    id_tarifa INTEGER PRIMARY KEY,
    referencia_mes_ano VARCHAR(7) NOT NULL,
    distribuidora VARCHAR(50) NOT NULL,
    valor_kwh_efetivo DECIMAL(5,2) NOT NULL,
    bandeira_vigente VARCHAR(20) NOT NULL,
    taxa_infraestrutura DECIMAL(10,2) NOT NULL
);

CREATE TABLE Fatura (
    id_fatura INTEGER PRIMARY KEY,
    id_unidade INTEGER NOT NULL,
    id_tarifa INTEGER NOT NULL,
    periodo VARCHAR(7) NOT NULL,
    energia_total_kwh DECIMAL(10,2) NOT NULL,
    valor_variavel DECIMAL(10,2) NOT NULL,
    valor_taxa DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status_pgto VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_unidade) REFERENCES Unidade(id_unidade),
    FOREIGN KEY (id_tarifa) REFERENCES Tarifa(id_tarifa)
);

CREATE TABLE Sessao_Recarga (
    id_sessao INTEGER PRIMARY KEY,
    id_carregador INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_unidade INTEGER NOT NULL,
    id_fatura INTEGER NOT NULL,
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP NOT NULL,
    energia_kwh DECIMAL(10,2) NOT NULL,
    potencia_media DECIMAL(5,2) NOT NULL,
    potencia_max DECIMAL(5,2) NOT NULL,
    status_final VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_carregador) REFERENCES Carregador(id_carregador),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_unidade) REFERENCES Unidade(id_unidade),
    FOREIGN KEY (id_fatura) REFERENCES Fatura(id_fatura)
);

CREATE TABLE Leitura_Medicao (
    id_leitura INTEGER PRIMARY KEY,
    id_sessao INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    energia_acumulada_kwh DECIMAL(10,2) NOT NULL,
    potencia_instantanea_kw DECIMAL(5,2) NOT NULL,
    tensao VARCHAR(10) NOT NULL,
    corrente VARCHAR(10) NOT NULL,
    FOREIGN KEY (id_sessao) REFERENCES Sessao_Recarga(id_sessao)
);

-- ==========================================
-- DML: INSERÇÃO DE DADOS SIMULADOS 
-- ==========================================

-- Unidades
INSERT INTO Unidade (id_unidade, id_condominio, cd_unidade, tipo, status) VALUES 
(1, 100, 'Apt 42 - Bloco B', 'residencial', 'ativo'),
(2, 100, 'Apt 43 - Bloco B', 'residencial', 'ativo'),
(3, 100, 'Loja 01 - Terreo', 'comercial', 'ativo'),
(4, 100, 'Apt 55 - Bloco A', 'residencial', 'ativo'),
(5, 100, 'Apt 11 - Bloco B', 'residencial', 'ativo'),
(6, 100, 'Apt 21 - Bloco B', 'residencial', 'ativo'),
(7, 100, 'Apt 31 - Bloco A', 'residencial', 'ativo'),
(8, 100, 'Apt 32 - Bloco A', 'residencial', 'ativo'),
(9, 100, 'Apt 71 - Bloco C', 'residencial', 'ativo'),
(10, 100, 'Apt 72 - Bloco C', 'residencial', 'ativo');

-- Usuários
INSERT INTO Usuario (id_usuario, nome, email, telefone, tipo_vinculo, id_rfid, id_app) VALUES 
(10, 'Juan de Lucas Frois', 'juan.frois@email.com', '(11) 98888-7777', 'proprietario', 'TAG_ABC123', 'APP_9876'),
(11, 'Flávia R. Pennachin', 'flavia.p@email.com', '(11) 99999-5555', 'inquilino', 'TAG_XYZ789', 'APP_5432'),
(12, 'Pedro Valente Toledo', 'pedro.toledo@email.com', '(11) 97777-4444', 'proprietario', 'TAG_DEF456', 'APP_1122'),
(13, 'Mariana Silva', 'mariana.s@email.com', '(11) 96666-3333', 'inquilino', 'TAG_GHI789', 'APP_3344'),
(14, 'Carlos Souza', 'carlos.padaria@email.com', '(11) 95555-2222', 'comercial', 'TAG_JKL012', 'APP_5566'),
(15, 'Ana Beatriz Costa', 'ana.costa@email.com', '(11) 94444-1111', 'proprietario', 'TAG_MNO345', 'APP_7788'),
(16, 'Roberto Almeida', 'roberto.almeida@email.com', '(11) 93333-2222', 'inquilino', 'TAG_PQR678', 'APP_9900'),
(17, 'Camila Rocha', 'camila.rocha@email.com', '(11) 92222-3333', 'proprietario', 'TAG_STU901', 'APP_1234'),
(18, 'Fernando Oliveira', 'fernando.oli@email.com', '(11) 91111-4444', 'proprietario', 'TAG_VWX234', 'APP_5678'),
(19, 'Juliana Mendes', 'juliana.mendes@email.com', '(11) 90000-5555', 'inquilino', 'TAG_YZA567', 'APP_9012');

-- Relacionamento Unidade_Usuario (Tabela Associativa)
INSERT INTO Unidade_Usuario (id_unidade, id_usuario) VALUES 
(1, 10), 
(2, 11), 
(3, 12), 
(4, 13), 
(5, 14), 
(6, 15), 
(7, 16), 
(8, 17), 
(9, 18), 
(10, 19);

-- Carregador
INSERT INTO Carregador (id_carregador, fabricante_modelo, localizacao, potencia_nominal, tipo_conector, id_sems, estado_operacional) VALUES 
(5, 'GoodWe HCA G2', 'Subsolo 1 - Vaga 12', 7.2, 'Tipo 2', 'GW_HCA_1234', 'online'),
(6, 'GoodWe HCA G2', 'Terreo - Vaga Visitante', 11.0, 'Tipo 2', 'GW_HCA_5678', 'online'),
(7, 'GoodWe HCA G2', 'Subsolo 2 - Vaga 45', 7.2, 'Tipo 2', 'GW_HCA_9012', 'manutencao');

-- Tarifas (Histórico da Concessionária)
INSERT INTO Tarifa (id_tarifa, referencia_mes_ano, distribuidora, valor_kwh_efetivo, bandeira_vigente, taxa_infraestrutura) VALUES 
(7, '2026-05', 'ENEL SP', 0.92, 'Amarela', 50.00),
(8, '2026-06', 'ENEL SP', 0.95, 'Verde', 50.00),
(9, '2026-07', 'ENEL SP', 1.05, 'Vermelha', 50.00);

-- Faturas (rateio consolidado do mês 06/2026)
INSERT INTO Fatura (id_fatura, id_unidade, id_tarifa, periodo, energia_total_kwh, valor_variavel, valor_taxa, valor_total, status_pgto) VALUES 
(900, 1, 8, '2026-06', 114.0, 108.30, 50.00, 158.30, 'pago'),
(901, 2, 8, '2026-06', 42.0, 39.90, 50.00, 89.90, 'pendente'),
(902, 3, 8, '2026-06', 250.0, 237.50, 50.00, 287.50, 'pago'),
(903, 4, 8, '2026-06', 15.0, 14.25, 50.00, 64.25, 'pago'),
(904, 5, 8, '2026-06', 320.0, 304.00, 50.00, 354.00, 'atrasado');

-- Sessões de Recarga (Consumo Transacional)
INSERT INTO Sessao_Recarga (id_sessao, id_carregador, id_usuario, id_unidade, id_fatura, dt_inicio, dt_fim, energia_kwh, potencia_media, potencia_max, status_final) VALUES 
(1001, 5, 10, 1, 900, '2026-06-15 22:00:00', '2026-06-16 02:00:00', 28.5, 7.1, 7.2, 'concluida'),
(1002, 5, 11, 2, 901, '2026-06-16 08:30:00', '2026-06-16 11:45:00', 21.0, 6.8, 7.2, 'concluida'),
(1003, 6, 12, 3, 902, '2026-06-17 14:00:00', '2026-06-17 17:00:00', 33.0, 11.0, 11.0, 'concluida'),
(1004, 5, 10, 1, 900, '2026-06-18 20:00:00', '2026-06-19 01:00:00', 35.0, 7.0, 7.2, 'concluida'),
(1005, 5, 11, 2, 901, '2026-06-20 09:00:00', '2026-06-20 12:00:00', 21.0, 7.0, 7.2, 'concluida'),
(1006, 6, 12, 3, 902, '2026-06-21 13:00:00', '2026-06-21 16:30:00', 38.5, 11.0, 11.0, 'concluida'),
(1007, 5, 10, 1, 900, '2026-06-23 23:00:00', '2026-06-24 06:00:00', 50.5, 7.2, 7.2, 'concluida'),
(1008, 6, 14, 5, 904, '2026-06-25 10:00:00', '2026-06-25 14:00:00', 44.0, 11.0, 11.0, 'concluida');

-- Leitura de Medição (Telemetria Time-Series para a Sessão 1001 e 1003)
INSERT INTO Leitura_Medicao (id_leitura, id_sessao, timestamp, energia_acumulada_kwh, potencia_instantanea_kw, tensao, corrente) VALUES 
(50001, 1001, '2026-06-15 22:15:00', 1.8, 7.2, '220V', '32A'),
(50002, 1001, '2026-06-15 22:30:00', 3.6, 7.2, '220V', '32A'),
(50003, 1001, '2026-06-15 22:45:00', 5.4, 7.2, '220V', '32A'),
(50004, 1001, '2026-06-15 23:00:00', 7.2, 7.2, '220V', '32A'),
(50005, 1001, '2026-06-15 23:15:00', 9.0, 7.2, '220V', '32A'),
(50006, 1001, '2026-06-15 23:30:00', 10.8, 7.2, '220V', '32A'),
(50007, 1001, '2026-06-15 23:45:00', 12.6, 7.2, '220V', '32A'),
(50008, 1001, '2026-06-16 00:00:00', 14.4, 7.2, '220V', '32A'),
(50009, 1003, '2026-06-17 14:15:00', 2.75, 11.0, '380V', '16A'),
(50010, 1003, '2026-06-17 14:30:00', 5.5, 11.0, '380V', '16A'),
(50011, 1003, '2026-06-17 14:45:00', 8.25, 11.0, '380V', '16A'),
(50012, 1003, '2026-06-17 15:00:00', 11.0, 11.0, '380V', '16A'),
(50013, 1003, '2026-06-17 15:15:00', 13.75, 11.0, '380V', '16A'),
(50014, 1003, '2026-06-17 15:30:00', 16.5, 11.0, '380V', '16A'),
(50015, 1003, '2026-06-17 15:45:00', 19.25, 11.0, '380V', '16A');