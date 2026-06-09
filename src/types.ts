// Contrato de dados do Mapa de Infra.
// Este é o shape que o extrator (InfraMap / `terraform show -json`) deve produzir.
// A UI consome exatamente estas interfaces — trocar o mock significa devolver um InfraGraph.

export type Layer = "rede" | "computacao" | "dados" | "mensageria";

export type Environment = "dev" | "prod";

export type NodeType =
  | "vpc"
  | "subnet"
  | "nlb"
  | "pod"
  | "lambda"
  | "rds"
  | "rds_replica"
  | "s3"
  | "cache"
  | "queue"
  | "topic";

export interface InfraNode {
  id: string;
  label: string;
  type: NodeType;
  layer: Layer;
  environments: Environment[]; // em quais ambientes o nó existe
  attributes: Record<string, string | number>; // ex: { engine: "postgres", instance_class: "db.t3.medium", replicas: 3 }
  sourceRef: string; // arquivo IaC de origem, ex: "infra/rds.tf"
}

export interface InfraEdge {
  id: string;
  source: string;
  target: string;
  kind: "rede" | "dados" | "dependencia";
  environments: Environment[];
}

export interface InfraGraph {
  sa: string;
  nodes: InfraNode[];
  edges: InfraEdge[];
}
