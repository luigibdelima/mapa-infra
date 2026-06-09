import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { Environment, InfraGraph } from "./types";
import { getMockGraph } from "./data/mock-infra";
import { filterGraphByEnv } from "./lib/layout";
import Header, { type ViewMode } from "./components/Header";
import Legend from "./components/Legend";
import Topologia from "./components/Topologia";
import Tabela from "./components/Tabela";
import DetailPanel from "./components/DetailPanel";
import Loading from "./components/Loading";
import EmptyState from "./components/EmptyState";

export default function App() {
  const [graph, setGraph] = useState<InfraGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [env, setEnv] = useState<Environment>("prod");
  const [view, setView] = useState<ViewMode>("topologia");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Carrega o grafo (mock com delay → exercita o loading).
  useEffect(() => {
    let active = true;
    getMockGraph().then((g) => {
      if (!active) return;
      setGraph(g);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const envGraph = useMemo(
    () => (graph ? filterGraphByEnv(graph, env) : null),
    [graph, env]
  );

  // Se o nó selecionado não existe no ambiente atual, limpa a seleção.
  useEffect(() => {
    if (selectedId && envGraph && !envGraph.nodes.some((n) => n.id === selectedId)) {
      setSelectedId(null);
    }
  }, [envGraph, selectedId]);

  const selectedNode =
    selectedId && envGraph
      ? envGraph.nodes.find((n) => n.id === selectedId) ?? null
      : null;

  return (
    <div className="flex h-full flex-col">
      <Header
        sa={graph?.sa ?? "—"}
        env={env}
        onEnvChange={setEnv}
        view={view}
        onViewChange={setView}
      />

      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          {loading || !envGraph ? (
            <Loading />
          ) : envGraph.nodes.length === 0 ? (
            <EmptyState message={`Nenhum componente declarado no ambiente "${env}".`} />
          ) : view === "topologia" ? (
            <ReactFlowProvider>
              <Topologia
                graph={envGraph}
                env={env}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </ReactFlowProvider>
          ) : (
            <Tabela graph={envGraph} env={env} />
          )}
        </main>

        {/* Painel lateral só faz sentido na topologia */}
        {view === "topologia" && selectedNode && (
          <DetailPanel node={selectedNode} env={env} onClose={() => setSelectedId(null)} />
        )}
      </div>

      {view === "topologia" && <Legend />}
    </div>
  );
}
