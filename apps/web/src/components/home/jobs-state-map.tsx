import {
  brazilStateLabels,
  brazilStateShapes,
  brazilViewBox,
} from "@/components/home/brazil-map-data";

type StateCount = Record<string, number>;

export function countJobsByState(jobs: Array<{ state: string }>): StateCount {
  return jobs.reduce<StateCount>((counts, job) => {
    const uf = job.state.toUpperCase();
    counts[uf] = (counts[uf] ?? 0) + 1;
    return counts;
  }, {});
}

function stateStyle(count: number, max: number) {
  if (count === 0 || max === 0) {
    return { fill: "#dce8ee", labelClass: "fill-slate-600", stroke: "#ffffff" };
  }

  const ratio = count / max;

  if (ratio > 0.66) return { fill: "#0e7490", labelClass: "fill-white", stroke: "#ffffff" };
  if (ratio > 0.33) return { fill: "#22d3ee", labelClass: "fill-slate-950", stroke: "#ffffff" };
  return { fill: "#a5f3fc", labelClass: "fill-cyan-950", stroke: "#ffffff" };
}

export function JobsStateMap({ counts }: { counts: StateCount }) {
  const max = Math.max(0, ...Object.values(counts));
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const statesWithJobs = Object.keys(counts).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
      <div className="mx-auto w-full max-w-xl">
        <svg
          aria-label="Mapa do Brasil com o número de vagas publicadas por estado"
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${brazilViewBox.width} ${brazilViewBox.height}`}
        >
          {Object.entries(brazilStateShapes).map(([uf, path]) => {
            const count = counts[uf] ?? 0;
            const style = stateStyle(count, max);
            const [x, y] = brazilStateLabels[uf] ?? [0, 0];

            return (
              <g key={uf}>
                <title>{`${uf}: ${count} ${count === 1 ? "vaga" : "vagas"}`}</title>
                <path d={path} fill={style.fill} stroke={style.stroke} strokeLinejoin="round" strokeWidth={1} />
                <text
                  className={`pointer-events-none text-[9px] font-semibold ${style.labelClass}`}
                  textAnchor="middle"
                  x={x}
                  y={count > 0 ? y - 2 : y + 3}
                >
                  {uf}
                </text>
                {count > 0 ? (
                  <text
                    className={`pointer-events-none text-[9px] font-bold ${style.labelClass}`}
                    textAnchor="middle"
                    x={x}
                    y={y + 9}
                  >
                    {count}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Onde estão as vagas
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          {total > 0
            ? `${total} ${total === 1 ? "vaga publicada" : "vagas publicadas"} em ${statesWithJobs} ${statesWithJobs === 1 ? "estado" : "estados"}.`
            : "Vagas por estado aparecem aqui."}
        </h2>
        <p className="mt-4 text-slate-600">
          Cada estado é colorido pelo número de vagas abertas. Use a busca para ver só as
          oportunidades da sua região.
        </p>
        <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#a5f3fc]" /> Poucas
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#22d3ee]" /> Algumas
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#0e7490]" /> Muitas
          </span>
        </div>
      </div>
    </div>
  );
}
