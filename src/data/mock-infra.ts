import type { InfraGraph } from "../types";

// =============================================================================
// MOCK ISOLADO — Mapa de Infra da SA "pagamentos-api"
//
// Este arquivo imita o JSON que um extrator de IaC (InfraMap / `terraform show
// -json`) produziria. NÃO há parsing real de Terraform aqui — é dado declarado
// (desired state) escrito à mão.
//
// >>> PARA TROCAR PELO DADO REAL: ver `getMockGraph()` no fim do arquivo. <<<
// =============================================================================

// Repositório de IaC da SA. Usado pelo painel lateral para linkar o sourceRef
// direto no GitHub. Trocar pela URL real do repo da SA.
export const REPO_URL = "https://github.com/zup-banking/pagamentos-api-infra";
export const REPO_DEFAULT_BRANCH = "main";

export const mockGraph: InfraGraph = {
  sa: "pagamentos-api",
  nodes: [
    // ---------------------------------------------------------------- REDE
    {
      id: "vpc-pagamentos",
      label: "VPC pagamentos",
      type: "vpc",
      layer: "rede",
      environments: ["dev", "prod"],
      attributes: {
        cidr: "10.42.0.0/16",
        region: "sa-east-1",
        dns_hostnames: "enabled",
      },
      sourceRef: "infra/network/vpc.tf",
    },
    {
      id: "subnet-privada",
      label: "Subnet privada",
      type: "subnet",
      layer: "rede",
      environments: ["dev", "prod"],
      attributes: {
        cidr: "10.42.16.0/20",
        tier: "private",
        azs: 3,
      },
      sourceRef: "infra/network/subnets.tf",
    },
    {
      id: "nlb-pagamentos",
      label: "NLB pagamentos",
      type: "nlb",
      layer: "rede",
      environments: ["dev", "prod"],
      attributes: {
        scheme: "internal",
        listeners: "TCP:443",
        cross_zone: "enabled",
      },
      sourceRef: "infra/network/nlb.tf",
    },

    // ----------------------------------------------------------- COMPUTACAO
    {
      id: "pod-api",
      label: "pagamentos-api (pod)",
      type: "pod",
      layer: "computacao",
      environments: ["dev", "prod"],
      attributes: {
        // valor representado aqui é o de prod; o badge por ambiente é
        // resolvido em runtime (ver theme.ts → environmentBadge).
        replicas: 3,
        cpu: "500m",
        memory: "1Gi",
        namespace: "pagamentos",
      },
      sourceRef: "infra/eks/deployment-api.tf",
    },
    {
      // SÓ PROD — worker assíncrono de conciliação
      id: "pod-worker",
      label: "conciliacao-worker (pod)",
      type: "pod",
      layer: "computacao",
      environments: ["prod"],
      attributes: {
        replicas: 2,
        cpu: "250m",
        memory: "512Mi",
        namespace: "pagamentos",
      },
      sourceRef: "infra/eks/deployment-worker.tf",
    },
    {
      id: "lambda-callbacks",
      label: "callbacks-handler",
      type: "lambda",
      layer: "computacao",
      environments: ["dev", "prod"],
      attributes: {
        runtime: "nodejs20.x",
        memory_mb: 256,
        timeout_s: 30,
      },
      sourceRef: "infra/lambda/callbacks.tf",
    },

    // ---------------------------------------------------------------- DADOS
    {
      id: "rds-pagamentos",
      label: "rds-pagamentos (primary)",
      type: "rds",
      layer: "dados",
      environments: ["dev", "prod"],
      attributes: {
        engine: "postgres",
        engine_version: "15.5",
        // instance_class de prod; em dev a UI mostra db.t3.medium (ver theme.ts)
        instance_class: "db.r6g.large",
        multi_az: "true",
        storage_gb: 200,
      },
      sourceRef: "infra/rds/pagamentos.tf",
    },
    {
      // SÓ PROD — réplica de leitura
      id: "rds-pagamentos-replica",
      label: "rds-pagamentos (replica)",
      type: "rds_replica",
      layer: "dados",
      environments: ["prod"],
      attributes: {
        engine: "postgres",
        instance_class: "db.r6g.large",
        replica_of: "rds-pagamentos",
        read_only: "true",
      },
      sourceRef: "infra/rds/pagamentos.tf",
    },
    {
      id: "s3-comprovantes",
      label: "s3-comprovantes",
      type: "s3",
      layer: "dados",
      environments: ["dev", "prod"],
      attributes: {
        versioning: "enabled",
        encryption: "aws:kms",
        lifecycle: "glacier-90d",
      },
      sourceRef: "infra/s3/comprovantes.tf",
    },
    {
      id: "cache-redis",
      label: "cache-redis",
      type: "cache",
      layer: "dados",
      environments: ["dev", "prod"],
      attributes: {
        engine: "redis",
        node_type: "cache.r6g.large",
        nodes: 2,
      },
      sourceRef: "infra/elasticache/redis.tf",
    },

    // ----------------------------------------------------------- MENSAGERIA
    {
      id: "queue-transacoes",
      label: "fila-transacoes",
      type: "queue",
      layer: "mensageria",
      environments: ["dev", "prod"],
      attributes: {
        type: "SQS",
        visibility_timeout_s: 60,
        dlq: "fila-transacoes-dlq",
      },
      sourceRef: "infra/sqs/transacoes.tf",
    },
    {
      id: "topic-eventos",
      label: "eventos-pagamento",
      type: "topic",
      layer: "mensageria",
      environments: ["dev", "prod"],
      attributes: {
        type: "SNS",
        fifo: "false",
        subscriptions: 4,
      },
      sourceRef: "infra/sns/eventos.tf",
    },
    {
      // SÓ PROD — fila dedicada de conciliação consumida pelo worker
      id: "queue-conciliacao",
      label: "fila-conciliacao",
      type: "queue",
      layer: "mensageria",
      environments: ["prod"],
      attributes: {
        type: "SQS",
        visibility_timeout_s: 300,
        dlq: "fila-conciliacao-dlq",
      },
      sourceRef: "infra/sqs/conciliacao.tf",
    },
  ],
  edges: [
    // rede / dependência estrutural
    {
      id: "e-subnet-vpc",
      source: "subnet-privada",
      target: "vpc-pagamentos",
      kind: "dependencia",
      environments: ["dev", "prod"],
    },
    {
      id: "e-nlb-subnet",
      source: "nlb-pagamentos",
      target: "subnet-privada",
      kind: "rede",
      environments: ["dev", "prod"],
    },
    // tráfego de rede para a aplicação
    {
      id: "e-nlb-pod",
      source: "nlb-pagamentos",
      target: "pod-api",
      kind: "rede",
      environments: ["dev", "prod"],
    },
    // dados — pod-api
    {
      id: "e-pod-rds",
      source: "pod-api",
      target: "rds-pagamentos",
      kind: "dados",
      environments: ["dev", "prod"],
    },
    {
      id: "e-pod-replica",
      source: "pod-api",
      target: "rds-pagamentos-replica",
      kind: "dados",
      environments: ["prod"],
    },
    {
      id: "e-pod-cache",
      source: "pod-api",
      target: "cache-redis",
      kind: "dados",
      environments: ["dev", "prod"],
    },
    {
      id: "e-pod-s3",
      source: "pod-api",
      target: "s3-comprovantes",
      kind: "dados",
      environments: ["dev", "prod"],
    },
    // mensageria — pod-api publica
    {
      id: "e-pod-queue",
      source: "pod-api",
      target: "queue-transacoes",
      kind: "dependencia",
      environments: ["dev", "prod"],
    },
    {
      id: "e-pod-topic",
      source: "pod-api",
      target: "topic-eventos",
      kind: "dependencia",
      environments: ["dev", "prod"],
    },
    // lambda de callbacks publica no tópico
    {
      id: "e-lambda-topic",
      source: "lambda-callbacks",
      target: "topic-eventos",
      kind: "dependencia",
      environments: ["dev", "prod"],
    },
    // SÓ PROD — pipeline de conciliação
    {
      id: "e-topic-queue-conc",
      source: "topic-eventos",
      target: "queue-conciliacao",
      kind: "dependencia",
      environments: ["prod"],
    },
    {
      id: "e-worker-queue-conc",
      source: "pod-worker",
      target: "queue-conciliacao",
      kind: "dependencia",
      environments: ["prod"],
    },
    {
      id: "e-worker-rds",
      source: "pod-worker",
      target: "rds-pagamentos",
      kind: "dados",
      environments: ["prod"],
    },
  ],
};

// -----------------------------------------------------------------------------
// Overrides de atributos por ambiente.
// O contrato InfraNode guarda UM conjunto de attributes (desired state geral).
// Aqui registramos as diferenças visíveis entre dev e prod sem inflar o tipo.
// Consumido por theme.ts → resolveAttributes(node, env).
// -----------------------------------------------------------------------------
export const attributeOverrides: Record<
  string,
  Partial<Record<"dev" | "prod", Record<string, string | number>>>
> = {
  "pod-api": {
    dev: { replicas: 1, cpu: "250m", memory: "512Mi" },
    prod: { replicas: 3, cpu: "500m", memory: "1Gi" },
  },
  "rds-pagamentos": {
    dev: { instance_class: "db.t3.medium", multi_az: "false", storage_gb: 50 },
    prod: { instance_class: "db.r6g.large", multi_az: "true", storage_gb: 200 },
  },
  "cache-redis": {
    dev: { node_type: "cache.t3.small", nodes: 1 },
    prod: { node_type: "cache.r6g.large", nodes: 2 },
  },
};

// =============================================================================
// PONTO DE TROCA PELO DADO REAL
//
// Hoje retorna o mock acima com um pequeno delay (simula fetch / exercita o
// estado de loading). Para integrar o extrator real, troque o corpo por algo
// como:
//
//   export async function getMockGraph(): Promise<InfraGraph> {
//     const res = await fetch("/api/sa/pagamentos-api/infra-map");
//     return (await res.json()) as InfraGraph; // mesmo shape InfraGraph
//   }
//
// Mantenha o retorno no formato InfraGraph e a UI continua funcionando.
// =============================================================================
export function getMockGraph(): Promise<InfraGraph> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGraph), 600);
  });
}
