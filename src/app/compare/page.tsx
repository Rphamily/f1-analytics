'use client';

import { useState, useEffect } from 'react';

import { TEAM_COLORS as TEAM_COLOR_MAP } from '../../lib/api/f1-api';
import { TrendingUp, Award } from 'lucide-react';

const ALL_DRIVERS = [
  // Current
  { driverId: 'max_verstappen', name: 'Max Verstappen', era: '2015-present', nationality: 'ðŸ‡³ðŸ‡±', team: 'Red Bull', constructorId: 'red_bull', titles: 4, wins: 62, poles: 40, podiums: 108, fastest: 31, elo: 2120 },
  { driverId: 'norris', name: 'Lando Norris', era: '2019-present', nationality: 'ðŸ‡¬ðŸ‡§', team: 'McLaren', constructorId: 'mclaren', titles: 0, wins: 6, poles: 6, podiums: 25, fastest: 6, elo: 1890 },
  { driverId: 'leclerc', name: 'Charles Leclerc', era: '2018-present', nationality: 'ðŸ‡²ðŸ‡¨', team: 'Ferrari', constructorId: 'ferrari', titles: 0, wins: 8, poles: 24, podiums: 34, fastest: 8, elo: 1920 },
  { driverId: 'hamilton', name: 'Lewis Hamilton', era: '2007-present', nationality: 'ðŸ‡¬ðŸ‡§', team: 'Ferrari', constructorId: 'ferrari', titles: 7, wins: 103, poles: 104, podiums: 201, fastest: 67, elo: 2180 },
  { driverId: 'alonso', name: 'Fernando Alonso', era: '2001-present', nationality: 'ðŸ‡ªðŸ‡¸', team: 'Aston Martin', constructorId: 'aston_martin', titles: 2, wins: 32, poles: 22, podiums: 106, fastest: 23, elo: 2040 },
  { driverId: 'russell', name: 'George Russell', era: '2019-present', nationality: 'ðŸ‡¬ðŸ‡§', team: 'Mercedes', constructorId: 'mercedes', titles: 0, wins: 3, poles: 5, podiums: 14, fastest: 9, elo: 1870 },
  // Legends
  { driverId: 'senna', name: 'Ayrton Senna', era: '1984-1994', nationality: 'ðŸ‡§ðŸ‡·', team: 'McLaren', constructorId: 'mclaren', titles: 3, wins: 41, poles: 65, podiums: 80, fastest: 19, elo: 2100 },
  { driverId: 'schumacher', name: 'Michael Schumacher', era: '1991-2012', nationality: 'ðŸ‡©ðŸ‡ª', team: 'Ferrari', constructorId: 'ferrari', titles: 7, wins: 91, poles: 68, podiums: 155, fastest: 77, elo: 2150 },
  { driverId: 'prost', name: 'Alain Prost', era: '1980-1993', nationality: 'ðŸ‡«ðŸ‡·', team: 'McLaren', constructorId: 'mclaren', titles: 4, wins: 51, poles: 33, podiums: 106, fastest: 41, elo: 2070 },
  { driverId: 'vettel', name: 'Sebastian Vettel', era: '2007-2022', nationality: 'ðŸ‡©ðŸ‡ª', team: 'Red Bull', constructorId: 'red_bull', titles: 4, wins: 53, poles: 57, podiums: 122, fastest: 38, elo: 2050 },
  { driverId: 'lauda', name: 'Niki Lauda', era: '1971-1985', nationality: 'ðŸ‡¦ðŸ‡¹', team: 'Ferrari', constructorId: 'ferrari', titles: 3, wins: 25, poles: 24, podiums: 54, fastest: 24, elo: 2020 },
  { driverId: 'clark', name: 'Jim Clark', era: '1960-1968', nationality: 'ðŸ‡¬ðŸ‡§', team: 'Lotus', constructorId: 'williams', titles: 2, wins: 25, poles: 33, podiums: 32, fastest: 28, elo: 1980 },
];

type DriverData = typeof ALL_DRIVERS[0];

function DriverSelect({ value, onChange, exclude }: { value: DriverData | null; onChange: (d: DriverData) => void; exclude?: string }) {
  const [search, setSearch] = useState('');
  const filtered = ALL_DRIVERS.filter(d =>
    d.driverId !== exclude &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.team.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
      <input
        className="w-full bg-transparent px-4 py-3 text-white placeholder-white/20 f1-mono text-sm border-b border-white/5 outline-none focus:border-[#E10600]/50 transition-colors"
        placeholder="Search driver..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto">
        {filtered.map(driver => {
          const color = TEAM_COLOR_MAP[driver.constructorId] || '#888';
          const isSelected = value?.driverId === driver.driverId;
          return (
            <button
              key={driver.driverId}
              onClick={() => { onChange(driver); setSearch(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${isSelected ? 'bg-[#E10600]/10' : ''}`}
            >
              <div className="w-1 h-8 rounded flex-shrink-0" style={{ background: color }} />
              <div>
                <div className="f1-subheading text-white text-sm">{driver.name}</div>
                <div className="f1-mono text-xs" style={{ color }}>{driver.team} Â· {driver.era}</div>
              </div>
              <div className="ml-auto f1-heading text-xl text-white/20">{driver.elo}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatComparison({ label, v1, v2, color1, color2 }: {
  label: string; v1: number; v2: number; color1: string; color2: string;
}) {
  const max = Math.max(v1, v2);
  const w1 = max ? (v1 / max) * 100 : 0;
  const w2 = max ? (v2 / max) * 100 : 0;

  return (
    <div className="grid grid-cols-[1fr_80px_1fr] gap-2 items-center py-2">
      <div className="flex justify-end">
        <div
          className="h-7 rounded-l flex items-center justify-end px-3 f1-mono text-sm font-bold text-white transition-all"
          style={{ width: `${w1}%`, background: v1 >= v2 ? color1 : `${color1}33`, minWidth: 40 }}
        >
          {v1.toLocaleString()}
        </div>
      </div>
      <div className="text-center f1-mono text-white/30 text-xs">{label}</div>
      <div className="flex">
        <div
          className="h-7 rounded-r flex items-center px-3 f1-mono text-sm font-bold text-white transition-all"
          style={{ width: `${w2}%`, background: v2 >= v1 ? color2 : `${color2}33`, minWidth: 40 }}
        >
          {v2.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [driver1, setDriver1] = useState<DriverData | null>(ALL_DRIVERS[3]); // Hamilton
  const [driver2, setDriver2] = useState<DriverData | null>(ALL_DRIVERS[7]); // Schumacher

  const color1 = driver1 ? (TEAM_COLOR_MAP[driver1.constructorId] || '#E10600') : '#E10600';
  const color2 = driver2 ? (TEAM_COLOR_MAP[driver2.constructorId] || '#3671C6') : '#3671C6';

  const stats = driver1 && driver2 ? [
    { label: 'WORLD TITLES', v1: driver1.titles, v2: driver2.titles },
    { label: 'RACE WINS', v1: driver1.wins, v2: driver2.wins },
    { label: 'POLE POSITIONS', v1: driver1.poles, v2: driver2.poles },
    { label: 'PODIUMS', v1: driver1.podiums, v2: driver2.podiums },
    { label: 'FASTEST LAPS', v1: driver1.fastest, v2: driver2.fastest },
    { label: 'ELO RATING', v1: driver1.elo, v2: driver2.elo },
  ] : [];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">DRIVER COMPARISON</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">COMPARE</span><br />
          <span className="text-[#E10600]">DRIVERS</span>
        </h1>
        <p className="text-white/40 max-w-lg">
          Compare drivers across any era using normalized ELO ratings and career statistics. Current grid vs all-time legends.
        </p>
      </div>

      {/* Driver selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <div className="f1-mono text-xs mb-3" style={{ color: color1 }}>DRIVER 1</div>
          <DriverSelect value={driver1} onChange={setDriver1} exclude={driver2?.driverId} />
        </div>
        <div>
          <div className="f1-mono text-xs mb-3" style={{ color: color2 }}>DRIVER 2</div>
          <DriverSelect value={driver2} onChange={setDriver2} exclude={driver1?.driverId} />
        </div>
      </div>

      {driver1 && driver2 && (
        <>
          {/* Header showdown */}
          <div className="grid grid-cols-3 gap-6 mb-10 text-center">
            <div className="glass-panel rounded-xl p-6 border" style={{ borderColor: `${color1}33` }}>
              <div className="f1-heading text-5xl mb-1" style={{ color: color1 }}>
                {driver1.name.split(' ').pop()}
              </div>
              <div className="text-white/40 text-sm">{driver1.nationality} {driver1.era}</div>
              <div className="f1-mono text-xs mt-2" style={{ color: color1 }}>{driver1.team}</div>
            </div>

            <div className="flex items-center justify-center">
              <div className="f1-heading text-4xl text-white/20">VS</div>
            </div>

            <div className="glass-panel rounded-xl p-6 border" style={{ borderColor: `${color2}33` }}>
              <div className="f1-heading text-5xl mb-1" style={{ color: color2 }}>
                {driver2.name.split(' ').pop()}
              </div>
              <div className="text-white/40 text-sm">{driver2.nationality} {driver2.era}</div>
              <div className="f1-mono text-xs mt-2" style={{ color: color2 }}>{driver2.team}</div>
            </div>
          </div>

          {/* Stats comparison */}
          <div className="glass-panel rounded-xl p-6 border border-white/5 mb-8">
            <h2 className="f1-heading text-2xl text-white mb-6">CAREER STATISTICS</h2>
            {stats.map(s => (
              <StatComparison key={s.label} {...s} color1={color1} color2={color2} />
            ))}
          </div>

          {/* ELO explanation */}
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex gap-3">
            <TrendingUp size={20} className="text-[#E10600] flex-shrink-0 mt-1" />
            <div>
              <div className="f1-subheading text-white text-sm mb-1">ABOUT ELO RATINGS</div>
              <p className="text-white/40 text-xs f1-mono leading-relaxed">
                ELO ratings are calculated using a modified chess-style algorithm that accounts for era difficulty, competition level, and career trajectory. This allows fair comparison between drivers from different generations. Fangio (2200) leads all-time due to era-adjusted dominance.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

