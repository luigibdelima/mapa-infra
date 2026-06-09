import dagre from "@dagrejs/dagre";
import type { Environment, InfraEdge, InfraGraph, InfraNode } from "../types";

// ----------------------------------------------------------------- DIMENSÕES
// W/H devem ser IGUAIS ao tamanho real do nó renderizado (InfraNodeCard),
// senão o dagre estratifica com espaçamento errado.
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 96;

// -----------------------------------------------------------------
// Filtra o grafo mantendo apenas nós/edges que existem no ambiente dado.
export function filterGraphByEnv(graph: InfraGraph, env: Environment): InfraGraph {
  const nodes = graph.nodes.filter((n) => n.environments.includes(env));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter(
    (e) => e.environments.includes(env) && ids.has(e.source) && ids.has(e.target)
  );
  return { sa: graph.sa, nodes, edges };
}

export interface PositionedNode extends InfraNode {
  x: number;
  y: number;
}

// -----------------------------------------------------------------
// Layout de grafo dirigido com dagre (top-down). Como as edges são dirigidas,
// o dagre estratifica os nós naturalmente em ranks — sem faixas, sem Y manual.
export function layoutGraph(
  nodes: InfraNode[],
  edges: InfraEdge[]
): PositionedNode[] {
  if (nodes.length === 0) return [];

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) =>
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  );
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  // ATENÇÃO: o dagre devolve o CENTRO do nó; o React Flow quer o canto superior
  // esquerdo. Sem este offset os nós saem deslocados (bug clássico).
  return nodes.map((n) => {
    const p = g.node(n.id);
    return {
      ...n,
      x: p.x - NODE_WIDTH / 2,
      y: p.y - NODE_HEIGHT / 2,
    };
  });
}
