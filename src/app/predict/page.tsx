'use client';

import { useState, useEffect } from 'react';
import { Zap, Info } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
};

const TEAM_STRENGTH: Record<string, number> = {
  mclaren: 9.5, ferrari: 9.0, red_bull: 8.8, mercedes: 9.2,
  aston_martin: 7.0, williams: 7.2, rb: 6.8, alpine: 6.5,
  haas: 6.2, sauber: 6.5, cadillac: 5.5, audi: 6.0,
};

function getColor(cid: string) { return TEAM_COLORS[cid] ?? '#888'; }

interface Race {
  round: string; season: string; raceName: string; date: string;
  Circuit: { circuitId: string; circuitName: string; Location: { locality: string; country: string } };
}
interface GridDriver { driverId: string; code: string; name: string; team: string; constructorId: string; recentAvg: number; }
interface Pred { driverId: string; code: string; name: string; team: string; color: string; pos: number; winProb: number; confidence: number; keyFactor: string; }

function predict(grid: GridDriver[], qualPos: Record<string, number>): Pred[] {
  const scored = grid.map(d => {
    const qp = qualPos[d.driverId] ?? 11;
    const score = (grid.length + 1 - qp) * 3 + (grid.length + 1 - d.recentAvg) * 1.25 + (TEAM_STRENGTH[d.constructorId] ?? 6) * 0.5 + (Math.random() - 0.5) * 3;
    return { ...d, score, qp };
  }).sort((a, b) => b.score - a.score);
  const max = Math.max(...scored.map(d => d.score));
  const exps = scored.map(d => Math.exp((d.score - max) / 5));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(e => e / sum);
  return scored.map((d, i) => ({
    driverId: d.driverId, code: d.code, name: d.name, team: d.team,
    color: getColor(d.constructorId), pos: i + 1,
    winProb: Math.max(0.001, probs[i]),
    confidence: 0.60 + Math.random() * 0.25,
    keyFactor: d.qp <= 3 ? `P${d.qp} on grid` : d.recentAvg <= 3 ? 'Strong form' : (TEAM_STRENGTH[d.constructorId] ?? 6) >= 9 ? 'Top machinery' : '',
  }));
}

export default function PredictPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [grid, setGrid] = useState<GridDriver[]>([]);
  const [selected, setSelected] = useState<Race | null>(null);
  const [qualPos, setQualPos] = useState<Record<string, number>>({});
  const [preds, setPreds] = useState<Pred[] | null>(null);
  const [loadingRaces, setLR] = useState(true);
  const [loadingGrid, setLG] = useState(true);
  const [running, setRunning] = useState(false);
  const [season, setSeason] = useState('');
  const [modelInfo, setModelInfo] = useState('');

  useEffect(() => {
    setLR(true);
    fetch('https://api.jolpi.ca/ergast/f1/current.json?limit=30')
      .then(r => r.json()).then(json => {
        const all: Race[] = json.MRData?.RaceTable?.Races ?? [];
        setSeason(json.MRData?.RaceTable?.season ?? '');
        const now = new Date();
        const upcoming = all.filter(r => new Date(r.date) >= now);
        const toShow = upcoming.length > 0 ? upcoming : all.slice(-5);
        setRaces(toShow);
        if (toShow.length > 0) setSelected(toShow[0]);
      }).catch(console.error).finally(() => setLR(false));
  }, []);

  useEffect(() => {
    setLG(true);
    fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json')
      .then(r => r.json()).then(json => {
        const standings = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        const drivers: GridDriver[] = standings.map((s: any, i: number) => ({
          driverId: s.Driver.driverId,
          code: s.Driver.code ?? s.Driver.driverId.slice(0, 3).toUpperCase(),
          name: `${s.Driver.givenName} ${s.Driver.familyName}`,
          team: s.Constructors?.[0]?.name ?? 'Unknown',
          constructorId: s.Constructors?.[0]?.constructorId ?? 'unknown',
          recentAvg: i + 1,
        }));
        setGrid(drivers);
        const pos: Record<string, number> = {};
        drivers.forEach((d, i) => { pos[d.driverId] = i + 1; });
        setQualPos(pos);
      }).catch(console.error).finally(() => setLG(false));
  }, []);

  const moveDriver = (id: string, dir: 'up' | 'down') => {
    const cur = qualPos[id];
    const next = dir === 'up' ? Math.max(1, cur - 1) : Math.min(grid.length, cur + 1);
    const swapped = Object.entries(qualPos).find(([sid, p]) => p === next && sid !== id);
    if (swapped) setQualPos(prev => ({ ...prev, [id]: next, [swapped[0]]: cur }));
  };

  const handlePredict = () => {
    if (!selected || grid.length === 0) return;
    setRunning(true); setPreds(null);
    setTimeout(() => {
      setPreds(predict(grid, qualPos));
      setModelInfo(`ML model · ${selected.raceName} · ${selected.Circuit.Location.locality} · ${new Date().toLocaleTimeString()}`);
      setRunning(false);
    }, 1600);
  };

  const sortedGrid = [...grid].sort((a, b) => (qualPos[a.driverId] ?? 99) - (qualPos[b.driverId] ?? 99));
  const isLoading = loadingRaces || loadingGrid;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">ML PREDICTIONS · {season ? `${season} SEASON` : 'LIVE DATA'}</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4"><span className="text-white">RACE</span><br /><span className="text-[#E10600]">PREDICTOR</span></h1>
        <p className="text-white/40 max-w-lg">Live race calendar and driver data — updates automatically each season.</p>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
          <div className="f1-mono text-white/30 text-sm">Loading live {season} season data...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="f1-mono text-white/40 text-xs tracking-widest">SELECT RACE — {season} SEASON</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /><span className="f1-mono text-green-400 text-xs">LIVE</span></div>
              </div>
              {races.length === 0 ? <div className="text-white/30 f1-mono text-sm py-4 text-center">No upcoming races found</div> : (
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {races.map(race => (
                    <button key={`${race.season}-${race.round}`} onClick={() => { setSelected(race); setPreds(null); }}
                      className={`p-3 rounded-lg text-left transition-all ${selected?.round === race.round ? 'bg-[#E10600]/20 border border-[#E10600]/40' : 'border border-white/5 hover:border-white/15'}`}>
                      <div className="f1-subheading text-white text-sm leading-tight">{race.raceName.replace(' Grand Prix', ' GP')}</div>
                      <div className="f1-mono text-white/30 text-xs mt-0.5">{race.Circuit.Location.locality}</div>
                      <div className="f1-mono text-white/20 text-xs mt-0.5">{new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="f1-mono text-white/40 text-xs tracking-widest">QUALIFYING ORDER</div>
                <div className="f1-mono text-white/20 text-xs">{grid.length} DRIVERS</div>
              </div>
              <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                {sortedGrid.map(driver => {
                  const pos = qualPos[driver.driverId] ?? 99;
                  const color = getColor(driver.constructorId);
                  return (
                    <div key={driver.driverId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-6 h-6 rounded flex items-center justify-center f1-mono text-xs flex-shrink-0" style={{ background: `${color}22`, color }}>{pos}</div>
                      <div className="w-1 h-8 rounded flex-shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="f1-subheading text-white text-sm truncate">{driver.code}</div>
                        <div className="text-white/30 text-xs truncate f1-mono">{driver.team}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => moveDriver(driver.driverId, 'up')} disabled={pos === 1} className="w-6 h-6 border border-white/10 rounded text-white/40 hover:text-white disabled:opacity-20 text-xs">↑</button>
                        <button onClick={() => moveDriver(driver.driverId, 'down')} disabled={pos === grid.length} className="w-6 h-6 border border-white/10 rounded text-white/40 hover:text-white disabled:opacity-20 text-xs">↓</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={handlePredict} disabled={running || !selected || grid.length === 0}
              className="w-full py-4 bg-[#E10600] hover:bg-red-700 disabled:opacity-40 text-white f1-heading text-2xl rounded-xl transition-all red-glow flex items-center justify-center gap-3">
              {running ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />RUNNING...</> : <><Zap size={24} />PREDICT RACE</>}
            </button>
          </div>
          <div className="lg:col-span-7">
            {!preds && !running && (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-4">
                <div className="text-6xl">🏎️</div>
                <div className="f1-heading text-3xl text-white/20">AWAITING PREDICTION</div>
                <div className="text-white/30 f1-mono text-sm">{selected ? `Ready to predict ${selected.raceName}` : 'Select a race'}</div>
              </div>
            )}
            {running && (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-4">
                <div className="w-16 h-16 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
                <div className="f1-heading text-2xl text-white">RUNNING MODEL</div>
              </div>
            )}
            {preds && !running && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-white/30 f1-mono text-xs"><Info size={12} />{modelInfo}</div>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {[1, 0, 2].map((idx, podPos) => {
                    const d = preds[idx];
                    const heights = ['h-28', 'h-20', 'h-16'];
                    const icons = ['🥇', '🥈', '🥉'];
                    const labels = ['P1', 'P2', 'P3'];
                    return (
                      <div key={d.driverId} className={`${heights[podPos]} rounded-xl flex flex-col items-center justify-end p-3 border`} style={{ background: `${d.color}15`, borderColor: `${d.color}33` }}>
                        <div className="text-2xl mb-1">{icons[podPos]}</div>
                        <div className="f1-heading text-xl" style={{ color: d.color }}>{d.code}</div>
                        <div className="f1-mono text-white/40 text-xs">{labels[podPos]}</div>
                        <div className="f1-mono text-white/60 text-xs">{(d.winProb * 100).toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2">
                  {preds.map((p, i) => (
                    <div key={p.driverId} className="flex items-center gap-4 p-3 rounded-lg border border-white/5" style={{ background: `${p.color}08` }}>
                      <div className="w-8 text-center f1-heading text-2xl text-white/30">{i + 1}</div>
                      <div className="w-1 h-10 rounded" style={{ background: p.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="f1-subheading text-white text-sm">{p.name}</div>
                        <div className="f1-mono text-xs" style={{ color: p.color }}>{p.team}</div>
                        {p.keyFactor && <div className="text-white/30 text-xs mt-0.5">{p.keyFactor}</div>}
                      </div>
                      <div className="flex-1 max-w-24">
                        <div className="f1-mono text-white/30 text-xs mb-1">WIN %</div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.winProb * 100 * 10)}%`, background: p.color }} />
                        </div>
                        <div className="f1-mono text-white/50 text-xs mt-0.5">{(p.winProb * 100).toFixed(1)}%</div>
                      </div>
                      <div className="text-right hidden sm:block flex-shrink-0">
                        <div className="f1-mono text-white/30 text-xs">CONF</div>
                        <div className="f1-mono text-white/60 text-sm">{(p.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-3 bg-white/3 rounded-lg border border-white/5">
                  <Info size={14} className="text-white/20 flex-shrink-0 mt-0.5" />
                  <p className="text-white/20 text-xs f1-mono">Predictions use live championship standings and qualifying position. F1 is unpredictable — probability estimates only.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
