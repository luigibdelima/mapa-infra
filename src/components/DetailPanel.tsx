import { FileCode2, Github, X } from "lucide-react";
import type { Environment, InfraNode } from "../types";
import { LAYER_STYLES, TYPE_META, resolveAttributes } from "../lib/theme";
import { REPO_DEFAULT_BRANCH, REPO_URL } from "../data/mock-infra";

interface DetailPanelProps {
  node: InfraNode | null;
  env: Environment;
  onClose: () => void;
}

export default function DetailPanel({ node, env, onClose }: DetailPanelProps) {
  if (!node) return null;

  const layer = LAYER_STYLES[node.layer];
  const meta = TYPE_META[node.type];
  const Icon = meta.icon;
  const attrs = resolveAttributes(node, env);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`rounded-md p-1.5 ${layer.chip}`}>
            <Icon className={`h-4 w-4 ${layer.text}`} aria-hidden />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800">{node.label}</div>
            <div className="text-xs text-slate-500">
              {meta.label} · {layer.label}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {node.environments.map((e) => (
            <span
              key={e}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                e === env
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {e}
            </span>
          ))}
        </div>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Atributos ({env})
        </h3>
        <dl className="divide-y divide-slate-100 rounded-md border border-slate-200">
          {Object.entries(attrs).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3 px-3 py-2">
              <dt className="text-xs font-medium text-slate-500">{k}</dt>
              <dd className="text-right text-xs font-mono text-slate-800">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <FileCode2 className="h-3.5 w-3.5" /> Origem (IaC)
        </div>
        <a
          href={`${REPO_URL}/blob/${REPO_DEFAULT_BRANCH}/${node.sourceRef}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-2 rounded bg-white px-2 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:ring-slate-300"
          title="Abrir no GitHub"
        >
          <code className="break-all group-hover:text-indigo-700">{node.sourceRef}</code>
          <Github className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-indigo-600" />
        </a>
        <p className="mt-2 text-[11px] leading-snug text-slate-400">
          Arquitetura declarada — derivada do repositório de IaC, não do estado em
          execução.
        </p>
      </div>
    </aside>
  );
}
