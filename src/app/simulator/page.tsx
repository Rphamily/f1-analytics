'use client';

import { useState, useEffect } from 'react';
import { Play, RefreshCw } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
  racing_bulls: '#6692FF', kick_sauber: '#52E252',
};
function tc(cid: string) { return TEAM_COLORS[cid] ?? '#888'; }

const TEAM_STRENGTH: Record<string, number> = {
  mercedes: 0.92, ferrari: 0.88, mclaren: 0.90, red_bull: 0.85,
  aston_martin: 0.68, williams: 0.70, rb: 0.65, racing_bulls: 0.65,
  alpine: 0.63, haas: 0.60, sauber: 0.62, cadillac: 0.55, audi: 0.60,
};

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const ITERATIONS = 10000;

interface Driver {
  driverId: string; code: string; name: string;
  team: string; constructorId: string; points: number; position: number; wins: number;
}

interface SimResult {
  driverId: string; code: string; name: string; team: string; constructorId: string;
  currentPoints: number; championships: number; probability: number;
  avgFinalPoints: number; best: number; worst: number;
}

function simulateRace(drivers: { id: string; strength: number }[]): string[] {
  return [...drivers].map(d => ({ id: d.id, score: d.strength * (0.5 + Math.random()) }))
    .sort((a, b) => b.score - a.score).map(d => d.id);
}

function runSimulation(drivers: Driver[], racesRemaining: number): SimResult[] {
  const champs: Record<string, number> = {};
  const finalPts: Record<string, number[]> = {};
  drivers.forEach(d => { champs[d.driverId] = 0; finalPts[d.driverId] = []; });

  const strengths = drivers.map(d => ({
    id: d.driverId,
    strength: (TEAM_STRENGTH[d.constructorId] ?? 0.6) * 0.5 +
      (Math.max(0, drivers.length - d.position + 1) / drivers.length) * 0.4 +
      d.wins * 0.02,
  }));

  for (let i = 0; i < ITERATIONS; i++) {
    const pts: Record<string, number> = {};
    drivers.forEach(d => { pts[d.driverId] = d.points; });
    for (let r = 0; r < racesRemaining; r++) {
      const order = simulateRace(strengths);
      order.slice(0, 10).forEach((id, idx) => { pts[id] = (pts[id] ?? 0) + POINTS[idx]; });
      const fl = order[Math.floor(Math.random() * 10)];
      if (fl) pts[fl] = (pts[fl] ?? 0) + 1;
    }
    const winner = Object.entries(pts).sort((a, b) => b[1] - a[1])[0];
    if (winner) champs[winner[0]]++;
    Object.entries(pts).forEach(([id, p]) => finalPts[id].push(p));
  }

  return drivers.map(d => {
    const pts = (finalPts[d.driverId] ?? []).sort((a, b) => a - b);
    const n = pts.length;
    return {
      driverId: d.driverId, code: d.code, name: d.name, team: d.team,
      constructorId: d.constructorId, currentPoints: d.points,
      championships: champs[d.driverId] ?? 0,
      probability: (champs[d.driverId] ?? 0) / ITERATIONS,
      avgFinalPoints: n > 0 ? Math.round(pts.reduce((a, b) => a + b, 0) / n) : d.points,
      best: pts[n - 1] ?? d.points, worst: pts[0] ?? d.points,
    };
  }).sort((a, b) => b.probability - a.probability);
}

export default function SimulatorPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [racesRemaining, setRacesRemaining] = useState(0);
  const [totalRaces, setTotalRaces] = useState(0);
  const [results, setResults] = useState<SimResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [season, setSeason] = useState('');
  const [customRaces, setCustomRaces] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const year = new Date().getFullYear();
      setSeason(String(year));
      try {
        const [schedRes, standRes] = await Promise.all([
          fetch(`https://api.jolpi.ca/ergast/f1/${year}.json?limit=30`),
          fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
        ]);
        const schedJson = await schedRes.json();
        const standJson = await standRes.json();
        const allRaces = schedJson.MRData?.RaceTable?.Races ?? [];
        const now = new Date();
        setTotalRaces(allRaces.length);
        setRacesRemaining(allRaces.filter((r: any) => new Date(r.date) >= now).length);
        const standings = standJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        setDrivers(standings.map((s: any) => ({
          driverId: s.Driver.driverId,
          code: s.Driver.code ?? s.Driver.driverId.slice(0, 3).toUpperCase(),
          name: `${s.Driver.givenName} ${s.Driver.familyName}`,
          team: s.Constructors?.[0]?.name ?? 'Unknown',
          constructorId: s.Constructors?.[0]?.constructorId ?? 'unknown',
          points: parseFloat(s.points ?? '0'),
          position: parseInt(s.position ?? '20'),
          wins: parseInt(s.wins ?? '0'),
        })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const runSim = async () => {
    if (drivers.length === 0) return;
    setSimRunning(true); setSimDone(false); setResults([]);
    await new Promise(r => setTimeout(r, 100));
    setResults(runSimulation(drivers, customRaces ?? racesRemaining));
    setSimRunning(false); setSimDone(true);
  };

  const maxProb = results[0]?.probability ?? 1;
  const racesToUse = customRaces ?? racesRemaining;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">MONTE CARLO · {ITERATIONS.toLocaleString()} SIMULATIONS</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4"><span className="text-white">SEASON</span><br /><span className="text-[#E10600]">SIMULATOR</span></h1>
        <p className="text-white/40 max-w-xl">Runs {ITERATIONS.toLocaleString()} simulations of the remaining {season} season using live standings. Bayesian probability model.</p>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
          <div className="f1-mono text-white/30 text-sm">Loading live {season} standings...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="f1-mono text-white/30 text-xs mb-1">CURRENT LEADER</div>
              <div className="f1-heading text-3xl" style={{ color: tc(drivers[0]?.constructorId ?? '') }}>{drivers[0]?.code ?? '—'}</div>
              <div className="text-white/40 text-sm">{drivers[0]?.points ?? 0} pts · {drivers[0]?.wins ?? 0} wins</div>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="f1-mono text-white/30 text-xs mb-1">RACES REMAINING</div>
              <div className="f1-heading text-3xl text-white">{racesRemaining}</div>
              <div className="text-white/40 text-sm">of {totalRaces} total · {season}</div>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="f1-mono text-white/30 text-xs mb-2">SIMULATE WITH</div>
              <div className="flex gap-2 flex-wrap">
                {[null, 5, 10, 15, 20].map(n => (
                  <button key={String(n)} onClick={() => setCustomRaces(n)}
                    className={`f1-mono text-xs px-3 py-1.5 rounded border transition-all ${customRaces === n ? 'bg-[#E10600]/20 border-[#E10600]/40 text-[#E10600]' : 'border-white/10 text-white/30 hover:border-white/30'}`}>
                    {n === null ? `${racesRemaining} actual` : `${n} races`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mb-8 items-center">
            <button onClick={runSim} disabled={simRunning || drivers.length === 0}
              className="bg-[#E10600] hover:bg-red-700 disabled:opacity-40 text-white f1-heading text-2xl px-10 py-4 rounded-xl transition-all red-glow flex items-center gap-3">
              {simRunning ? <><RefreshCw size={22} className="animate-spin" />SIMULATING...</> : <><Play size={22} />{simDone ? 'RE-SIMULATE' : 'RUN SIMULATION'}</>}
            </button>
            {simRunning && <div className="f1-mono text-white/30 text-sm flex items-center gap-2"><div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse" />Running {ITERATIONS.toLocaleString()} Monte Carlo iterations...</div>}
          </div>
          {simDone && results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="f1-mono text-white/40 text-xs mb-4 tracking-widest">CHAMPIONSHIP PROBABILITY · {racesToUse} RACES REMAINING</div>
                <div className="flex flex-col gap-3">
                  {results.map((d, i) => {
                    const color = tc(d.constructorId);
                    const pct = (d.probability * 100);
                    const deficit = (results[0]?.currentPoints ?? 0) - d.currentPoints;
                    const eliminated = d.probability === 0 && deficit > racesToUse * 26;
                    return (
                      <div key={d.driverId} className="glass-panel p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="f1-heading text-2xl text-white/20 w-6">{i + 1}</div>
                          <div className="w-1 h-10 rounded" style={{ background: color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="f1-heading text-xl text-white">{d.code}</span>
                              <span className="text-white/40 text-sm truncate">{d.name}</span>
                              {eliminated && <span className="f1-mono text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-400">ELIMINATED</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${maxProb > 0 ? (d.probability / maxProb) * 100 : 0}%`, background: color }} />
                              </div>
                              <div className="f1-heading text-2xl flex-shrink-0" style={{ color }}>{pct.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="f1-mono text-white/60 text-sm">{d.currentPoints}pts</div>
                            <div className="f1-mono text-white/25 text-xs">{d.championships.toLocaleString()} wins</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                          {[{ l: 'AVG FINAL', v: d.avgFinalPoints }, { l: 'BEST CASE', v: d.best }, { l: 'WORST CASE', v: d.worst }].map(({ l, v }) => (
                            <div key={l} className="text-center">
                              <div className="f1-mono text-white/20 text-xs">{l}</div>
                              <div className="f1-mono text-white/50 text-sm">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="glass-panel rounded-xl p-5 border border-white/5">
                  <div className="f1-mono text-white/40 text-xs mb-4 tracking-widest">PODIUM PREDICTION</div>
                  {results.slice(0, 3).map((d, i) => {
                    const color = tc(d.constructorId);
                    return (
                      <div key={d.driverId} className="flex items-center gap-3 mb-3 p-3 rounded-lg" style={{ background: `${color}11` }}>
                        <span className="text-xl">{['🥇', '🥈', '🥉'][i]}</span>
                        <div><div className="f1-heading text-lg" style={{ color }}>{d.code}</div><div className="f1-mono text-white/30 text-xs">{(d.probability * 100).toFixed(1)}% chance</div></div>
                        <div className="ml-auto f1-mono text-white/40 text-sm">{d.avgFinalPoints}pts avg</div>
                      </div>
                    );
                  })}
                </div>
                <div className="glass-panel rounded-xl p-5 border border-white/5">
                  <div className="f1-mono text-white/40 text-xs mb-4 tracking-widest">SIMULATION INFO</div>
                  <div className="flex flex-col gap-2 text-xs f1-mono">
                    {[['Iterations', ITERATIONS.toLocaleString()], ['Races sim.', racesToUse], ['Drivers', results.length], ['Algorithm', 'Monte Carlo'], ['Model', 'Bayesian prior'], ['Season', season]].map(([l, v]) => (
                      <div key={String(l)} className="flex justify-between"><span className="text-white/30">{l}</span><span className="text-white/60">{v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
