'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Trophy, TrendingUp } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
  racing_bulls: '#6692FF', kick_sauber: '#52E252',
  brabham: '#888', lotus: '#FFD700', tyrrell: '#4444FF',
  mclaren_old: '#FF8000', renault: '#FFD700', benetton: '#00AA44',
  brawn: '#B5FF00', jordan: '#FFD700', minardi: '#333',
};
function tc(cid: string) {
  return TEAM_COLORS[cid] ?? TEAM_COLORS[Object.keys(TEAM_COLORS).find(k => cid.includes(k)) ?? ''] ?? '#888';
}

const DECADES = [
  { label: '2020s', years: [2026,2025,2024,2023,2022,2021,2020] },
  { label: '2010s', years: [2019,2018,2017,2016,2015,2014,2013,2012,2011,2010] },
  { label: '2000s', years: [2009,2008,2007,2006,2005,2004,2003,2002,2001,2000] },
  { label: '1990s', years: [1999,1998,1997,1996,1995,1994,1993,1992,1991,1990] },
  { label: '1980s', years: [1989,1988,1987,1986,1985,1984,1983,1982,1981,1980] },
  { label: '1970s', years: [1979,1978,1977,1976,1975,1974,1973,1972,1971,1970] },
  { label: '1960s', years: [1969,1968,1967,1966,1965,1964,1963,1962,1961,1960] },
  { label: '1950s', years: [1959,1958,1957,1956,1955,1954,1953,1952,1951,1950] },
];

export default function StandingsPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'drivers' | 'constructors' | 'history'>('drivers');

  // History state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [histDrivers, setHistDrivers] = useState<any[]>([]);
  const [histConstructors, setHistConstructors] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histTab, setHistTab] = useState<'drivers' | 'constructors'>('drivers');
  const [searchYear, setSearchYear] = useState('');
  const [expandedDecade, setExpandedDecade] = useState<string | null>('2020s');

  async function load() {
    setLoading(true);
    const year = new Date().getFullYear();
    setSeason(String(year));
    try {
      const [dRes, cRes] = await Promise.all([
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`),
      ]);
      const dJson = await dRes.json();
      const cJson = await cRes.json();
      setDrivers(dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []);
      setConstructors(cJson.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const loadHistYear = useCallback(async (year: number) => {
    setHistLoading(true);
    setSelectedYear(year);
    setHistDrivers([]); setHistConstructors([]);
    try {
      const [dRes, cRes] = await Promise.all([
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`),
      ]);
      const dJson = await dRes.json();
      const cJson = await cRes.json();
      setHistDrivers(dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []);
      setHistConstructors(cJson.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []);
    } catch (e) { console.error(e); }
    setHistLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const leader = drivers[0];
  const cLeader = constructors[0];

  const handleYearSearch = () => {
    const y = parseInt(searchYear);
    if (!isNaN(y) && y >= 1950 && y <= new Date().getFullYear()) loadHistYear(y);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">LIVE DATA · {season} SEASON · 1950–PRESENT</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">CHAMPIONSHIP</span><br />
          <span className="text-[#E10600]">STANDINGS</span>
        </h1>
        <p className="text-white/40 max-w-xl">Live {season} standings plus complete historical records from 1950 to present. All data from Jolpica F1 API — updates automatically after every race.</p>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'drivers', label: 'DRIVERS' },
            { key: 'constructors', label: 'CONSTRUCTORS' },
            { key: 'history', label: 'ALL HISTORY' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`f1-subheading px-5 py-2 rounded transition-all ${tab === key ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/40 hover:border-white/30'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#E10600]/10 border border-[#E10600]/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse" />
            <span className="f1-mono text-[#E10600] text-xs">LIVE {season}</span>
          </div>
          {tab !== 'history' && (
            <button onClick={load} className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white f1-mono text-xs px-4 py-2 rounded transition-all">
              <RefreshCw size={14} /> REFRESH
            </button>
          )}
        </div>
      </div>

      {loading && tab !== 'history' ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
          <div className="f1-mono text-white/30">Loading {season} standings...</div>
        </div>
      ) : (
        <>
          {tab === 'drivers' && (
            <div className="flex flex-col gap-3">
              {drivers.map((s: any, i: number) => {
                const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
                const color = tc(cid);
                const pts = parseFloat(s.points);
                const gap = leader ? parseFloat(leader.points) - pts : 0;
                const barWidth = leader ? (pts / parseFloat(leader.points)) * 100 : 0;
                return (
                  <div key={s.Driver.driverId} className="glass-panel rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all" style={{ borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="f1-heading text-3xl text-white/20 w-8 flex-shrink-0">{s.position}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="f1-subheading text-white text-lg">{s.Driver.givenName} {s.Driver.familyName}</div>
                          {i === 0 && <span className="f1-mono text-xs px-2 py-0.5 rounded bg-[#E10600] text-white">LEADER</span>}
                          {i === 0 && <Trophy size={14} className="text-[#FFD700]" />}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="f1-mono text-xs" style={{ color }}>{s.Constructors?.[0]?.name}</span>
                          <span className="f1-mono text-white/30 text-xs">{s.wins} WINS</span>
                          {gap > 0 && <span className="f1-mono text-white/20 text-xs">-{gap} PTS</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="f1-heading text-3xl" style={{ color }}>{pts}</div>
                        <div className="f1-mono text-white/30 text-xs">PTS</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${barWidth}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'constructors' && (
            <div className="flex flex-col gap-3">
              {constructors.map((s: any, i: number) => {
                const cid = s.Constructor?.constructorId ?? 'unknown';
                const color = tc(cid);
                const pts = parseFloat(s.points);
                const topPts = cLeader ? parseFloat(cLeader.points) : 1;
                const barWidth = (pts / topPts) * 100;
                const gap = topPts - pts;
                return (
                  <div key={s.Constructor.constructorId} className="glass-panel rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all" style={{ borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="f1-heading text-3xl text-white/20 w-8 flex-shrink-0">{s.position}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="f1-subheading text-white text-lg">{s.Constructor.name}</div>
                          {i === 0 && <span className="f1-mono text-xs px-2 py-0.5 rounded bg-[#E10600] text-white">LEADER</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="f1-mono text-white/30 text-xs">{s.wins} WINS</span>
                          {gap > 0 && <span className="f1-mono text-white/20 text-xs">-{gap} PTS</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="f1-heading text-3xl" style={{ color }}>{pts}</div>
                        <div className="f1-mono text-white/30 text-xs">PTS</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${barWidth}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'history' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="f1-mono text-white/40 text-xs tracking-widest mb-4">SELECT SEASON</div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="number" min={1950} max={new Date().getFullYear()}
                    value={searchYear} onChange={e => setSearchYear(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleYearSearch()}
                    className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white f1-mono text-sm outline-none focus:border-[#E10600]/50"
                    placeholder="e.g. 1988" />
                  <button onClick={handleYearSearch} className="bg-[#E10600] hover:bg-red-700 text-white px-3 py-2 rounded transition-colors">
                    <Search size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {DECADES.map(decade => (
                    <div key={decade.label}>
                      <button
                        onClick={() => setExpandedDecade(expandedDecade === decade.label ? null : decade.label)}
                        className="w-full flex items-center justify-between px-4 py-2.5 glass-panel rounded-lg border border-white/5 hover:border-white/15 transition-all">
                        <span className="f1-subheading text-white text-sm">{decade.label}</span>
                        <span className="f1-mono text-white/30 text-xs">{expandedDecade === decade.label ? '▲' : '▼'}</span>
                      </button>
                      {expandedDecade === decade.label && (
                        <div className="grid grid-cols-5 gap-1 mt-1 mb-1">
                          {decade.years.map(year => (
                            <button key={year} onClick={() => loadHistYear(year)}
                              className={`f1-mono text-xs py-1.5 rounded border transition-all ${selectedYear === year ? 'bg-[#E10600] border-[#E10600] text-white' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'}`}>
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                {!selectedYear && (
                  <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
                    <div className="text-6xl">🏆</div>
                    <div className="f1-heading text-3xl text-white/20">SELECT A SEASON</div>
                    <div className="f1-mono text-white/20 text-sm">Choose any year from 1950 to {new Date().getFullYear()}</div>
                  </div>
                )}
                {histLoading && (
                  <div className="flex items-center justify-center py-32">
                    <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
                  </div>
                )}
                {!histLoading && selectedYear && (
                  <>
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                      <div>
                        <div className="f1-heading text-5xl text-white">{selectedYear}</div>
                        <div className="f1-mono text-white/30 text-xs mt-1">FORMULA 1 WORLD CHAMPIONSHIP</div>
                      </div>
                      <div className="flex gap-2">
                        {(['drivers', 'constructors'] as const).map(t => (
                          <button key={t} onClick={() => setHistTab(t)}
                            className={`f1-mono text-xs px-4 py-2 rounded border transition-all ${histTab === t ? 'bg-[#E10600] border-[#E10600] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {histTab === 'drivers' && histDrivers.length === 0 && (
                      <div className="f1-mono text-white/30 text-sm text-center py-8">No driver data available for {selectedYear}</div>
                    )}
                    {histTab === 'constructors' && histConstructors.length === 0 && selectedYear < 1958 && (
                      <div className="f1-mono text-white/30 text-sm text-center py-8">Constructor championship started in 1958</div>
                    )}

                    {histTab === 'drivers' && (
                      <div className="flex flex-col gap-2">
                        {histDrivers.map((s: any, i: number) => {
                          const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
                          const color = tc(cid);
                          const pts = parseFloat(s.points);
                          const topPts = histDrivers[0] ? parseFloat(histDrivers[0].points) : 1;
                          return (
                            <div key={s.Driver.driverId} className="glass-panel rounded-xl border border-white/5 p-3 flex items-center gap-3" style={{ borderLeft: `3px solid ${color}` }}>
                              <div className="f1-heading text-2xl text-white/20 w-6 flex-shrink-0">{s.position}</div>
                              {i === 0 && <Trophy size={16} className="text-[#FFD700] flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="f1-subheading text-white text-sm truncate">{s.Driver.givenName} {s.Driver.familyName}</div>
                                <div className="flex gap-2 items-center">
                                  <span className="f1-mono text-xs truncate" style={{ color }}>{s.Constructors?.[0]?.name}</span>
                                  <span className="f1-mono text-white/20 text-xs">{s.wins} W</span>
                                </div>
                                <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(pts / topPts) * 100}%`, background: color }} />
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="f1-heading text-xl" style={{ color }}>{pts}</div>
                                <div className="f1-mono text-white/30 text-xs">PTS</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {histTab === 'constructors' && (
                      <div className="flex flex-col gap-2">
                        {histConstructors.length === 0 && selectedYear >= 1958 && (
                          <div className="f1-mono text-white/30 text-sm text-center py-8">No constructor data for {selectedYear}</div>
                        )}
                        {histConstructors.map((s: any, i: number) => {
                          const cid = s.Constructor?.constructorId ?? 'unknown';
                          const color = tc(cid);
                          const pts = parseFloat(s.points);
                          const topPts = histConstructors[0] ? parseFloat(histConstructors[0].points) : 1;
                          return (
                            <div key={s.Constructor.constructorId} className="glass-panel rounded-xl border border-white/5 p-3 flex items-center gap-3" style={{ borderLeft: `3px solid ${color}` }}>
                              <div className="f1-heading text-2xl text-white/20 w-6 flex-shrink-0">{s.position}</div>
                              {i === 0 && <Trophy size={16} className="text-[#FFD700] flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="f1-subheading text-white text-sm">{s.Constructor.name}</div>
                                <div className="f1-mono text-white/20 text-xs">{s.wins} WINS</div>
                                <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(pts / topPts) * 100}%`, background: color }} />
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="f1-heading text-xl" style={{ color }}>{pts}</div>
                                <div className="f1-mono text-white/30 text-xs">PTS</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
