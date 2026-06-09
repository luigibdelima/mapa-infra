import { SearchX } from "lucide-react";

export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
      <SearchX className="h-10 w-10" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
