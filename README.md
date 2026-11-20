# Onboarding de motoristas

Uma iniciativa simples criada durante **cerca de 2 horas de treinamento** para explorar a construção de um app Dynatrace. O projeto apresenta uma ideia de painel para acompanhar o onboarding de motoristas de aplicativos e alguns indicadores de negócio.

> **Protótipo de treinamento:** não é um produto pronto para produção. Os dados e integrações são simulados e não representam pessoas, transações, decisões financeiras ou operações reais.

## O que o app demonstra

- Funil de onboarding com etapas de validação de identidade, CNH, reputação, criação de conta e emissão de cartão
- Indicadores e destaques de adesão por região, cidade, horário e segmento
- Mapa global e mapa de calor de cadastros por região e horário
- Indicadores agregados e fictícios de perfil e avaliações
- Veículos mais utilizados, agrupados por ano, fabricante e modelo, com valores estimados fictícios em USD
- Fila de retry simulada para cartões cuja emissão está pendente
- Volume de compras e transações de cartão simulados, apresentados como valores brutos — não como receita líquida

Os registros são gerados localmente em `ui/app/data/onboarding.ts`. O app não consulta documentos, carteiras de motorista ou reputação em plataformas externas, nem emite cartões ou processa pagamentos.

## Tecnologias

- React e TypeScript
- Dynatrace App Toolkit (`dt-app`)
- Strato Design System e Strato Geo

## Executar localmente

Pré-requisitos: Node.js `>=20.19` (Node.js 24 é recomendado pelo Dynatrace App Toolkit) e npm.

```bash
npm ci
npm run start
```

O comando inicia o servidor local do Dynatrace App Toolkit. Siga a URL exibida no terminal para abrir o app.

## Verificações

```bash
npm run build
npm run lint
```

## Configuração do ambiente Dynatrace

O `app.config.json` aponta para o ambiente Dynatrace de playground usado no treinamento. Para usar outro ambiente, ajuste essa configuração conforme as instruções oficiais do Dynatrace App Toolkit e os acessos disponíveis para sua conta. Nunca publique tokens ou credenciais no repositório.

## Contexto

Este repositório registra um exercício introdutório: uma primeira versão feita em aproximadamente duas horas de treinamento, com foco em aprender e experimentar. A estrutura, os dados, as regras de negócio, a segurança e as integrações precisariam de revisão e implementação próprias antes de qualquer uso real.
