'use client';

import { useState, useEffect } from 'react';
import { Info, RefreshCw, TrendingUp } from 'lucide-react';

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
  pointsHistory: { round: number; points: number; race: string }[];
  bayesianScore: number;
}

interface HistoricalChampion {
  year: number; driver: string; team: string; points: number; wins: number; constructorId: string;
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

function ProbBar({ prob, color, label, pts }: { prob: number; color: string; label: string; pts: number }) {
  const pct = Math.round(prob * 100);
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="f1-mono text-white/40 text-xs w-8 text-right flex-shrink-0">{label}</div>
      <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden relative">
        <div className="h-full rounded transition-all duration-1000 flex items-center"
          style={{ width: `${Math.max(pct, 1)}%`, background: `${color}88` }}>
          {pct > 8 && <span className="f1-mono text-white text-xs px-2 font-bold">{pct}%</span>}
        </div>
        {pct <= 8 && <span className="f1-mono text-white/60 text-xs absolute left-2 top-1">{pct}%</span>}
      </div>
      <div className="f1-mono text-white/40 text-xs w-12 text-right flex-shrink-0">{pts} PTS</div>
    </div>
  );
}

const HISTORICAL_CHAMPIONS: HistoricalChampion[] = [
  { year: 2025, driver: 'Lando Norris', team: 'McLaren', points: 391, wins: 8, constructorId: 'mclaren' },
  { year: 2024, driver: 'Max Verstappen', team: 'Red Bull Racing', points: 437, wins: 9, constructorId: 'red_bull' },
  { year: 2023, driver: 'Max Verstappen', team: 'Red Bull Racing', points: 575, wins: 19, constructorId: 'red_bull' },
  { year: 2022, driver: 'Max Verstappen', team: 'Red Bull Racing', points: 454, wins: 15, constructorId: 'red_bull' },
  { year: 2021, driver: 'Max Verstappen', team: 'Red Bull Racing', points: 395, wins: 10, constructorId: 'red_bull' },
  { year: 2020, driver: 'Lewis Hamilton', team: 'Mercedes', points: 347, wins: 11, constructorId: 'mercedes' },
  { year: 2019, driver: 'Lewis Hamilton', team: 'Mercedes', points: 413, wins: 11, constructorId: 'mercedes' },
  { year: 2018, driver: 'Lewis Hamilton', team: 'Mercedes', points: 408, wins: 11, constructorId: 'mercedes' },
  { year: 2017, driver: 'Lewis Hamilton', team: 'Mercedes', points: 363, wins: 9, constructorId: 'mercedes' },
  { year: 2016, driver: 'Nico Rosberg', team: 'Mercedes', points: 385, wins: 9, constructorId: 'mercedes' },
  { year: 2015, driver: 'Lewis Hamilton', team: 'Mercedes', points: 381, wins: 10, constructorId: 'mercedes' },
  { year: 2014, driver: 'Lewis Hamilton', team: 'Mercedes', points: 384, wins: 11, constructorId: 'mercedes' },
  { year: 2013, driver: 'Sebastian Vettel', team: 'Red Bull Racing', points: 397, wins: 13, constructorId: 'red_bull' },
  { year: 2012, driver: 'Sebastian Vettel', team: 'Red Bull Racing', points: 281, wins: 5, constructorId: 'red_bull' },
  { year: 2011, driver: 'Sebastian Vettel', team: 'Red Bull Racing', points: 392, wins: 11, constructorId: 'red_bull' },
  { year: 2010, driver: 'Sebastian Vettel', team: 'Red Bull Racing', points: 256, wins: 5, constructorId: 'red_bull' },
  { year: 2009, driver: 'Jenson Button', team: 'Brawn GP', points: 95, wins: 6, constructorId: 'williams' },
  { year: 2008, driver: 'Lewis Hamilton', team: 'McLaren', points: 98, wins: 5, constructorId: 'mclaren' },
  { year: 2007, driver: 'Kimi Raikkonen', team: 'Ferrari', points: 110, wins: 6, constructorId: 'ferrari' },
  { year: 2006, driver: 'Fernando Alonso', team: 'Renault', points: 134, wins: 7, constructorId: 'alpine' },
  { year: 2005, driver: 'Fernando Alonso', team: 'Renault', points: 133, wins: 7, constructorId: 'alpine' },
  { year: 2004, driver: 'Michael Schumacher', team: 'Ferrari', points: 148, wins: 13, constructorId: 'ferrari' },
  { year: 2003, driver: 'Michael Schumacher', team: 'Ferrari', points: 93, wins: 6, constructorId: 'ferrari' },
  { year: 2002, driver: 'Michael Schumacher', team: 'Ferrari', points: 144, wins: 11, constructorId: 'ferrari' },
  { year: 2001, driver: 'Michael Schumacher', team: 'Ferrari', points: 123, wins: 9, constructorId: 'ferrari' },
  { year: 2000, driver: 'Michael Schumacher', team: 'Ferrari', points: 108, wins: 9, constructorId: 'ferrari' },
];

export default function ChampionshipPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState('');
  const [racesLeft, setRacesLeft] = useState(0);
  const [racesRun, setRacesRun] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [view, setView] = useState<'probability' | 'points' | 'history'>('probability');
  const [historicalYear, setHistoricalYear] = useState<number | null>(null);
  const [historicalStandings, setHistoricalStandings] = useState<any[]>([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);

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

      // Fetch round-by-round points history
      const historyMap: Record<string, { round: number; points: number; race: string }[]> = {};
      for (let round = 1; round <= Math.min(completed.length, 10); round++) {
        try {
          const rRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/driverStandings.json`);
          const rJson = await rRes.json();
          const rStandings = rJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
          const raceName = completed[round - 1]?.raceName?.replace(' Grand Prix', '') ?? `R${round}`;
          rStandings.forEach((s: any) => {
            const id = s.Driver.driverId;
            if (!historyMap[id]) historyMap[id] = [];
            historyMap[id].push({ round, points: parseFloat(s.points), race: raceName });
          });
          await new Promise(r => setTimeout(r, 150));
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

  async function loadHistoricalYear(year: number) {
    setLoadingHistorical(true);
    setHistoricalYear(year);
    try {
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
      const json = await res.json();
      const s = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
      setHistoricalStandings(s);
    } catch (e) { console.error(e); }
    setLoadingHistorical(false);
  }

  useEffect(() => { loadData(); }, []);

  const maxPoints = standings[0]?.points ?? 1;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">BAYESIAN MODEL · LIVE {season} DATA</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">CHAMPIONSHIP</span><br />
          <span className="text-[#E10600]">PROBABILITY</span>
        </h1>
        <p className="text-white/40 max-w-2xl">Live {season} Bayesian championship model plus full historical standings from 2000 to present. Win rates computed as Beta distributions, updated after every race.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
          <div className="f1-heading text-2xl text-white">LOADING {season} DATA</div>
          <div className="f1-mono text-white/30 text-sm">Fetching live standings and race history...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-3 flex-wrap">
              {[{ l: 'SEASON', v: season }, { l: 'RACES RUN', v: String(racesRun) }, { l: 'RACES LEFT', v: String(racesLeft) }, { l: 'DRIVERS', v: String(standings.length) }].map(({ l, v }) => (
                <div key={l} className="glass-panel rounded-xl px-4 py-3 border border-white/5">
                  <div className="f1-mono text-white/30 text-xs">{l}</div>
                  <div className={`f1-heading text-2xl ${l === 'RACES LEFT' ? 'text-[#E10600]' : 'text-white'}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'probability', label: 'WIN PROB' },
                { key: 'points', label: 'POINTS' },
                { key: 'history', label: 'HISTORY' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setView(key as any)}
                  className={`f1-mono text-xs px-4 py-2 rounded border transition-all ${view === key ? 'bg-[#E10600] border-[#E10600] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                  {label}
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
                <div className="f1-mono text-white/40 text-xs tracking-widest mb-6">{season} CHAMPIONSHIP WIN PROBABILITY</div>
                {standings.map(d => (
                  <ProbBar key={d.driverId} prob={d.winProbability} color={tc(d.constructorId)} label={d.code} pts={d.points} />
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {standings.slice(0, 8).map((d, i) => {
                  const color = tc(d.constructorId);
                  const gap = standings[0].points - d.points;
                  return (
                    <div key={d.driverId} className="glass-panel rounded-xl border border-white/5 p-4 flex items-center gap-4" style={{ borderLeft: `3px solid ${color}` }}>
                      <div className="f1-heading text-2xl text-white/20 w-6 flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="f1-subheading text-white text-sm truncate">{d.name}</div>
                        <div className="f1-mono text-xs truncate" style={{ color }}>{d.team}</div>
                        <div className="flex gap-3 mt-0.5">
                          <span className="f1-mono text-white/50 text-xs">{d.points} PTS</span>
                          <span className="f1-mono text-white/30 text-xs">{d.wins} W</span>
                          {gap > 0 && <span className="f1-mono text-white/20 text-xs">-{gap}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="f1-heading text-2xl" style={{ color }}>{Math.round(d.winProbability * 100)}%</div>
                        <div className="f1-mono text-white/30 text-xs">WIN</div>
                        <div className="f1-mono text-xs mt-0.5" style={{ color }}>{Math.round(d.podiumProbability * 100)}% POD</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'points' && (
            <div className="flex flex-col gap-4">
              <div className="f1-mono text-white/30 text-xs tracking-widest mb-2">{season} POINTS PROGRESSION</div>
              {standings.map((d, i) => {
                const color = tc(d.constructorId);
                const gap = standings[0].points - d.points;
                const history = d.pointsHistory;
                const max = maxPoints || 1;
                return (
                  <div key={d.driverId} className="glass-panel rounded-xl border border-white/5 p-4" style={{ borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="f1-heading text-2xl text-white/20 w-6 flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="f1-subheading text-white truncate">{d.name}</div>
                        <div className="f1-mono text-xs truncate" style={{ color }}>{d.team}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="f1-heading text-2xl text-white">{d.points}</div>
                        {gap > 0 && <div className="f1-mono text-white/30 text-xs">-{gap} PTS</div>}
                      </div>
                    </div>
                    {history.length > 1 ? (
                      <div className="relative">
                        <svg viewBox="0 0 400 50" className="w-full" style={{ height: 50 }}>
                          <polyline
                            points={history.map((h, idx) => `${(idx / (history.length - 1)) * 400},${50 - (h.points / max) * 46}`).join(' ')}
                            fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {history.map((h, idx) => (
                            <circle key={idx} cx={(idx / (history.length - 1)) * 400} cy={50 - (h.points / max) * 46} r="3.5" fill={color} />
                          ))}
                        </svg>
                        <div className="flex justify-between mt-1">
                          {history.map((h, idx) => (
                            <div key={idx} className="f1-mono text-white/20 text-xs text-center" style={{ fontSize: 8 }}>{h.race}</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="f1-mono text-white/20 text-xs h-8 flex items-center">Points history loads after Round 2+</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'history' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="f1-mono text-white/40 text-xs tracking-widest mb-4">CHAMPIONS 2000–PRESENT</div>
                <div className="flex flex-col gap-2">
                  {HISTORICAL_CHAMPIONS.map(c => {
                    const color = tc(c.constructorId);
                    const isSelected = historicalYear === c.year;
                    return (
                      <button key={c.year} onClick={() => loadHistoricalYear(c.year)}
                        className={`glass-panel rounded-xl border p-3 flex items-center gap-4 text-left transition-all hover:border-white/20 w-full ${isSelected ? 'border-[#E10600]/50 bg-[#E10600]/5' : 'border-white/5'}`}>
                        <div className="f1-heading text-2xl text-white/30 w-12 flex-shrink-0">{c.year}</div>
                        <div className="w-1 h-8 rounded flex-shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <div className="f1-subheading text-white text-sm truncate">{c.driver}</div>
                          <div className="f1-mono text-xs truncate" style={{ color }}>{c.team}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="f1-heading text-xl text-white">{c.points}</div>
                          <div className="f1-mono text-white/30 text-xs">{c.wins} WINS</div>
                        </div>
                        <div className="text-xl flex-shrink-0">🏆</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="f1-mono text-white/40 text-xs tracking-widest mb-4">
                  {historicalYear ? `${historicalYear} FULL STANDINGS` : 'SELECT A YEAR TO VIEW FULL STANDINGS'}
                </div>
                {!historicalYear && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-5xl mb-4">🏁</div>
                    <div className="f1-mono text-white/20 text-sm">Click any year on the left to load the full standings</div>
                  </div>
                )}
                {loadingHistorical && (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
                  </div>
                )}
                {!loadingHistorical && historicalStandings.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {historicalStandings.map((s: any, i: number) => {
                      const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
                      const color = tc(cid);
                      return (
                        <div key={s.Driver.driverId} className="glass-panel rounded-lg border border-white/5 p-3 flex items-center gap-3" style={{ borderLeft: `3px solid ${color}` }}>
                          <div className="f1-heading text-xl text-white/20 w-5 flex-shrink-0">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="f1-subheading text-white text-sm truncate">{s.Driver.givenName} {s.Driver.familyName}</div>
                            <div className="f1-mono text-xs truncate" style={{ color }}>{s.Constructors?.[0]?.name}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="f1-heading text-lg text-white">{s.points}</div>
                            <div className="f1-mono text-white/30 text-xs">{s.wins} W</div>
                          </div>
                          {i === 0 && <div className="text-lg flex-shrink-0">🏆</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 glass-panel rounded-xl border border-white/5">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-[#E10600] flex-shrink-0 mt-0.5" />
              <p className="text-white/30 text-xs f1-mono">
                {season} data: Bayesian model using Beta(wins+0.5, non-wins+0.5) prior. Probabilities normalised to 100%. Historical standings fetched live from Jolpica F1 API. Updated: {lastUpdated}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
