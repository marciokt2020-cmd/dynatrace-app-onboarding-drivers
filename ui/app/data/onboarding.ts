export type SegmentoMotorista =
  | "Mobilidade urbana"
  | "Entrega"
  | "Executivo"
  | "Frota parceira";

export type GeneroMotorista = "Feminino" | "Masculino" | "Não informado";

export interface VeiculoMotorista {
  anoVeiculo: number;
  modeloVeiculo: string;
  fabricanteVeiculo: string;
  valorVeiculoUsd: number;
}

export interface CadastroMotorista {
  id: string;
  cidade: string;
  pais: string;
  codigoPais: string;
  regiao: string;
  latitude: number;
  longitude: number;
  segmento: SegmentoMotorista;
  idade: number;
  genero: GeneroMotorista;
  avaliacao: number;
  reclamacoes: number;
  anoVeiculo: number;
  modeloVeiculo: string;
  fabricanteVeiculo: string;
  valorVeiculoUsd: number;
  transacoesCartao: number;
  gastosCartaoUsd: number;
  horaUtc: number;
  documentoValidado: boolean;
  cnhExpirada: boolean;
  pontosNaCnh: number;
  cnhValidada: boolean;
  reputacaoConsultada: boolean;
  contaCriada: boolean;
  cartaoStatus: "emitido" | "retry" | "nao_solicitado";
  motivoRetry: string;
  criadoEm: string;
}

interface Mercado {
  cidade: string;
  pais: string;
  codigoPais: string;
  regiao: string;
  latitude: number;
  longitude: number;
  volumeMock: number;
}

const MERCADOS: Mercado[] = [
  {
    cidade: "São Paulo",
    pais: "Brasil",
    codigoPais: "BR",
    regiao: "América do Sul",
    latitude: -23.5505,
    longitude: -46.6333,
    volumeMock: 34,
  },
  {
    cidade: "Buenos Aires",
    pais: "Argentina",
    codigoPais: "AR",
    regiao: "América do Sul",
    latitude: -34.6037,
    longitude: -58.3816,
    volumeMock: 18,
  },
  {
    cidade: "Cidade do México",
    pais: "México",
    codigoPais: "MX",
    regiao: "América do Norte",
    latitude: 19.4326,
    longitude: -99.1332,
    volumeMock: 27,
  },
  {
    cidade: "Toronto",
    pais: "Canadá",
    codigoPais: "CA",
    regiao: "América do Norte",
    latitude: 43.6532,
    longitude: -79.3832,
    volumeMock: 12,
  },
  {
    cidade: "Nova York",
    pais: "Estados Unidos",
    codigoPais: "US",
    regiao: "América do Norte",
    latitude: 40.7128,
    longitude: -74.006,
    volumeMock: 35,
  },
  {
    cidade: "Madri",
    pais: "Espanha",
    codigoPais: "ES",
    regiao: "Europa",
    latitude: 40.4168,
    longitude: -3.7038,
    volumeMock: 15,
  },
  {
    cidade: "Berlim",
    pais: "Alemanha",
    codigoPais: "DE",
    regiao: "Europa",
    latitude: 52.52,
    longitude: 13.405,
    volumeMock: 16,
  },
  {
    cidade: "Londres",
    pais: "Reino Unido",
    codigoPais: "GB",
    regiao: "Europa",
    latitude: 51.5072,
    longitude: -0.1276,
    volumeMock: 21,
  },
  {
    cidade: "Joanesburgo",
    pais: "África do Sul",
    codigoPais: "ZA",
    regiao: "África",
    latitude: -26.2041,
    longitude: 28.0473,
    volumeMock: 11,
  },
  {
    cidade: "Mumbai",
    pais: "Índia",
    codigoPais: "IN",
    regiao: "Ásia-Pacífico",
    latitude: 19.076,
    longitude: 72.8777,
    volumeMock: 25,
  },
  {
    cidade: "Tóquio",
    pais: "Japão",
    codigoPais: "JP",
    regiao: "Ásia-Pacífico",
    latitude: 35.6762,
    longitude: 139.6503,
    volumeMock: 14,
  },
  {
    cidade: "Sydney",
    pais: "Austrália",
    codigoPais: "AU",
    regiao: "Ásia-Pacífico",
    latitude: -33.8688,
    longitude: 151.2093,
    volumeMock: 12,
  },
];

const MERCADOS_POR_CADASTRO = MERCADOS.flatMap(
  ({ volumeMock, ...mercado }) =>
    Array.from({ length: volumeMock }, () => mercado),
);

const SEGMENTOS: SegmentoMotorista[] = [
  "Mobilidade urbana",
  "Entrega",
  "Executivo",
  "Frota parceira",
];

const MOTIVOS_RETRY = [
  "Tempo esgotado na emissão",
  "Indisponibilidade temporária do provedor",
  "Confirmação pendente do banco",
];

const VEICULOS_MOCK: VeiculoMotorista[] = [
  { anoVeiculo: 2020, modeloVeiculo: "Corolla", fabricanteVeiculo: "Toyota", valorVeiculoUsd: 18000 },
  { anoVeiculo: 2019, modeloVeiculo: "Civic", fabricanteVeiculo: "Honda", valorVeiculoUsd: 16500 },
  { anoVeiculo: 2022, modeloVeiculo: "Onix", fabricanteVeiculo: "Chevrolet", valorVeiculoUsd: 14500 },
  { anoVeiculo: 2021, modeloVeiculo: "Polo", fabricanteVeiculo: "Volkswagen", valorVeiculoUsd: 15500 },
  { anoVeiculo: 2018, modeloVeiculo: "Versa", fabricanteVeiculo: "Nissan", valorVeiculoUsd: 11500 },
  { anoVeiculo: 2023, modeloVeiculo: "Corolla", fabricanteVeiculo: "Toyota", valorVeiculoUsd: 22500 },
  { anoVeiculo: 2020, modeloVeiculo: "Elantra", fabricanteVeiculo: "Hyundai", valorVeiculoUsd: 16000 },
  { anoVeiculo: 2021, modeloVeiculo: "City", fabricanteVeiculo: "Honda", valorVeiculoUsd: 17000 },
];
const PESOS_VEICULOS_MOCK = [40, 36, 34, 32, 28, 25, 23, 22];
const VEICULOS_POR_CADASTRO = VEICULOS_MOCK.flatMap((veiculo, index) =>
  Array.from({ length: PESOS_VEICULOS_MOCK[index] }, () => veiculo),
);

const percentualDoRegistro = (index: number) => index % 100;

const criarCadastro = (index: number): CadastroMotorista => {
  // The stride spreads weighted market slots across the deterministic records.
  const mercado =
    MERCADOS_POR_CADASTRO[(index * 37) % MERCADOS_POR_CADASTRO.length];
  const percentual = percentualDoRegistro(index);
  const documentoValidado = percentual < 93;
  const cnhExpirada = index % 17 === 0;
  const pontosNaCnh = (index * 7) % 31;
  const cnhValidada =
    documentoValidado &&
    percentual < 84 &&
    !cnhExpirada &&
    pontosNaCnh <= 20;
  const reputacaoConsultada = cnhValidada && percentual < 75;
  const contaCriada = reputacaoConsultada && percentual < 65;
  const cartaoEmitido = contaCriada && percentual < 62;
  const horaUtc = (index * 7 + Math.floor(index / 12) * 3) % 24;
  const idade = 20 + ((index * 7) % 43);
  const generoPorIndice = index % 3;
  const genero: GeneroMotorista =
    generoPorIndice === 0
      ? "Feminino"
      : generoPorIndice === 1
        ? "Masculino"
        : "Não informado";
  const avaliacao = 3.5 + ((index * 17 + (index % 7) * 3) % 15) / 10;
  const veiculo =
    VEICULOS_POR_CADASTRO[(index * 37) % VEICULOS_POR_CADASTRO.length];
  const transacoesCartao = contaCriada ? 2 + ((index * 7) % 19) : 0;
  const gastosCartaoUsd = contaCriada
    ? 40 + ((index * 137) % 1960)
    : 0;

  return {
    id: `DRV-${String(index + 1).padStart(4, "0")}`,
    ...mercado,
    segmento: SEGMENTOS[(index * 13) % SEGMENTOS.length],
    idade,
    genero,
    avaliacao,
    reclamacoes: (index * 5) % 4,
    ...veiculo,
    transacoesCartao,
    gastosCartaoUsd,
    horaUtc,
    documentoValidado,
    cnhExpirada,
    pontosNaCnh,
    cnhValidada,
    reputacaoConsultada,
    contaCriada,
    cartaoStatus: !contaCriada
      ? "nao_solicitado"
      : cartaoEmitido
        ? "emitido"
        : "retry",
    motivoRetry: cartaoEmitido
      ? ""
      : MOTIVOS_RETRY[index % MOTIVOS_RETRY.length],
    criadoEm: new Date(
      Date.UTC(2026, 9, 1 + (index % 28), horaUtc, (index * 11) % 60),
    ).toISOString(),
  };
};

export const CADASTROS_MOCK: CadastroMotorista[] = Array.from(
  { length: 240 },
  (_, index) => criarCadastro(index),
);

export const SEGMENTOS_MOTORISTA = SEGMENTOS;
export const REGIOES_MOCK = Array.from(
  new Set(MERCADOS.map(({ regiao }) => regiao)),
);
