import { FileLock2, Network, Table2 } from "lucide-react";
import type { Environment } from "../types";

export type ViewMode = "topologia" | "tabela";

interface HeaderProps {
  sa: string;
  env: Environment;
  onEnvChange: (env: Environment) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Header({
  sa,
  env,
  onEnvChange,
  view,
  onViewChange,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200 bg-white px-5 py-3">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-800">Mapa de Infra</h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {sa}
            </span>
          </div>
          <p className="text-xs text-slate-400">Application Hub · Management Plane</p>
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
        <FileLock2 className="h-3.5 w-3.5" />
        Arquitetura declarada (desired state)
      </span>

      <div className="ml-auto flex items-center gap-4">
        {/* Toggle de ambiente */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Ambiente</span>
          <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
            {(["dev", "prod"] as Environment[]).map((e) => (
              <button
                key={e}
                onClick={() => onEnvChange(e)}
                className={`rounded px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                  env === e
                    ? e === "prod"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-700 text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Switcher de view */}
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
          <ViewButton
            active={view === "topologia"}
            onClick={() => onViewChange("topologia")}
            icon={<Network className="h-3.5 w-3.5" />}
            label="Topologia"
          />
          <ViewButton
            active={view === "tabela"}
            onClick={() => onViewChange("tabela")}
            icon={<Table2 className="h-3.5 w-3.5" />}
            label="Tabela"
          />
        </div>
      </div>
    </header>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition-colors ${
        active ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
