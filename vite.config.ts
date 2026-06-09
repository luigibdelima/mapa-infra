import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// No build pro GitHub Pages o site fica em usuario.github.io/mapa-infra/,
// então os assets precisam do prefixo "/mapa-infra/". No dev (npm run dev)
// segue na raiz "/". Se trocar o nome do repo, ajuste o base aqui.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/mapa-infra/" : "/",
}));
