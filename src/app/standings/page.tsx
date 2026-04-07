'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
  racing_bulls: '#6692FF', kick_sauber: '#52E252',
};
function tc(cid: string) { return TEAM_COLORS[cid] ?? '#888'; }

export default function StandingsPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');

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

  useEffect(() => { load(); }, []);

  const leader = drivers[0];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">LIVE DATA · {season} SEASON</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">CHAMPIONSHIP</span><br />
          <span className="text-[#E10600]">STANDINGS</span>
        </h1>
        <p className="text-white/40 max-w-xl">Live {season} Formula 1 championship standings. Updates automatically after every race weekend.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
          <div className="f1-mono text-white/30">Loading {season} standings...</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex gap-2">
              {(['drivers', 'constructors'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`f1-subheading px-5 py-2 rounded transition-all ${tab === t ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/40 hover:border-white/30'}`}>
                  {t === 'drivers' ? 'DRIVERS' : 'CONSTRUCTORS'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#E10600]/10 border border-[#E10600]/20 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse" />
                <span className="f1-mono text-[#E10600] text-xs">LIVE {season}</span>
              </div>
              <button onClick={load} className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white f1-mono text-xs px-4 py-2 rounded transition-all">
                <RefreshCw size={14} /> REFRESH
              </button>
            </div>
          </div>

          {tab === 'drivers' && (
            <div className="flex flex-col gap-3">
              {drivers.map((s: any, i: number) => {
                const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
                const color = tc(cid);
                const pts = parseFloat(s.points);
                const gap = leader ? parseFloat(leader.points) - pts : 0;
                const barWidth = leader ? (pts / parseFloat(leader.points)) * 100 : 0;
                return (
                  <div key={s.Driver.driverId} className="glass-panel rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
                    style={{ borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="f1-heading text-3xl text-white/20 w-8 flex-shrink-0">{s.position}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="f1-subheading text-white text-lg">{s.Driver.givenName} {s.Driver.familyName}</div>
                          {i === 0 && <span className="f1-mono text-xs px-2 py-0.5 rounded bg-[#E10600] text-white">LEADER</span>}
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
                const topPts = constructors[0] ? parseFloat(constructors[0].points) : 1;
                const barWidth = (pts / topPts) * 100;
                const gap = topPts - pts;
                return (
                  <div key={s.Constructor.constructorId} className="glass-panel rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
                    style={{ borderLeft: `3px solid ${color}` }}>
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
        </>
      )}
    </div>
  );
}
