# Mapa de Infra — protótipo (Application Hub / Management Plane)

Protótipo frontend **standalone** do *Mapa de Infra* de uma SA: um diagrama da
**arquitetura declarada (desired state)** derivada de IaC no repositório.

> Não é runtime, não é estado real/live. Os dados são **mockados** e imitam o
> JSON que um extrator (InfraMap / `terraform show -json`) produziria.

## Stack

- Vite + React + TypeScript
- TailwindCSS
- React Flow (`@xyflow/react`)
- Layout automático (`@dagrejs/dagre`)
- Ícones (`lucide-react`)

## Como rodar

Pré-requisitos: Node 18+ e npm.

```bash
npm install
npm run dev
```

Abra a URL que o Vite imprimir (por padrão http://localhost:5173).

Build de produção: `npm run build` · preview: `npm run preview`.

## As 3 visões

1. **Topologia por camada** — canvas React Flow com 4 faixas horizontais
   (Rede → Computação → Dados → Mensageria). Clique em um nó para abrir o painel
   lateral com todos os atributos e o arquivo IaC de origem (`sourceRef`).
   _Opcional:_ ao selecionar um nó, o grafo realça o *blast radius*
   (upstream + downstream) e atenua o resto.
2. **Toggle de ambiente (dev / prod)** — no header. Filtra nós/edges e atualiza
   os badges. Em `prod` surgem componentes que não existem em `dev`
   (ex.: réplica de RDS, worker de conciliação) e os atributos mudam
   (ex.: réplicas 1 ↔ 3, `db.t3.medium` ↔ `db.r6g.large`).
3. **Tabela** — inventário plano com as colunas Componente, Tipo, Camada,
   Ambiente(s), Atributos-chave e Origem. Tem filtro por camada e respeita o
   toggle de ambiente.

## Onde trocar o mock pela saída real do extrator

Todo o dado mockado vive em **`src/data/mock-infra.ts`**, isolado do resto da UI.

A UI consome o grafo por meio da função `getMockGraph(): Promise<InfraGraph>`
no fim desse arquivo. Para integrar a saída real do extrator, troque apenas o
corpo dela — mantendo o formato `InfraGraph` (ver `src/types.ts`):

```ts
export async function getMockGraph(): Promise<InfraGraph> {
  const res = await fetch("/api/sa/pagamentos-api/infra-map");
  return (await res.json()) as InfraGraph; // mesmo shape InfraGraph
}
```

Notas sobre o contrato:

- O shape esperado está em `src/types.ts` (`InfraGraph`, `InfraNode`, `InfraEdge`).
- As diferenças de atributos por ambiente (dev vs prod) são modeladas no mock
  via `attributeOverrides`. Se o extrator real já emitir um grafo por ambiente,
  esse mecanismo pode ser removido — basta chamar o extrator por ambiente.

## Estrutura

```
src/
  App.tsx              # estado global (ambiente, view, seleção) + orquestração
  types.ts             # o contrato de dados
  data/mock-infra.ts   # MOCK isolado — único ponto a trocar pelo dado real
  lib/
    layout.ts          # filtro por ambiente + layout em faixas por camada
    theme.ts           # cores por camada, ícones por tipo, atributos por ambiente
  components/
    Header.tsx  Legend.tsx
    Topologia.tsx  InfraNodeCard.tsx  LayerBands.tsx  DetailPanel.tsx
    Tabela.tsx  Loading.tsx  EmptyState.tsx
```

## Fora de escopo

Parsing real de IaC, drift declarado × real, custo, policy/Komply, lineage
cross-SA, backend/API e autenticação.
