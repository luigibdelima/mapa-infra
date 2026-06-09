import { useMemo, useState } from "react";
import type { Environment, InfraGraph, Layer } from "../types";
import {
  LAYER_ORDER,
  LAYER_STYLES,
  TYPE_META,
  keyAttributesSummary,
} from "../lib/theme";
import EmptyState from "./EmptyState";

interface TabelaProps {
  graph: InfraGraph; // já filtrado por ambiente
  env: Environment;
}

type LayerFilter = Layer | "todas";

// Inventário plano. Respeita o ambiente (recebe grafo já filtrado) e
// adiciona filtro por camada local.
export default function Tabela({ graph, env }: TabelaProps) {
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("todas");

  const rows = useMemo(() => {
    const filtered =
      layerFilter === "todas"
        ? graph.nodes
        : graph.nodes.filter((n) => n.layer === layerFilter);
    // ordena por ordem de camada, depois label
    return [...filtered].sort((a, b) => {
      const la = LAYER_ORDER.indexOf(a.layer);
      const lb = LAYER_ORDER.indexOf(b.layer);
      return la - lb || a.label.localeCompare(b.label);
    });
  }, [graph.nodes, layerFilter]);

  return (
    <div className="flex h-full flex-col">
      {/* Filtro por camada */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-2.5">
        <span className="text-xs font-medium text-slate-400">Camada</span>
        <div className="flex flex-wrap gap-1">
          <FilterChip
            active={layerFilter === "todas"}
            onClick={() => setLayerFilter("todas")}
            label="Todas"
          />
          {LAYER_ORDER.map((l) => (
            <FilterChip
              key={l}
              active={layerFilter === l}
              onClick={() => setLayerFilter(l)}
              label={LAYER_STYLES[l].label}
            />
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {rows.length} componente(s) · ambiente <strong>{env}</strong>
        </span>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4">
        {rows.length === 0 ? (
          <EmptyState message="Nenhum componente para este filtro." />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-semibold">Componente</th>
                <th className="px-3 py-2 font-semibold">Tipo</th>
                <th className="px-3 py-2 font-semibold">Camada</th>
                <th className="px-3 py-2 font-semibold">Ambiente(s)</th>
                <th className="px-3 py-2 font-semibold">Atributos-chave</th>
                <th className="px-3 py-2 font-semibold">Origem (IaC)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta.icon;
                const layer = LAYER_STYLES[n.layer];
                return (
                  <tr
                    key={n.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-medium text-slate-800">{n.label}</td>
                    <td className="px-3 py-2 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${layer.chip} ${layer.text}`}
                      >
                        {layer.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex gap-1">
                        {n.environments.map((e) => (
                          <span
                            key={e}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium uppercase text-slate-500"
                          >
                            {e}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">
                      {keyAttributesSummary(n, env)}
                    </td>
                    <td className="px-3 py-2">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                        {n.sourceRef}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        active
          ? "bg-slate-800 text-white"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
