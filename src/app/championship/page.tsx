'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Info, RefreshCw } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
  racing_bulls: '#6692FF', kick_sauber: '#52E252',
};
function tc(cid: string) { return TEAM_COLORS[cid] ?? '#888'; }

interface Standing {
  driverId: string; code: string; name: string;
  team: string; constructorId: string;
  points: number; wins: number; position: number;
  winProbability: number; podiumProbability: number;
  pointsHistory: { round: number; points: number }[];
  bayesianScore: number;
}

function computeBayesianProbabilities(standings: Standing[], racesLeft: number): Standing[] {
  if (standings.length === 0) return standings;
  const leader = standings[0];
  return standings.map(driver => {
    const gap = leader.points - driver.points;
    const maxGain = racesLeft * 26;
    if (gap > maxGain && driver.driverId !== leader.driverId) {
      return { ...driver, winProbability: 0, podiumProbability: Math.min(0.15, driver.wins / Math.max(1, driver.pointsHistory.length)) };
    }
    const racesRun = driver.pointsHistory.length;
    const alpha = driver.wins + 0.5;
    const beta_val = racesRun - driver.wins + 0.5;
    const winRate = alpha / (alpha + beta_val);
    const gapFactor = Math.max(0, 1 - gap / Math.max(1, maxGain));
    const score = winRate * 0.4 + gapFactor * 0.5 + (driver.points / Math.max(1, leader.points)) * 0.1;
    return { ...driver, bayesianScore: score, winProbability: score, podiumProbability: Math.min(0.95, score * 2.5 + 0.05) };
  });
}

function normalizeProbs(standings: Standing[]): Standing[] {
  const total = standings.reduce((s, d) => s + d.winProbability, 0);
  if (total === 0) return standings;
  return standings.map(d => ({ ...d, winProbability: d.winProbability / total }));
}

function ProbBar({ prob, color, label }: { prob: number; color: string; label: string }) {
  const pct = Math.round(prob * 100);
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="f1-mono text-white/40 text-xs w-8 text-right">{label}</div>
      <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden relative">
        <div className="h-full rounded transition-all duration-1000 flex items-center"
          style={{ width: `${Math.max(pct, 1)}%`, background: `${color}88` }}>
          {pct > 8 && <span className="f1-mono text-white text-xs px-2 font-bold">{pct}%</span>}
        </div>
        {pct <= 8 && <span className="f1-mono text-white/60 text-xs absolute left-2 top-0.5">{pct}%</span>}
      </div>
    </div>
  );
}

export default function ChampionshipPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState('');
  const [racesLeft, setRacesLeft] = useState(0);
  const [racesRun, setRacesRun] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [view, setView] = useState<'probability' | 'points'>('probability');

  async function loadData() {
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
      const completed = allRaces.filter((r: any) => new Date(r.date) < now);
      const remaining = allRaces.filter((r: any) => new Date(r.date) >= now);
      setRacesRun(completed.length);
      setRacesLeft(remaining.length);
      const rawStandings = standJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
      const historyMap: Record<string, { round: number; points: number }[]> = {};
      for (let round = 1; round <= Math.min(completed.length, 8); round++) {
        try {
          const rRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/driverStandings.json`);
          const rJson = await rRes.json();
          const rStandings = rJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
          rStandings.forEach((s: any) => {
            const id = s.Driver.driverId;
            if (!historyMap[id]) historyMap[id] = [];
            historyMap[id].push({ round, points: parseFloat(s.points) });
          });
          await new Promise(r => setTimeout(r, 120));
        } catch (e) { /* skip */ }
      }
      const built: Standing[] = rawStandings.map((s: any) => {
        const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
        const id = s.Driver.driverId;
        return {
          driverId: id,
          code: s.Driver.code ?? id.slice(0, 3).toUpperCase(),
          name: `${s.Driver.givenName} ${s.Driver.familyName}`,
          team: s.Constructors?.[0]?.name ?? 'Unknown',
          constructorId: cid,
          points: parseFloat(s.points),
          wins: parseInt(s.wins ?? '0'),
          position: parseInt(s.position),
          winProbability: 0, podiumProbability: 0, bayesianScore: 0,
          pointsHistory: historyMap[id] ?? [],
        };
      });
      const withProbs = normalizeProbs(computeBayesianProbabilities(built, remaining.length));
      setStandings(withProbs);
      setLastUpdated(new Date().toLocaleString());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const maxPoints = standings[0]?.points ?? 1;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">BAYESIAN MODEL · LIVE DATA</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">CHAMPIONSHIP</span><br />
          <span className="text-[#E10600]">PROBABILITY</span>
        </h1>
        <p className="text-white/40 max-w-2xl">Bayesian championship probability model. Win rates computed as Beta distributions updated after every race. Accounts for points gaps, races remaining, and historical win rates.</p>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
          <div className="f1-heading text-2xl text-white">COMPUTING PROBABILITIES</div>
          <div className="f1-mono text-white/30 text-sm">Fetching race-by-race standings history...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-4">
              {[{ l: 'SEASON', v: season }, { l: 'RACES RUN', v: String(racesRun) }, { l: 'RACES LEFT', v: String(racesLeft) }].map(({ l, v }) => (
                <div key={l} className="glass-panel rounded-xl px-5 py-3 border border-white/5">
                  <div className="f1-mono text-white/30 text-xs">{l}</div>
                  <div className={`f1-heading text-2xl ${l === 'RACES LEFT' ? 'text-[#E10600]' : 'text-white'}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {(['probability', 'points'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`f1-mono text-xs px-4 py-2 rounded border transition-all ${view === v ? 'bg-[#E10600] border-[#E10600] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                  {v === 'probability' ? 'WIN PROBABILITY' : 'POINTS TRACKER'}
                </button>
              ))}
              <button onClick={loadData} className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white f1-mono text-xs px-4 py-2 rounded transition-all">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {view === 'probability' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl border border-white/5 p-6">
                <div className="f1-mono text-white/40 text-xs tracking-widest mb-6">CHAMPIONSHIP WIN PROBABILITY</div>
                {standings.map(d => <ProbBar key={d.driverId} prob={d.winProbability} color={tc(d.constructorId)} label={d.code} />)}
              </div>
              <div className="flex flex-col gap-4">
                {standings.slice(0, 6).map((d, i) => {
                  const color = tc(d.constructorId);
                  return (
                    <div key={d.driverId} className="glass-panel rounded-xl border border-white/5 p-4 flex items-center gap-4" style={{ borderLeft: `3px solid ${color}` }}>
                      <div className="f1-heading text-3xl text-white/20 w-6">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="f1-subheading text-white text-sm">{d.name}</div>
                        <div className="f1-mono text-xs truncate" style={{ color }}>{d.team}</div>
                        <div className="flex gap-4 mt-1">
                          <span className="f1-mono text-white/50 text-xs">{d.points} PTS</span>
                          <span className="f1-mono text-white/30 text-xs">{d.wins} WINS</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="f1-heading text-3xl" style={{ color }}>{Math.round(d.winProbability * 100)}%</div>
                        <div className="f1-mono text-white/30 text-xs">WIN PROB</div>
                        <div className="f1-mono text-xs mt-1" style={{ color }}>{Math.round(d.podiumProbability * 100)}% PODIUM</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'points' && (
            <div className="flex flex-col gap-4">
              {standings.map((d, i) => {
                const color = tc(d.constructorId);
                const gap = standings[0].points - d.points;
                const history = d.pointsHistory;
                const max = maxPoints || 1;
                return (
                  <div key={d.driverId} className="glass-panel rounded-xl border border-white/5 p-4" style={{ borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="f1-heading text-2xl text-white/20 w-6">{i + 1}</div>
                      <div className="flex-1">
                        <div className="f1-subheading text-white">{d.name}</div>
                        <div className="f1-mono text-xs" style={{ color }}>{d.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="f1-heading text-2xl text-white">{d.points}</div>
                        {gap > 0 && <div className="f1-mono text-white/30 text-xs">-{gap} PTS</div>}
                      </div>
                    </div>
                    {history.length > 1 ? (
                      <svg viewBox="0 0 300 40" className="w-full" style={{ height: 40 }}>
                        <polyline
                          points={history.map((h, idx) => `${(idx / (history.length - 1)) * 300},${40 - (h.points / max) * 36}`).join(' ')}
                          fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {history.map((h, idx) => (
                          <circle key={idx} cx={(idx / (history.length - 1)) * 300} cy={40 - (h.points / max) * 36} r="3" fill={color} />
                        ))}
                      </svg>
                    ) : (
                      <div className="f1-mono text-white/20 text-xs h-10 flex items-center">Building points history...</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 p-4 glass-panel rounded-xl border border-white/5">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-[#E10600] flex-shrink-0 mt-0.5" />
              <p className="text-white/30 text-xs f1-mono">Bayesian model: Beta(wins + 0.5, non-wins + 0.5) prior for each driver. Posterior combines win rate with current points gap vs maximum possible gain. Probabilities normalised to 100%. Updated: {lastUpdated}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
