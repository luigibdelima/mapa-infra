import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Environment, InfraNode } from "../types";
import { LAYER_STYLES, TYPE_META, environmentBadge } from "../lib/theme";
import { NODE_HEIGHT, NODE_WIDTH } from "../lib/layout";

// `data` injetado pelo Topologia para cada nó do React Flow.
export interface InfraNodeData {
  node: InfraNode;
  env: Environment;
  highlighted: boolean; // realce de blast radius (OPCIONAL)
  dimmed: boolean; // atenuado por blast radius (OPCIONAL)
  [key: string]: unknown;
}

export default function InfraNodeCard({ data, selected }: NodeProps) {
  const { node, env, highlighted, dimmed } = data as InfraNodeData;
  // Mapa estático de classes (nada interpolado tipo bg-${x}); cor = camada.
  const layer = LAYER_STYLES[node.layer];
  const meta = TYPE_META[node.type];
  const Icon = meta.icon;
  const badge = environmentBadge(node, env);

  return (
    <div
      // tamanho fixo IGUAL ao usado no dagre (NODE_WIDTH x NODE_HEIGHT)
      style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
      className={[
        "flex flex-col rounded-lg border-2 shadow-sm transition-all",
        layer.border,
        layer.cardBg,
        selected ? "ring-2 ring-offset-1 ring-slate-500" : "",
        highlighted ? "ring-2 ring-offset-1 ring-blue-500 shadow-md" : "",
        dimmed ? "opacity-30" : "opacity-100",
      ].join(" ")}
    >
      {/* fluxo top-down: entrada no topo, saída embaixo */}
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />

      <div className={`flex items-center gap-2 rounded-t-md px-3 py-1.5 ${layer.chip}`}>
        <Icon className={`h-4 w-4 shrink-0 ${layer.text}`} aria-hidden />
        <span className={`text-[11px] font-medium uppercase tracking-wide ${layer.text}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-3 py-2">
        <div className="truncate text-sm font-semibold text-slate-800" title={node.label}>
          {node.label}
        </div>
        {badge && (
          <div className="mt-1.5 inline-flex w-fit items-center rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            {badge}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}
