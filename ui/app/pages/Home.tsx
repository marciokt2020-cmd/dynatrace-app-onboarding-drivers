import React, { useMemo, useState } from "react";

import { Button } from "@dynatrace/strato-components/buttons";
import {
  CategoricalBarChart,
  SingleValue,
  XYChart,
} from "@dynatrace/strato-components/charts";
import { MessageContainer } from "@dynatrace/strato-components/content";
import { FormField, Label, Select } from "@dynatrace/strato-components/forms";
import { Flex, Surface } from "@dynatrace/strato-components/layouts";
import {
  DataTable,
  type DataTableColumnDef,
} from "@dynatrace/strato-components/tables";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import {
  ChoroplethLayer,
  MapView,
  SequentialLegend,
} from "@dynatrace/strato-geo";

import {
  CADASTROS_MOCK,
  REGIOES_MOCK,
  SEGMENTOS_MOTORISTA,
  type CadastroMotorista,
} from "../data/onboarding";

const numeroPtBr = new Intl.NumberFormat("pt-BR");
const decimalPtBr = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});
const moedaUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const dataHoraPtBr = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "UTC",
});
const PALETA_MOVIMENTO = [
  "var(--dt-colors-charts-status-ideal-default)",
  "var(--dt-colors-charts-status-warning-default)",
  "var(--dt-colors-charts-status-critical-default)",
];

interface ResumoVeiculo {
  id: string;
  ano: number;
  fabricante: string;
  modelo: string;
  motoristas: number;
  valorMedioUsd: number;
}

const HORAS_UTC = Array.from({ length: 8 }, (_, index) => index * 3);
const FAIXAS_ETARIAS = [
  "18 a 24 anos",
  "25 a 34 anos",
  "35 a 44 anos",
  "45 a 54 anos",
  "55 anos ou mais",
];

const faixaEtaria = (idade: number) => {
  if (idade < 25) return FAIXAS_ETARIAS[0];
  if (idade < 35) return FAIXAS_ETARIAS[1];
  if (idade < 45) return FAIXAS_ETARIAS[2];
  if (idade < 55) return FAIXAS_ETARIAS[3];
  return FAIXAS_ETARIAS[4];
};

const mediaAvaliacao = (cadastros: CadastroMotorista[]) =>
  cadastros.length === 0
    ? 0
    : cadastros.reduce((total, cadastro) => total + cadastro.avaliacao, 0) /
      cadastros.length;

const colunasRetry: DataTableColumnDef<CadastroMotorista>[] = [
  { id: "cadastro", header: "Cadastro", accessor: "id" },
  {
    id: "localidade",
    header: "Localidade",
    accessor: (cadastro) => `${cadastro.cidade}, ${cadastro.pais}`,
  },
  { id: "motivo", header: "Motivo", accessor: "motivoRetry" },
  { id: "segmento", header: "Segmento", accessor: "segmento" },
  {
    id: "criadoEm",
    header: "Criado (UTC)",
    accessor: (cadastro) => dataHoraPtBr.format(new Date(cadastro.criadoEm)),
  },
];

const colunasVeiculos: DataTableColumnDef<ResumoVeiculo>[] = [
  { id: "ano", header: "Ano", accessor: "ano" },
  { id: "fabricante", header: "Fabricante", accessor: "fabricante" },
  { id: "modelo", header: "Modelo", accessor: "modelo" },
  { id: "motoristas", header: "Motoristas", accessor: "motoristas" },
  {
    id: "valorMedio",
    header: "Valor médio",
    accessor: (veiculo) => moedaUsd.format(veiculo.valorMedioUsd),
  },
];

export const Home = () => {
  const [segmentoSelecionado, setSegmentoSelecionado] = useState("todos");
  const [regiaoSelecionada, setRegiaoSelecionada] = useState("todas");
  const [retriesConcluidos, setRetriesConcluidos] = useState<string[]>([]);

  const cadastros = useMemo(
    () =>
      CADASTROS_MOCK.filter(
        (cadastro) =>
          (segmentoSelecionado === "todos" ||
            cadastro.segmento === segmentoSelecionado) &&
          (regiaoSelecionada === "todas" ||
            cadastro.regiao === regiaoSelecionada),
      ),
    [regiaoSelecionada, segmentoSelecionado],
  );
  const contasCriadas = cadastros.filter((cadastro) => cadastro.contaCriada);
  const cartoesEmitidos = contasCriadas.filter(
    (cadastro) =>
      cadastro.cartaoStatus === "emitido" ||
      retriesConcluidos.includes(cadastro.id),
  );
  const filaRetry = contasCriadas.filter(
    (cadastro) =>
      cadastro.cartaoStatus === "retry" &&
      !retriesConcluidos.includes(cadastro.id),
  );
  const cartoesEmUso = contasCriadas.filter(
    (cadastro) =>
      cadastro.cartaoStatus === "emitido" ||
      retriesConcluidos.includes(cadastro.id),
  );
  const gastosCartaoUsd = cartoesEmUso.reduce(
    (total, cadastro) => total + cadastro.gastosCartaoUsd,
    0,
  );
  const transacoesCartao = cartoesEmUso.reduce(
    (total, cadastro) => total + cadastro.transacoesCartao,
    0,
  );
  const cartaoRate =
    contasCriadas.length === 0
      ? 0
      : (cartoesEmitidos.length / contasCriadas.length) * 100;
  const cnhsExpiradas = cadastros.filter(
    (cadastro) => cadastro.documentoValidado && cadastro.cnhExpirada,
  ).length;
  const cnhsAcimaDoLimite = cadastros.filter(
    (cadastro) => cadastro.documentoValidado && cadastro.pontosNaCnh > 20,
  ).length;
  const motoristasAvaliados = cadastros.filter(
    (cadastro) => cadastro.reputacaoConsultada && cadastro.contaCriada,
  );
  const totalReclamacoes = motoristasAvaliados.reduce(
    (total, cadastro) => total + cadastro.reclamacoes,
    0,
  );

  const etapas = [
    { nome: "Cadastros iniciados", quantidade: cadastros.length },
    {
      nome: "RG/CPF autenticado",
      quantidade: cadastros.filter((cadastro) => cadastro.documentoValidado)
        .length,
    },
    {
      nome: "CNH válida (validade e pontos)",
      quantidade: cadastros.filter((cadastro) => cadastro.cnhValidada).length,
    },
    {
      nome: "Reputação em outras plataformas",
      quantidade: cadastros.filter((cadastro) => cadastro.reputacaoConsultada)
        .length,
    },
    { nome: "Conta criada", quantidade: contasCriadas.length },
    { nome: "Cartão Jedyna emitido", quantidade: cartoesEmitidos.length },
  ];
  const dadosFunil = etapas.map((etapa) => ({
    category:
      cadastros.length === 0
        ? etapa.nome
        : `${etapa.nome} · ${Math.round((etapa.quantidade / cadastros.length) * 100)}%`,
    value: etapa.quantidade,
  }));
  const perdasPorEtapa = etapas.slice(1).map((etapa, index) => {
    const quantidadeAnterior = etapas[index].quantidade;
    const perda = Math.max(0, quantidadeAnterior - etapa.quantidade);
    return {
      nome: etapa.nome,
      perda,
      percentual:
        quantidadeAnterior === 0 ? 0 : (perda / quantidadeAnterior) * 100,
    };
  });
  const maiorPerda = perdasPorEtapa.reduce(
    (maior, perda) => (perda.perda > maior.perda ? perda : maior),
    perdasPorEtapa[0],
  );
  const taxaCartaoPorCadastro =
    cadastros.length === 0 ? 0 : (cartoesEmitidos.length / cadastros.length) * 100;
  const taxaRetryPorConta =
    contasCriadas.length === 0 ? 0 : (filaRetry.length / contasCriadas.length) * 100;

  const dadosPorSegmento = SEGMENTOS_MOTORISTA.map((segmento) => ({
    category: segmento,
    value: cadastros.filter((cadastro) => cadastro.segmento === segmento)
      .length,
  }));
  const segmentosPorVolume = [...dadosPorSegmento].sort(
    (a, b) => b.value - a.value,
  );
  const dadosVeiculos = useMemo(() => {
    const veiculos = new Map<string, ResumoVeiculo>();
    for (const cadastro of cadastros) {
      const id = [
        cadastro.anoVeiculo,
        cadastro.fabricanteVeiculo,
        cadastro.modeloVeiculo,
      ].join("-");
      const atual = veiculos.get(id);
      veiculos.set(id, {
        id,
        ano: cadastro.anoVeiculo,
        fabricante: cadastro.fabricanteVeiculo,
        modelo: cadastro.modeloVeiculo,
        motoristas: (atual?.motoristas ?? 0) + 1,
        valorMedioUsd:
          ((atual?.valorMedioUsd ?? 0) * (atual?.motoristas ?? 0) +
            cadastro.valorVeiculoUsd) /
          ((atual?.motoristas ?? 0) + 1),
      });
    }
    return Array.from(veiculos.values())
      .sort((a, b) => b.motoristas - a.motoristas)
      .slice(0, 5);
  }, [cadastros]);

  const dadosPorPais = useMemo(() => {
    const paises = new Map<
      string,
      { codigoPais: string; pais: string; cadastros: number }
    >();
    for (const cadastro of cadastros) {
      const atual = paises.get(cadastro.codigoPais);
      paises.set(cadastro.codigoPais, {
        codigoPais: cadastro.codigoPais,
        pais: cadastro.pais,
        cadastros: (atual?.cadastros ?? 0) + 1,
      });
    }
    return Array.from(paises.values());
  }, [cadastros]);
  const maiorVolumePais = Math.max(
    1,
    ...dadosPorPais.map(({ cadastros: total }) => total),
  );

  const dadosCalor = useMemo(
    () =>
      REGIOES_MOCK.flatMap((regiao) =>
        HORAS_UTC.map((hora) => {
          const inicio = new Date(Date.UTC(2026, 9, 1, hora));
          const fim = new Date(Date.UTC(2026, 9, 1, hora + 3));
          return {
            vertical: { start: regiao },
            horizontal: { start: inicio, end: fim },
            metricas: {
              cadastros: cadastros.filter(
                (cadastro) =>
                  cadastro.regiao === regiao &&
                  cadastro.horaUtc >= hora &&
                  cadastro.horaUtc < hora + 3,
              ).length,
            },
          };
        }),
      ),
    [cadastros],
  );

  const regioesPorVolume = useMemo(() => {
    const totais = new Map<string, number>();
    for (const cadastro of cadastros) {
      totais.set(
        cadastro.regiao,
        (totais.get(cadastro.regiao) ?? 0) + 1,
      );
    }
    return Array.from(totais.entries()).sort((a, b) => b[1] - a[1]);
  }, [cadastros]);
  const cidadesPorVolume = useMemo(() => {
    const totais = new Map<string, number>();
    for (const cadastro of cadastros) {
      const cidade = `${cadastro.cidade}, ${cadastro.pais}`;
      totais.set(cidade, (totais.get(cidade) ?? 0) + 1);
    }
    return Array.from(totais.entries()).sort((a, b) => b[1] - a[1]);
  }, [cadastros]);
  const horariosPorVolume = useMemo(
    () =>
      HORAS_UTC.map((hora) => ({
        hora,
        quantidade: cadastros.filter(
          (cadastro) =>
            cadastro.horaUtc >= hora && cadastro.horaUtc < hora + 3,
        ).length,
      })).sort((a, b) => b.quantidade - a.quantidade),
    [cadastros],
  );

  const melhoresFaixasEtarias = FAIXAS_ETARIAS.map((faixa) => {
    const grupo = motoristasAvaliados.filter(
      (cadastro) => faixaEtaria(cadastro.idade) === faixa,
    );
    return { faixa, quantidade: grupo.length, media: mediaAvaliacao(grupo) };
  })
    .filter((grupo) => grupo.quantidade > 0)
    .sort((a, b) => b.media - a.media);
  const melhoresGeneros = (
    ["Feminino", "Masculino", "Não informado"] as const
  )
    .map((genero) => {
      const grupo = motoristasAvaliados.filter(
        (cadastro) => cadastro.genero === genero,
      );
      return { genero, quantidade: grupo.length, media: mediaAvaliacao(grupo) };
    })
    .filter((grupo) => grupo.quantidade > 0)
    .sort((a, b) => b.media - a.media);

  const quantidadeRetriesConcluidos = cadastros.filter((cadastro) =>
    retriesConcluidos.includes(cadastro.id),
  ).length;

  const tentarRetry = (id: string) => {
    setRetriesConcluidos((atuais) =>
      atuais.includes(id) ? atuais : [...atuais, id],
    );
  };

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Flex flexDirection="column" gap={4}>
        <Heading level={1}>Onboarding de motoristas</Heading>
        <Paragraph>
          Visão global de validações, adesões e emissão do cartão Jedyna
        </Paragraph>
      </Flex>

      <MessageContainer variant="neutral">
        <MessageContainer.Title>
          Ambiente de demonstração
        </MessageContainer.Title>
        <MessageContainer.Description>
          Todos os registros são sintéticos. Validações de documento, CNH,
          reputação e cartão são simuladas; nenhuma integração externa ou
          consulta real é executada. Insights demográficos são agregados e não
          devem ser usados para decisões individuais ou de crédito.
        </MessageContainer.Description>
      </MessageContainer>

      <Flex flexFlow="wrap" gap={16}>
        <FormField>
          <Label>Segmento</Label>
          <Select
            id="segmento-filter"
            name="segmento"
            value={segmentoSelecionado}
            onChange={(valor) => setSegmentoSelecionado(valor ?? "todos")}
          >
            <Select.Content>
              <Select.Option value="todos">Todos os segmentos</Select.Option>
              {SEGMENTOS_MOTORISTA.map((segmento) => (
                <Select.Option key={segmento} value={segmento}>
                  {segmento}
                </Select.Option>
              ))}
            </Select.Content>
          </Select>
        </FormField>
        <FormField>
          <Label>Região</Label>
          <Select
            id="regiao-filter"
            name="regiao"
            value={regiaoSelecionada}
            onChange={(valor) => setRegiaoSelecionada(valor ?? "todas")}
          >
            <Select.Content>
              <Select.Option value="todas">Todas as regiões</Select.Option>
              {REGIOES_MOCK.map((regiao) => (
                <Select.Option key={regiao} value={regiao}>
                  {regiao}
                </Select.Option>
              ))}
            </Select.Content>
          </Select>
        </FormField>
      </Flex>

      <Heading level={2}>Indicadores principais</Heading>
      <Flex flexFlow="wrap" gap={16}>
        <Surface padding={16}>
          <SingleValue
            label="Cadastros iniciados"
            data={numeroPtBr.format(cadastros.length)}
            width={220}
            height={72}
          />
        </Surface>
        <Surface padding={16}>
          <SingleValue
            label="Contas criadas"
            data={numeroPtBr.format(contasCriadas.length)}
            width={220}
            height={72}
          />
        </Surface>
        <Surface padding={16}>
          <SingleValue
            label="Cartões Jedyna emitidos"
            data={numeroPtBr.format(cartoesEmitidos.length)}
            width={220}
            height={72}
          />
        </Surface>
        <Surface padding={16}>
          <SingleValue
            label="Emissão após criação da conta"
            data={`${decimalPtBr.format(cartaoRate)}%`}
            width={220}
            height={72}
          />
        </Surface>
        <Surface padding={16}>
          <SingleValue
            label="Cartões aguardando retry"
            data={numeroPtBr.format(filaRetry.length)}
            width={220}
            height={72}
          />
        </Surface>
        <Surface padding={16}>
          <SingleValue
            label="Volume transacionado nos cartões (mock)"
            data={moedaUsd.format(gastosCartaoUsd)}
            width={260}
            height={72}
          />
        </Surface>
      </Flex>

      <Surface padding={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading level={2}>Funil da jornada de onboarding</Heading>
          {cadastros.length > 0 ? (
            <CategoricalBarChart
              data={dadosFunil}
              layout="horizontal"
              height={340}
              colorPaletteMode="multi-color"
              colorPalette="categorical-vivid"
            >
              <CategoricalBarChart.ValueAxis label="Motoristas" />
            </CategoricalBarChart>
          ) : (
            <MessageContainer>
              <MessageContainer.Description>
                Não há cadastros para os filtros selecionados. Escolha outro
                segmento ou região.
              </MessageContainer.Description>
            </MessageContainer>
          )}
        </Flex>
      </Surface>

      <Surface padding={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading level={2}>Sinais das validações</Heading>
          <Paragraph>
            RG/CPF autenticados:{" "}
            {numeroPtBr.format(
              cadastros.filter((cadastro) => cadastro.documentoValidado).length,
            )}{" "}
            de {numeroPtBr.format(cadastros.length)} cadastros
          </Paragraph>
          <Paragraph>
            CNHs vencidas: {numeroPtBr.format(cnhsExpiradas)} · CNHs com mais de
            20 pontos: {numeroPtBr.format(cnhsAcimaDoLimite)}
          </Paragraph>
          <Paragraph>
            O limite de pontos é ilustrativo para este mock; regras reais
            dependem da jurisdição e precisam ser validadas localmente.
          </Paragraph>
        </Flex>
      </Surface>

      <Surface padding={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading level={2}>Oportunidades da jornada</Heading>
          {cadastros.length > 0 ? (
            <Flex flexFlow="wrap" gap={16}>
              <Surface padding={16}>
                <SingleValue
                  label="Maior perda entre etapas"
                  data={numeroPtBr.format(maiorPerda.perda)}
                  width={240}
                  height={72}
                />
                <Paragraph>
                  {maiorPerda.nome}: {decimalPtBr.format(maiorPerda.percentual)}%
                  em relação à etapa anterior
                </Paragraph>
              </Surface>
              <Surface padding={16}>
                <SingleValue
                  label="Conversão até cartão"
                  data={`${decimalPtBr.format(taxaCartaoPorCadastro)}%`}
                  width={240}
                  height={72}
                />
                <Paragraph>
                  Cartões emitidos sobre todos os cadastros iniciados
                </Paragraph>
              </Surface>
              <Surface padding={16}>
                <SingleValue
                  label="Contas com cartão pendente"
                  data={`${decimalPtBr.format(taxaRetryPorConta)}%`}
                  width={240}
                  height={72}
                />
                <Paragraph>
                  {numeroPtBr.format(filaRetry.length)} de{" "}
                  {numeroPtBr.format(contasCriadas.length)} contas criadas
                  aguardam nova tentativa
                </Paragraph>
              </Surface>
            </Flex>
          ) : (
            <MessageContainer>
              <MessageContainer.Description>
                Não há dados para calcular oportunidades. Ajuste os filtros
                selecionados.
              </MessageContainer.Description>
            </MessageContainer>
          )}
        </Flex>
      </Surface>

      <Flex flexDirection="column" gap={8}>
        <Heading level={2}>Adesão global por localidade</Heading>
        <Paragraph>
          Volume de cadastros iniciados por país; passe o cursor sobre uma
          região para consultar o valor
        </Paragraph>
        {dadosPorPais.length > 0 ? (
          <MapView
            height={420}
            initialViewState={{ zoom: 1, latitude: 20, longitude: 0 }}
          >
            <ChoroplethLayer
              data={dadosPorPais}
              regionAccessor="codigoPais"
              valueAccessor="cadastros"
              color="legend"
            />
            <SequentialLegend
              min={0}
              max={maiorVolumePais}
              colorPalette="pink-purple"
            />
            <MapView.ErrorState>
              {(errorMessage) => (
                <MessageContainer variant="critical">
                  <MessageContainer.Title>
                    Mapa indisponível
                  </MessageContainer.Title>
                  <MessageContainer.Description>
                    {errorMessage}
                  </MessageContainer.Description>
                </MessageContainer>
              )}
            </MapView.ErrorState>
          </MapView>
        ) : (
          <MessageContainer>
            <MessageContainer.Description>
              Não há dados geográficos para os filtros selecionados.
            </MessageContainer.Description>
          </MessageContainer>
        )}
      </Flex>

      <Surface padding={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading level={2}>Mapa de calor por região e horário</Heading>
          <Paragraph>
            Cadastros iniciados por região e faixa de três horas, em UTC
          </Paragraph>
          {cadastros.length > 0 ? (
            <XYChart
              data={dadosCalor}
              height={360}
              colorPalette={PALETA_MOVIMENTO}
            >
              <XYChart.RectSeries
                xAxisId="regioes"
                yAxisId="horarios"
                x0Accessor="vertical.start"
                y0Accessor="horizontal.start"
                y1Accessor="horizontal.end"
                valueAccessor="metricas.cadastros"
                valueAccessorLabel="Cadastros"
              />
              <XYChart.XAxis
                id="regioes"
                type="categorical"
                position="bottom"
                label="Região"
              />
              <XYChart.YAxis
                id="horarios"
                type="time"
                position="left"
                label="Horário UTC"
              />
            </XYChart>
          ) : (
            <MessageContainer>
              <MessageContainer.Description>
                Não há cadastros para compor o mapa de calor.
              </MessageContainer.Description>
            </MessageContainer>
          )}
          {cadastros.length > 0 && (
            <Paragraph>
              Leitura de intensidade: verde indica movimento baixo, amarelo
              moderado e vermelho alto. Valores representam cadastros no mock.
            </Paragraph>
          )}
        </Flex>
      </Surface>

      <Flex flexFlow="wrap" gap={16} width="100%">
        <Flex flex="1 1 320px" minWidth={0}>
          <Surface padding={16}>
            <Flex flexDirection="column" gap={8}>
              <Heading level={2}>Cadastros por segmento</Heading>
              {cadastros.length > 0 ? (
                <CategoricalBarChart
                  data={dadosPorSegmento}
                  layout="horizontal"
                  height={260}
                  colorPaletteMode="single-color"
                  colorPalette="blue"
                >
                  <CategoricalBarChart.ValueAxis label="Motoristas" />
                </CategoricalBarChart>
              ) : (
                <MessageContainer>
                  <MessageContainer.Description>
                    Sem dados para os filtros selecionados. Ajuste os filtros
                    para consultar os segmentos.
                  </MessageContainer.Description>
                </MessageContainer>
              )}
            </Flex>
          </Surface>
        </Flex>
        <Flex flex="1 1 320px" minWidth={0}>
          <Surface padding={16}>
            <Flex flexDirection="column" gap={8}>
              <Heading level={2}>Destaques de adesão</Heading>
              {cadastros.length > 0 && regioesPorVolume.length > 0 ? (
                <>
                  <Paragraph>
                    Região líder: {regioesPorVolume[0][0]} (
                    {numeroPtBr.format(regioesPorVolume[0][1])} cadastros;{" "}
                    {decimalPtBr.format(
                      (regioesPorVolume[0][1] / cadastros.length) * 100,
                    )}
                    %)
                  </Paragraph>
                  <Paragraph>
                    Cidade líder: {cidadesPorVolume[0][0]} (
                    {numeroPtBr.format(cidadesPorVolume[0][1])} cadastros)
                  </Paragraph>
                  <Paragraph>
                    Horário de pico: {horariosPorVolume[0].hora
                      .toString()
                      .padStart(2, "0")}
                    :00–{(horariosPorVolume[0].hora + 3)
                      .toString()
                      .padStart(2, "0")}
                    :00 UTC (
                    {numeroPtBr.format(horariosPorVolume[0].quantidade)} novos
                    cadastros)
                  </Paragraph>
                  <Paragraph>
                    Segmento líder:{" "}
                    {segmentosPorVolume[0].category} (
                    {numeroPtBr.format(segmentosPorVolume[0].value)}{" "}
                    cadastros)
                  </Paragraph>
                  <Paragraph>
                    Conversão em conta:{" "}
                    {decimalPtBr.format(
                      (contasCriadas.length / cadastros.length) * 100,
                    )}
                    % ({numeroPtBr.format(contasCriadas.length)} contas)
                  </Paragraph>
                  <Paragraph>
                    Cartões emitidos: {numeroPtBr.format(cartoesEmitidos.length)}{" "}
                    de {numeroPtBr.format(contasCriadas.length)} contas (
                    {decimalPtBr.format(cartaoRate)}%)
                  </Paragraph>
                  <Paragraph>
                    Uso dos cartões: {numeroPtBr.format(transacoesCartao)}{" "}
                    transações, totalizando {moedaUsd.format(gastosCartaoUsd)}{" "}
                    em compras simuladas (USD). Volume bruto, não receita líquida.
                  </Paragraph>
                </>
              ) : (
                <MessageContainer>
                  <MessageContainer.Description>
                    Sem dados de adesão para os filtros selecionados. Ajuste os
                    filtros para ver os destaques.
                  </MessageContainer.Description>
                </MessageContainer>
              )}
            </Flex>
          </Surface>
        </Flex>
        <Flex flex="1 1 320px" minWidth={0}>
          <Surface padding={16}>
            <Flex flexDirection="column" gap={8}>
              <Heading level={2}>Veículos mais utilizados</Heading>
              <Paragraph>
                Top 5 combinações por ano, fabricante e modelo; valores de
                referência fictícios em USD
              </Paragraph>
              {dadosVeiculos.length > 0 ? (
                <DataTable<ResumoVeiculo>
                  data={dadosVeiculos}
                  columns={colunasVeiculos}
                  rowId={(veiculo) => veiculo.id}
                  fullWidth
                />
              ) : (
                <MessageContainer>
                  <MessageContainer.Description>
                    Sem veículos para os filtros selecionados. Ajuste os filtros
                    para consultar a frota.
                  </MessageContainer.Description>
                </MessageContainer>
              )}
            </Flex>
          </Surface>
        </Flex>
      </Flex>

      <Surface padding={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading level={2}>
            Perfil agregado dos motoristas mais bem avaliados
          </Heading>
          <Paragraph>
            Médias fictícias calculadas entre contas criadas com reputação
            consultada; os grupos não representam causalidade
          </Paragraph>
          {melhoresFaixasEtarias.length > 0 && melhoresGeneros.length > 0 ? (
            <Flex flexFlow="wrap" gap={16}>
              <Surface padding={16}>
                <SingleValue
                  label="Faixa etária com maior média"
                  data={melhoresFaixasEtarias[0].faixa}
                  width={260}
                  height={72}
                />
                <Paragraph>
                  {decimalPtBr.format(melhoresFaixasEtarias[0].media)} / 5 · n=
                  {numeroPtBr.format(melhoresFaixasEtarias[0].quantidade)}
                </Paragraph>
              </Surface>
              <Surface padding={16}>
                <SingleValue
                  label="Gênero com maior média"
                  data={melhoresGeneros[0].genero}
                  width={260}
                  height={72}
                />
                <Paragraph>
                  {decimalPtBr.format(melhoresGeneros[0].media)} / 5 · n=
                  {numeroPtBr.format(melhoresGeneros[0].quantidade)}
                </Paragraph>
              </Surface>
              <Surface padding={16}>
                <SingleValue
                  label="Média geral da reputação (mock)"
                  data={`${decimalPtBr.format(mediaAvaliacao(motoristasAvaliados))} / 5`}
                  width={260}
                  height={72}
                />
              </Surface>
              <Surface padding={16}>
                <SingleValue
                  label="Reclamações consultadas (mock)"
                  data={numeroPtBr.format(totalReclamacoes)}
                  width={260}
                  height={72}
                />
              </Surface>
            </Flex>
          ) : (
            <MessageContainer>
              <MessageContainer.Description>
                Ainda não há amostra suficiente de motoristas avaliados para os
                filtros selecionados.
              </MessageContainer.Description>
            </MessageContainer>
          )}
        </Flex>
      </Surface>

      <Surface padding={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading level={2}>Retry de emissão do cartão Jedyna</Heading>
          <Paragraph>
            Contas criadas sem confirmação de cartão entram nesta fila. A ação
            abaixo simula uma nova tentativa; não chama o banco.
          </Paragraph>
          {quantidadeRetriesConcluidos > 0 && (
            <MessageContainer variant="success">
              <MessageContainer.Title>
                Nova tentativa simulada concluída
              </MessageContainer.Title>
              <MessageContainer.Description>
                {numeroPtBr.format(quantidadeRetriesConcluidos)} cartão(ões)
                marcado(s) como emitido(s) no mock.
              </MessageContainer.Description>
            </MessageContainer>
          )}
          {filaRetry.length > 0 ? (
            <DataTable<CadastroMotorista>
              data={filaRetry}
              columns={colunasRetry}
              rowId={(cadastro) => cadastro.id}
              fullWidth
            >
              <DataTable.RowActions>
                {(cadastro: CadastroMotorista) => (
                  <Button
                    color="primary"
                    onClick={() => tentarRetry(cadastro.id)}
                  >
                    Reprocessar
                  </Button>
                )}
              </DataTable.RowActions>
            </DataTable>
          ) : (
            <MessageContainer variant="success">
              <MessageContainer.Description>
                Nenhum cartão aguarda retry para os filtros selecionados.
              </MessageContainer.Description>
            </MessageContainer>
          )}
        </Flex>
      </Surface>
    </Flex>
  );
};
