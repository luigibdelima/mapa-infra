import {
  Network,
  Layers,
  Waypoints,
  Boxes,
  Zap,
  Database,
  CopyPlus,
  HardDrive,
  Gauge,
  Inbox,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type { Environment, InfraEdge, InfraNode, Layer, NodeType } from "../types";
import { attributeOverrides } from "../data/mock-infra";

// ----------------------------------------------------------------- CAMADAS
// Ordem vertical das faixas (cima → baixo) e cor de cada camada.
export const LAYER_ORDER: Layer[] = ["rede", "computacao", "dados", "mensageria"];

export interface LayerStyle {
  label: string;
  // mapa ESTÁTICO de classes Tailwind (nada interpolado) — a cor indica a camada
  cardBg: string; // fundo do card do nó
  border: string; // borda do card
  chip: string; // bg do header colorido do card
  text: string; // texto sobre o chip
}

export const LAYER_STYLES: Record<Layer, LayerStyle> = {
  rede: {
    label: "Rede",
    cardBg: "bg-sky-50",
    border: "border-sky-300",
    chip: "bg-sky-100",
    text: "text-sky-800",
  },
  computacao: {
    label: "Computação",
    cardBg: "bg-violet-50",
    border: "border-violet-300",
    chip: "bg-violet-100",
    text: "text-violet-800",
  },
  dados: {
    label: "Dados",
    cardBg: "bg-emerald-50",
    border: "border-emerald-300",
    chip: "bg-emerald-100",
    text: "text-emerald-800",
  },
  mensageria: {
    label: "Mensageria",
    cardBg: "bg-amber-50",
    border: "border-amber-300",
    chip: "bg-amber-100",
    text: "text-amber-800",
  },
};

// ----------------------------------------------------------------- TIPOS
export interface TypeMeta {
  label: string;
  icon: LucideIcon;
}

export const TYPE_META: Record<NodeType, TypeMeta> = {
  vpc: { label: "VPC", icon: Network },
  subnet: { label: "Subnet", icon: Layers },
  nlb: { label: "Network LB", icon: Waypoints },
  pod: { label: "Pod (EKS)", icon: Boxes },
  lambda: { label: "Lambda", icon: Zap },
  rds: { label: "RDS", icon: Database },
  rds_replica: { label: "RDS réplica", icon: CopyPlus },
  s3: { label: "S3", icon: HardDrive },
  cache: { label: "Cache", icon: Gauge },
  queue: { label: "Fila", icon: Inbox },
  topic: { label: "Tópico", icon: Radio },
};

// ----------------------------------------------------------------- EDGES
export interface EdgeStyle {
  label: string;
  color: string; // cor da linha (stroke)
  dashed: boolean;
}

export const EDGE_STYLES: Record<InfraEdge["kind"], EdgeStyle> = {
  rede: { label: "Rede", color: "#0284c7", dashed: false },
  dados: { label: "Dados", color: "#059669", dashed: false },
  dependencia: { label: "Dependência", color: "#94a3b8", dashed: true },
};

// -----------------------------------------------------------------
// Resolve os atributos de um nó para o ambiente selecionado, aplicando
// os overrides declarados no mock (dev vs prod).
export function resolveAttributes(
  node: InfraNode,
  env: Environment
): Record<string, string | number> {
  const override = attributeOverrides[node.id]?.[env];
  return override ? { ...node.attributes, ...override } : { ...node.attributes };
}

// Atributo-chave exibido no badge do card, por tipo de nó.
export function environmentBadge(
  node: InfraNode,
  env: Environment
): string | null {
  const attrs = resolveAttributes(node, env);
  switch (node.type) {
    case "pod":
      return `${attrs.replicas} réplica${Number(attrs.replicas) > 1 ? "s" : ""}`;
    case "rds":
    case "rds_replica":
      return String(attrs.instance_class ?? attrs.engine ?? "");
    case "cache":
      return String(attrs.node_type ?? "");
    case "lambda":
      return `${attrs.memory_mb}MB`;
    case "queue":
    case "topic":
      return String(attrs.type ?? "");
    case "s3":
      return String(attrs.versioning ?? "");
    case "vpc":
      return String(attrs.cidr ?? "");
    case "subnet":
      return String(attrs.tier ?? "");
    case "nlb":
      return String(attrs.scheme ?? "");
    default:
      return null;
  }
}

// "Atributos-chave" compactos para a tabela (2 mais relevantes por tipo).
export function keyAttributesSummary(
  node: InfraNode,
  env: Environment
): string {
  const attrs = resolveAttributes(node, env);
  const pick = (...keys: string[]) =>
    keys
      .filter((k) => attrs[k] !== undefined)
      .map((k) => `${k}: ${attrs[k]}`)
      .join(" · ");

  switch (node.type) {
    case "pod":
      return pick("replicas", "cpu", "memory");
    case "rds":
    case "rds_replica":
      return pick("engine", "instance_class", "multi_az");
    case "cache":
      return pick("engine", "node_type", "nodes");
    case "lambda":
      return pick("runtime", "memory_mb");
    case "queue":
    case "topic":
      return pick("type", "dlq", "subscriptions");
    case "s3":
      return pick("versioning", "encryption");
    case "vpc":
    case "subnet":
      return pick("cidr", "region", "tier");
    case "nlb":
      return pick("scheme", "listeners");
    default: {
      const [k, v] = Object.entries(attrs)[0] ?? [];
      return k ? `${k}: ${v}` : "";
    }
  }
}
