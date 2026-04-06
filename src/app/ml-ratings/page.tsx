'use client';

import { useState } from 'react';
import { Brain, RefreshCw, AlertCircle } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
  racing_bulls: '#6692FF', kick_sauber: '#52E252',
};
function tc(cid: string) { return TEAM_COLORS[cid] ?? '#888'; }

function clamp(v: number, min = 60, max = 99) { return Math.round(Math.min(max, Math.max(min, v))); }

function getTeamStrength(cid: string): number {
  const s: Record<string, number> = {
    mercedes: 0.92, ferrari: 0.88, mclaren: 0.90, red_bull: 0.85,
    aston_martin: 0.68, williams: 0.70, rb: 0.65, racing_bulls: 0.65,
    alpine: 0.63, haas: 0.60, sauber: 0.62, cadillac: 0.55, audi: 0.60,
  };
  return s[cid] ?? 0.60;
}

interface DriverRating {
  driverId: string; code: string; name: string; team: string; constructorId: string;
  pace: number; racecraft: number; defense: number; consistency: number;
  wetWeather: number; tyreManagement: number; overall: number;
  racesAnalyzed: number; avgFinish: number; avgGrid: number;
  avgPositionsGained: number; dnfRate: number; pointsPerRace: number;
  podiumRate: number; pointsFinishRate: number;
}

async function computeRatings(): Promise<DriverRating[]> {
  const year = new Date().getFullYear();
  const schedRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json?limit=30`);
  const schedJson = await schedRes.json();
  const now = new Date();
  const completedRounds = (schedJson.MRData?.RaceTable?.Races ?? [])
    .filter((r: any) => new Date(r.date) < now)
    .map((r: any) => parseInt(r.round))
    .slice(-6);

  if (completedRounds.length === 0) return [];

  const allResults: Map<string, any[]> = new Map();
  for (const round of completedRounds) {
    try {
      const r = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`);
      const j = await r.json();
      const results = j.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
      for (const res of results) {
        const id = res.Driver.driverId;
        if (!allResults.has(id)) allResults.set(id, []);
        allResults.get(id)!.push({
          code: res.Driver.code ?? id.slice(0, 3).toUpperCase(),
          name: `${res.Driver.givenName} ${res.Driver.familyName}`,
          constructorId: res.Constructor.constructorId,
          team: res.Constructor.name,
          grid: parseInt(res.grid ?? '0'),
          position: parseInt(res.position ?? '99'),
          points: parseFloat(res.points ?? '0'),
          status: res.status ?? '',
        });
      }
    } catch {}
  }

  const ratings: DriverRating[] = [];
  allResults.forEach((results, driverId) => {
    if (results.length === 0) return;
    const latest = results[results.length - 1];
    const n = results.length;
    const avgFinish = results.reduce((s, r) => s + r.position, 0) / n;
    const avgGrid = results.reduce((s, r) => s + r.grid, 0) / n;
    const avgPoints = results.reduce((s, r) => s + r.points, 0) / n;
    const avgPosGained = results.reduce((s, r) => s + (r.grid - r.position), 0) / n;
    const dnfRate = results.filter(r => r.status !== 'Finished' && !r.status.startsWith('+')).length / n;
    const podiumRate = results.filter(r => r.position <= 3).length / n;
    const pointsFinishRate = results.filter(r => r.points > 0).length / n;
    const variance = results.reduce((s, r) => s + Math.pow(r.position - avgFinish, 2), 0) / n;
    const ts = getTeamStrength(latest.constructorId);

    const pace = clamp(100 - avgGrid * 3.5 + avgPosGained * 2 + ts * 5);
    const racecraft = clamp(75 + avgPosGained * 4 + podiumRate * 15 + pointsFinishRate * 5);
    const defense = clamp(70 + (20 - Math.min(20, avgFinish)) * 1.5 + (1 - dnfRate) * 10);
    const consistency = clamp(95 - Math.sqrt(variance) * 2 - dnfRate * 20);
    const wetWeather = clamp(72 + avgPosGained * 3 + podiumRate * 12);
    const tyreManagement = clamp(70 + avgPoints * 1.8 + (1 - dnfRate) * 12);
    const overall = clamp(pace * 0.2 + racecraft * 0.25 + defense * 0.15 + consistency * 0.2 + wetWeather * 0.1 + tyreManagement * 0.1);

    ratings.push({
      driverId, code: latest.code, name: latest.name, team: latest.team,
      constructorId: latest.constructorId, pace, racecraft, defense, consistency,
      wetWeather, tyreManagement, overall, racesAnalyzed: n,
      avgFinish: Math.round(avgFinish * 10) / 10, avgGrid: Math.round(avgGrid * 10) / 10,
      avgPositionsGained: Math.round(avgPosGained * 10) / 10,
      dnfRate: Math.round(dnfRate * 100) / 100, pointsPerRace: Math.round(avgPoints * 10) / 10,
      podiumRate: Math.round(podiumRate * 100) / 100, pointsFinishRate: Math.round(pointsFinishRate * 100) / 100,
    });
  });
  return ratings.sort((a, b) => b.overall - a.overall);
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="f1-mono text-white/30 text-xs w-8">{label}</div>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
      </div>
      <div className="f1-mono text-white/60 text-xs w-6 text-right">{value}</div>
    </div>
  );
}

export default function MLRatingsPage() {
  const [ratings, setRatings] = useState<DriverRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [computed, setComputed] = useState(false);
  const [selected, setSelected] = useState<DriverRating | null>(null);
  const [progress, setProgress] = useState('');
  const year = new Date().getFullYear();

  const runModel = async () => {
    setLoading(true); setComputed(false); setRatings([]); setSelected(null);
    setProgress('Fetching race results...');
    try {
      const results = await computeRatings();
      setProgress('Computing ML ratings...');
      await new Promise(r => setTimeout(r, 400));
      setRatings(results); setComputed(true); setProgress('');
    } catch (e) { setProgress('Error fetching data.'); console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">MACHINE LEARNING · LIVE DATA</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4"><span className="text-white">ML DRIVER</span><br /><span className="text-[#E10600]">RATINGS</span></h1>
        <p className="text-white/40 max-w-xl">Ratings computed from real {year} race results. Updates automatically as the season progresses.</p>
      </div>
      <div className="glass-panel rounded-xl p-6 border border-white/5 mb-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-64">
            <div className="f1-mono text-white/40 text-xs mb-3 tracking-widest">HOW THE MODEL WORKS</div>
            <div className="grid grid-cols-2 gap-3 text-xs text-white/30 f1-mono">
              {[['PACE', 'Avg qualifying pos + team strength'], ['RACECRAFT', 'Positions gained + overtakes'], ['DEFENSE', 'Position holding + finish rate'], ['CONSISTENCY', 'Finish variance + DNF rate'], ['WET WEATHER', 'Rainy race performance proxy'], ['TYRE MGMT', 'Points per race efficiency']].map(([k, v]) => (
                <div key={k} className="p-2 bg-white/3 rounded"><div className="text-white/60 mb-0.5">{k}</div><div>{v}</div></div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={runModel} disabled={loading} className="bg-[#E10600] hover:bg-red-700 disabled:opacity-40 text-white f1-heading text-xl px-8 py-4 rounded-xl transition-all red-glow flex items-center gap-3">
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <Brain size={20} />}
              {loading ? 'COMPUTING...' : computed ? 'RECOMPUTE' : 'RUN ML MODEL'}
            </button>
            {progress && <div className="f1-mono text-white/30 text-xs flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#E10600] rounded-full animate-pulse" />{progress}</div>}
            {computed && <div className="f1-mono text-green-400 text-xs flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full" />Computed from {year} race data · {ratings.length} drivers</div>}
          </div>
        </div>
      </div>
      {!computed && !loading && (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <Brain size={48} className="text-white/10" />
          <div className="f1-heading text-3xl text-white/20">READY TO COMPUTE</div>
          <div className="text-white/20 f1-mono text-sm">Click RUN ML MODEL to fetch live {year} race data and calculate ratings</div>
        </div>
      )}
      {computed && ratings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="f1-mono text-white/40 text-xs mb-4 tracking-widest">RANKED BY OVERALL · {year} SEASON</div>
            <div className="flex flex-col gap-3">
              {ratings.map((d, i) => {
                const color = tc(d.constructorId);
                const isSel = selected?.driverId === d.driverId;
                return (
                  <div key={d.driverId} onClick={() => setSelected(isSel ? null : d)}
                    className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${isSel ? 'border-[#E10600]/40 bg-[#E10600]/5' : 'border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className="f1-heading text-3xl text-white/20 w-8">{i + 1}</div>
                      <div className="w-1 h-12 rounded" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="f1-heading text-xl text-white">{d.code}</span>
                          <span className="text-white/40 text-sm">{d.name}</span>
                          <span className="f1-mono text-xs px-2 py-0.5 rounded" style={{ background: `${color}22`, color }}>{d.team}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <StatBar label="PCE" value={d.pace} color={color} />
                          <StatBar label="RAC" value={d.racecraft} color={color} />
                          <StatBar label="CON" value={d.consistency} color={color} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="f1-heading text-4xl" style={{ color }}>{d.overall}</div>
                        <div className="f1-mono text-white/30 text-xs">OVR</div>
                        <div className="f1-mono text-white/20 text-xs mt-1">{d.racesAnalyzed} races</div>
                      </div>
                    </div>
                    {isSel && (
                      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div>
                          <div className="f1-mono text-white/30 text-xs mb-3">ALL RATINGS</div>
                          <div className="flex flex-col gap-2">
                            <StatBar label="PCE" value={d.pace} color={color} />
                            <StatBar label="RAC" value={d.racecraft} color={color} />
                            <StatBar label="DEF" value={d.defense} color={color} />
                            <StatBar label="CON" value={d.consistency} color={color} />
                            <StatBar label="WET" value={d.wetWeather} color={color} />
                            <StatBar label="TYR" value={d.tyreManagement} color={color} />
                          </div>
                        </div>
                        <div>
                          <div className="f1-mono text-white/30 text-xs mb-3">STATS</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[{ l: 'AVG FINISH', v: `P${d.avgFinish}` }, { l: 'AVG GRID', v: `P${d.avgGrid}` }, { l: 'POS GAINED', v: `+${d.avgPositionsGained}` }, { l: 'PTS/RACE', v: d.pointsPerRace }, { l: 'PODIUM %', v: `${(d.podiumRate * 100).toFixed(0)}%` }, { l: 'DNF RATE', v: `${(d.dnfRate * 100).toFixed(0)}%` }].map(({ l, v }) => (
                              <div key={l} className="glass-panel p-2 rounded"><div className="f1-mono text-white/25 text-xs">{l}</div><div className="f1-heading text-lg text-white">{v}</div></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="f1-mono text-white/40 text-xs mb-4 tracking-widest">TOP 5</div>
              {ratings.slice(0, 5).map((d, i) => {
                const color = tc(d.constructorId);
                return (
                  <div key={d.driverId} className="flex items-center gap-3 mb-3">
                    <div className="f1-heading text-2xl text-white/20">{i + 1}</div>
                    <div className="w-1 h-8 rounded" style={{ background: color }} />
                    <div className="flex-1"><div className="f1-subheading text-white text-sm">{d.code}</div><div className="f1-mono text-white/30 text-xs">{d.team}</div></div>
                    <div className="f1-heading text-2xl" style={{ color }}>{d.overall}</div>
                  </div>
                );
              })}
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="f1-mono text-white/40 text-xs mb-4 tracking-widest">MODEL INFO</div>
              <div className="flex flex-col gap-2 text-xs f1-mono">
                {[['Season', year], ['Races analyzed', 'Last 6'], ['Drivers rated', ratings.length], ['Data source', 'Jolpica API'], ['Algorithm', 'Weighted scoring'], ['Last run', new Date().toLocaleDateString()]].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between"><span className="text-white/30">{l}</span><span className="text-white/60">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-yellow-400/10">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-yellow-400/60 flex-shrink-0 mt-0.5" />
                <p className="text-white/20 text-xs f1-mono">Ratings are calculated from race results. Some metrics use proxies as full telemetry is not publicly available.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
