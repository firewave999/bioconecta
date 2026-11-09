// Mapa em blocos do Brasil: cada UF é um quadrado na posição aproximada da
// geografia. A cor fica mais intensa conforme o número de vagas publicadas.
const stateTiles: Array<{ col: number; row: number; uf: string }> = [
  { col: 3, row: 0, uf: "RR" },
  { col: 5, row: 0, uf: "AP" },
  { col: 2, row: 1, uf: "AM" },
  { col: 4, row: 1, uf: "PA" },
  { col: 5, row: 1, uf: "MA" },
  { col: 1, row: 2, uf: "AC" },
  { col: 2, row: 2, uf: "RO" },
  { col: 4, row: 2, uf: "TO" },
  { col: 5, row: 2, uf: "PI" },
  { col: 6, row: 2, uf: "CE" },
  { col: 7, row: 2, uf: "RN" },
  { col: 3, row: 3, uf: "MT" },
  { col: 4, row: 3, uf: "GO" },
  { col: 5, row: 3, uf: "BA" },
  { col: 6, row: 3, uf: "PE" },
  { col: 7, row: 3, uf: "PB" },
  { col: 3, row: 4, uf: "MS" },
  { col: 4, row: 4, uf: "DF" },
  { col: 5, row: 4, uf: "MG" },
  { col: 6, row: 4, uf: "ES" },
  { col: 7, row: 4, uf: "AL" },
  { col: 5, row: 5, uf: "SP" },
  { col: 6, row: 5, uf: "RJ" },
  { col: 7, row: 5, uf: "SE" },
  { col: 4, row: 6, uf: "PR" },
  { col: 5, row: 6, uf: "SC" },
  { col: 5, row: 7, uf: "RS" },
];

type StateCount = Record<string, number>;

export function countJobsByState(jobs: Array<{ state: string }>): StateCount {
  return jobs.reduce<StateCount>((counts, job) => {
    const uf = job.state.toUpperCase();
    counts[uf] = (counts[uf] ?? 0) + 1;
    return counts;
  }, {});
}

function tileClass(count: number, max: number) {
  if (count === 0 || max === 0) {
    return "bg-slate-100 text-slate-400";
  }

  const ratio = count / max;

  if (ratio > 0.66) return "bg-cyan-700 text-white";
  if (ratio > 0.33) return "bg-cyan-400 text-slate-950";
  return "bg-cyan-100 text-cyan-900";
}

export function JobsStateMap({ counts }: { counts: StateCount }) {
  const max = Math.max(0, ...Object.values(counts));
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
      <div
        aria-label="Mapa do Brasil com o número de vagas publicadas por estado"
        className="mx-auto grid w-full max-w-xl grid-cols-8 gap-1.5"
        role="img"
      >
        {stateTiles.map(({ col, row, uf }) => {
          const count = counts[uf] ?? 0;

          return (
            <div
              key={uf}
              className={`flex aspect-square flex-col items-center justify-center rounded-[6px] text-xs font-semibold ${tileClass(count, max)}`}
              style={{ gridColumn: col + 1, gridRow: row + 1 }}
              title={`${uf}: ${count} ${count === 1 ? "vaga" : "vagas"}`}
            >
              <span>{uf}</span>
              {count > 0 ? <span className="text-[10px] font-normal opacity-90">{count}</span> : null}
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Onde estão as vagas
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          {total > 0
            ? `${total} ${total === 1 ? "vaga publicada" : "vagas publicadas"} em ${Object.keys(counts).length} ${Object.keys(counts).length === 1 ? "estado" : "estados"}.`
            : "Vagas por estado aparecem aqui."}
        </h2>
        <p className="mt-4 text-slate-600">
          Cada quadrado é um estado. Quanto mais escuro, mais vagas abertas. Use a busca para ver só
          as oportunidades da sua região.
        </p>
        <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-3 w-3 rounded-sm bg-cyan-100" /> Poucas
          <span className="h-3 w-3 rounded-sm bg-cyan-400" /> Algumas
          <span className="h-3 w-3 rounded-sm bg-cyan-700" /> Muitas
        </div>
      </div>
    </div>
  );
}
