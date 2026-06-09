import { LAYER_ORDER, LAYER_STYLES, TYPE_META, EDGE_STYLES } from "../lib/theme";
import type { NodeType } from "../types";

const TYPE_ORDER: NodeType[] = [
  "vpc",
  "subnet",
  "nlb",
  "pod",
  "lambda",
  "rds",
  "rds_replica",
  "s3",
  "cache",
  "queue",
  "topic",
];

// Legenda: camadas (cor), tipos de nó (ícone) e kinds de edge.
export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 bg-white px-5 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-400">Camadas</span>
        {LAYER_ORDER.map((layer) => {
          const s = LAYER_STYLES[layer];
          return (
            <span key={layer} className="inline-flex items-center gap-1.5 text-slate-600">
              <span className={`h-3 w-3 rounded-sm border ${s.chip} ${s.border}`} />
              {s.label}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-slate-400">Tipos</span>
        {TYPE_ORDER.map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          return (
            <span key={t} className="inline-flex items-center gap-1 text-slate-600">
              <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              {meta.label}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-400">Conexões</span>
        {(Object.keys(EDGE_STYLES) as Array<keyof typeof EDGE_STYLES>).map((k) => {
          const s = EDGE_STYLES[k];
          return (
            <span key={k} className="inline-flex items-center gap-1.5 text-slate-600">
              <svg width="22" height="8" aria-hidden>
                <line
                  x1="0"
                  y1="4"
                  x2="22"
                  y2="4"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeDasharray={s.dashed ? "5 3" : undefined}
                />
              </svg>
              {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
