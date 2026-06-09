import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Carregando mapa de infra declarado…</p>
    </div>
  );
}
