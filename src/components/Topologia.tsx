import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Edge,
  type Node,
} from "@xyflow/react";
import type { Environment, InfraGraph } from "../types";
import { EDGE_STYLES } from "../lib/theme";
import { layoutGraph } from "../lib/layout";
import InfraNodeCard, { type InfraNodeData } from "./InfraNodeCard";

// Definidos FORA do componente — evita recriar a cada render (causa de nós
// "sumindo" / warning do React Flow).
const nodeTypes = { infra: InfraNodeCard };

interface TopologiaProps {
  graph: InfraGraph; // já filtrado por ambiente
  env: Environment;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

// OPCIONAL — blast radius: conjunto alcançável a partir do nó (upstream + downstream).
function reachableFrom(id: string, edges: InfraGraph["edges"]): Set<string> {
  const set = new Set<string>([id]);
  const down = new Map<string, string[]>();
  const up = new Map<string, string[]>();
  for (const e of edges) {
    (down.get(e.source) ?? down.set(e.source, []).get(e.source)!).push(e.target);
    (up.get(e.target) ?? up.set(e.target, []).get(e.target)!).push(e.source);
  }
  const walk = (start: string, adj: Map<string, string[]>) => {
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const next of adj.get(cur) ?? []) {
        if (!set.has(next)) {
          set.add(next);
          stack.push(next);
        }
      }
    }
  };
  walk(id, down);
  walk(id, up);
  return set;
}

export default function Topologia({ graph, env, selectedId, onSelect }: TopologiaProps) {
  const positioned = useMemo(
    () => layoutGraph(graph.nodes, graph.edges),
    [graph.nodes, graph.edges]
  );

  // OPCIONAL — blast radius ativo quando há nó selecionado.
  const highlightSet = useMemo(
    () => (selectedId ? reachableFrom(selectedId, graph.edges) : null),
    [selectedId, graph.edges]
  );

  const nodes: Node[] = useMemo(
    () =>
      positioned.map((n) => {
        const data: InfraNodeData = {
          node: n,
          env,
          highlighted: highlightSet ? highlightSet.has(n.id) : false,
          dimmed: highlightSet ? !highlightSet.has(n.id) : false,
        };
        return {
          id: n.id,
          type: "infra",
          position: { x: n.x, y: n.y },
          data,
        };
      }),
    [positioned, env, highlightSet]
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => {
        const style = EDGE_STYLES[e.kind];
        const active = highlightSet
          ? highlightSet.has(e.source) && highlightSet.has(e.target)
          : true;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: e.kind === "dados",
          style: {
            stroke: style.color,
            strokeWidth: 2,
            strokeDasharray: style.dashed ? "6 4" : undefined,
            opacity: active ? 1 : 0.15,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: style.color },
        };
      }),
    [graph.edges, highlightSet]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.2}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_, node) => onSelect(node.id)}
      onPaneClick={() => onSelect(null)}
      nodesDraggable={false}
      nodesConnectable={false}
    >
      <Background color="#e2e8f0" gap={20} />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => {
          const data = n.data as unknown as InfraNodeData;
          const layer = data?.node?.layer;
          return layer ? MINIMAP_COLORS[layer] : "#cbd5e1";
        }}
      />
    </ReactFlow>
  );
}

const MINIMAP_COLORS: Record<string, string> = {
  rede: "#7dd3fc",
  computacao: "#c4b5fd",
  dados: "#6ee7b7",
  mensageria: "#fcd34d",
};
