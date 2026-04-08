'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
};
function tc(cid: string) { return TEAM_COLORS[cid] ?? '#888888'; }

const GRID_2026 = [
  { driverId: 'norris', code: 'NOR', firstName: 'Lando', lastName: 'Norris', nat: 'GB', team: 'McLaren', cid: 'mclaren', pace: 95, race: 92, def: 87, con: 91, wet: 90, tyr: 88, ovr: 94, titles: 1, wins: 12, poles: 12, pods: 38, era: '2026' },
  { driverId: 'piastri', code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', nat: 'AU', team: 'McLaren', cid: 'mclaren', pace: 93, race: 89, def: 82, con: 90, wet: 87, tyr: 87, ovr: 91, titles: 0, wins: 5, poles: 4, pods: 22, era: '2026' },
  { driverId: 'leclerc', code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', nat: 'MC', team: 'Ferrari', cid: 'ferrari', pace: 96, race: 89, def: 83, con: 87, wet: 91, tyr: 85, ovr: 92, titles: 0, wins: 8, poles: 24, pods: 34, era: '2026' },
  { driverId: 'hamilton', code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', nat: 'GB', team: 'Ferrari', cid: 'ferrari', pace: 95, race: 98, def: 95, con: 96, wet: 98, tyr: 97, ovr: 97, titles: 7, wins: 103, poles: 104, pods: 201, era: '2026' },
  { driverId: 'verstappen', code: 'VER', firstName: 'Max', lastName: 'Verstappen', nat: 'NL', team: 'Red Bull Racing', cid: 'red_bull', pace: 99, race: 97, def: 91, con: 98, wet: 95, tyr: 92, ovr: 98, titles: 4, wins: 62, poles: 42, pods: 112, era: '2026' },
  { driverId: 'hadjar', code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', nat: 'FR', team: 'Red Bull Racing', cid: 'red_bull', pace: 84, race: 80, def: 74, con: 79, wet: 78, tyr: 76, ovr: 80, titles: 0, wins: 0, poles: 0, pods: 1, era: '2026' },
  { driverId: 'russell', code: 'RUS', firstName: 'George', lastName: 'Russell', nat: 'GB', team: 'Mercedes', cid: 'mercedes', pace: 93, race: 89, def: 85, con: 92, wet: 91, tyr: 89, ovr: 91, titles: 0, wins: 4, poles: 6, pods: 18, era: '2026' },
  { driverId: 'antonelli', code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', nat: 'IT', team: 'Mercedes', cid: 'mercedes', pace: 88, race: 84, def: 78, con: 83, wet: 82, tyr: 80, ovr: 85, titles: 0, wins: 0, poles: 1, pods: 3, era: '2026' },
  { driverId: 'alonso', code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', nat: 'ES', team: 'Aston Martin', cid: 'aston_martin', pace: 93, race: 99, def: 99, con: 96, wet: 96, tyr: 99, ovr: 97, titles: 2, wins: 32, poles: 22, pods: 106, era: '2026' },
  { driverId: 'stroll', code: 'STR', firstName: 'Lance', lastName: 'Stroll', nat: 'CA', team: 'Aston Martin', cid: 'aston_martin', pace: 76, race: 73, def: 70, con: 74, wet: 77, tyr: 75, ovr: 74, titles: 0, wins: 0, poles: 1, pods: 3, era: '2026' },
  { driverId: 'sainz', code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', nat: 'ES', team: 'Williams', cid: 'williams', pace: 89, race: 91, def: 87, con: 93, wet: 89, tyr: 92, ovr: 90, titles: 0, wins: 4, poles: 5, pods: 28, era: '2026' },
  { driverId: 'albon', code: 'ALB', firstName: 'Alexander', lastName: 'Albon', nat: 'TH', team: 'Williams', cid: 'williams', pace: 84, race: 83, def: 81, con: 85, wet: 83, tyr: 82, ovr: 83, titles: 0, wins: 0, poles: 0, pods: 0, era: '2026' },
  { driverId: 'lawson', code: 'LAW', firstName: 'Liam', lastName: 'Lawson', nat: 'NZ', team: 'Racing Bulls', cid: 'rb', pace: 82, race: 80, def: 76, con: 80, wet: 79, tyr: 78, ovr: 80, titles: 0, wins: 0, poles: 0, pods: 0, era: '2026' },
  { driverId: 'lindblad', code: 'LIN', firstName: 'Arvid', lastName: 'Lindblad', nat: 'GB', team: 'Racing Bulls', cid: 'rb', pace: 80, race: 77, def: 72, con: 76, wet: 75, tyr: 74, ovr: 77, titles: 0, wins: 0, poles: 0, pods: 0, era: '2026' },
  { driverId: 'gasly', code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', nat: 'FR', team: 'Alpine', cid: 'alpine', pace: 85, race: 84, def: 80, con: 83, wet: 82, tyr: 81, ovr: 83, titles: 0, wins: 1, poles: 0, pods: 4, era: '2026' },
  { driverId: 'colapinto', code: 'COL', firstName: 'Franco', lastName: 'Colapinto', nat: 'AR', team: 'Alpine', cid: 'alpine', pace: 81, race: 79, def: 75, con: 78, wet: 77, tyr: 76, ovr: 79, titles: 0, wins: 0, poles: 0, pods: 0, era: '2026' },
  { driverId: 'ocon', code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', nat: 'FR', team: 'Haas', cid: 'haas', pace: 83, race: 82, def: 79, con: 82, wet: 81, tyr: 80, ovr: 82, titles: 0, wins: 1, poles: 0, pods: 4, era: '2026' },
  { driverId: 'bearman', code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', nat: 'GB', team: 'Haas', cid: 'haas', pace: 82, race: 79, def: 74, con: 78, wet: 76, tyr: 75, ovr: 79, titles: 0, wins: 0, poles: 0, pods: 0, era: '2026' },
  { driverId: 'hulkenberg', code: 'HUL', firstName: 'Nico', lastName: 'Hulkenberg', nat: 'DE', team: 'Audi', cid: 'audi', pace: 85, race: 84, def: 82, con: 86, wet: 83, tyr: 84, ovr: 84, titles: 0, wins: 0, poles: 1, pods: 1, era: '2026' },
  { driverId: 'bortoleto', code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', nat: 'BR', team: 'Audi', cid: 'audi', pace: 82, race: 79, def: 73, con: 78, wet: 77, tyr: 76, ovr: 79, titles: 0, wins: 0, poles: 0, pods: 0, era: '2026' },
  { driverId: 'bottas', code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', nat: 'FI', team: 'Cadillac', cid: 'cadillac', pace: 84, race: 83, def: 80, con: 84, wet: 82, tyr: 83, ovr: 83, titles: 0, wins: 10, poles: 20, pods: 67, era: '2026' },
  { driverId: 'perez', code: 'PER', firstName: 'Sergio', lastName: 'Perez', nat: 'MX', team: 'Cadillac', cid: 'cadillac', pace: 83, race: 85, def: 83, con: 82, wet: 80, tyr: 86, ovr: 83, titles: 0, wins: 6, poles: 4, pods: 39, era: '2026' },
];

const LEGENDS = [
  { driverId: 'fangio', code: 'FAN', firstName: 'Juan Manuel', lastName: 'Fangio', nat: 'AR', team: 'Mercedes', cid: 'mercedes', pace: 99, race: 100, def: 94, con: 99, wet: 95, tyr: 98, ovr: 100, titles: 5, wins: 24, poles: 29, pods: 35, era: '1950-58', legendary: true },
  { driverId: 'clark', code: 'CLK', firstName: 'Jim', lastName: 'Clark', nat: 'GB', team: 'Lotus', cid: 'williams', pace: 98, race: 96, def: 88, con: 94, wet: 96, tyr: 90, ovr: 97, titles: 2, wins: 25, poles: 33, pods: 32, era: '1960-68', legendary: true },
  { driverId: 'lauda', code: 'LAU', firstName: 'Niki', lastName: 'Lauda', nat: 'AT', team: 'Ferrari', cid: 'ferrari', pace: 92, race: 95, def: 88, con: 97, wet: 85, tyr: 96, ovr: 94, titles: 3, wins: 25, poles: 24, pods: 54, era: '1971-85', legendary: true },
  { driverId: 'prost', code: 'PRO', firstName: 'Alain', lastName: 'Prost', nat: 'FR', team: 'McLaren', cid: 'mclaren', pace: 94, race: 99, def: 96, con: 99, wet: 88, tyr: 100, ovr: 98, titles: 4, wins: 51, poles: 33, pods: 106, era: '1980-93', legendary: true },
  { driverId: 'senna', code: 'SEN', firstName: 'Ayrton', lastName: 'Senna', nat: 'BR', team: 'McLaren', cid: 'mclaren', pace: 100, race: 97, def: 90, con: 91, wet: 100, tyr: 88, ovr: 98, titles: 3, wins: 41, poles: 65, pods: 80, era: '1984-94', legendary: true },
  { driverId: 'schumacher', code: 'SCH', firstName: 'Michael', lastName: 'Schumacher', nat: 'DE', team: 'Ferrari', cid: 'ferrari', pace: 97, race: 99, def: 95, con: 99, wet: 97, tyr: 98, ovr: 99, titles: 7, wins: 91, poles: 68, pods: 155, era: '1991-12', legendary: true },
  { driverId: 'alonso_l', code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', nat: 'ES', team: 'Renault', cid: 'alpine', pace: 93, race: 99, def: 99, con: 96, wet: 96, tyr: 99, ovr: 97, titles: 2, wins: 32, poles: 22, pods: 106, era: '2001-24', legendary: true },
  { driverId: 'vettel_l', code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', nat: 'DE', team: 'Red Bull', cid: 'red_bull', pace: 95, race: 94, def: 88, con: 96, wet: 90, tyr: 95, ovr: 95, titles: 4, wins: 53, poles: 57, pods: 122, era: '2007-22', legendary: true },
  { driverId: 'hamilton_l', code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', nat: 'GB', team: 'Mercedes', cid: 'mercedes', pace: 97, race: 99, def: 96, con: 97, wet: 99, tyr: 98, ovr: 99, titles: 7, wins: 103, poles: 104, pods: 201, era: '2007-25', legendary: true },
];

type Card = typeof GRID_2026[0] & { legendary?: boolean };

const FLAG_MAP: Record<string, string> = {
  GB: 'GB', NL: 'NL', MC: 'MC', ES: 'ES', AU: 'AU', DE: 'DE', FI: 'FI',
  FR: 'FR', MX: 'MX', CA: 'CA', TH: 'TH', IT: 'IT', BR: 'BR', AR: 'AR',
  US: 'US', JP: 'JP', CN: 'CN', DK: 'DK', AT: 'AT', NZ: 'NZ',
};

function natToFlag(nat: string) {
  return `https://flagcdn.com/24x18/${(FLAG_MAP[nat] ?? nat).toLowerCase()}.png`;
}

function nationalityToFlag(nat: string): string {
  const map: Record<string, string> = {
    British: 'GB', Dutch: 'NL', Spanish: 'ES', Australian: 'AU',
    German: 'DE', Finnish: 'FI', French: 'FR', Mexican: 'MX', Canadian: 'CA',
    Thai: 'TH', Italian: 'IT', Brazilian: 'BR', Argentine: 'AR', American: 'US',
    Japanese: 'JP', Chinese: 'CN', Danish: 'DK', Austrian: 'AT', 'New Zealander': 'NZ',
  };
  return map[nat] ?? 'GB';
}

function buildCard(s: any, season: string): Card {
  const d = s.Driver; const c = s.Constructors?.[0];
  const pos = parseInt(s.position ?? '10');
  const base = Math.max(60, 100 - pos * 2);
  const wins = parseInt(s.wins ?? '0');
  return {
    driverId: d.driverId, code: d.code ?? d.driverId.slice(0, 3).toUpperCase(),
    firstName: d.givenName, lastName: d.familyName,
    nat: nationalityToFlag(d.nationality),
    team: c?.name ?? 'Unknown', cid: c?.constructorId ?? 'unknown',
    pace: Math.min(99, base + (wins > 0 ? 8 : 0)), race: Math.min(99, base + 3),
    def: Math.min(99, base - 2), con: Math.min(99, base + 5),
    wet: Math.min(99, base), tyr: Math.min(99, base + 2),
    ovr: Math.min(99, base + 4), titles: 0, wins, poles: 0, pods: 0, era: season,
  };
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-11 h-11">
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(value / 100) * 125.6} 125.6`} strokeLinecap="round"
            transform="rotate(-90 24 24)" style={{ transition: 'stroke-dasharray 1s ease' }} />
          <text x="24" y="29" textAnchor="middle" fill="white" fontSize="11" fontFamily="Barlow Condensed" fontWeight="700">{value}</text>
        </svg>
      </div>
      <span className="f1-mono text-white/25 text-xs">{label}</span>
    </div>
  );
}

function DriverCard({ d, onSelect, selected, headshot }: { d: Card; onSelect: (d: Card) => void; selected: boolean; headshot?: string }) {
  const color = tc(d.cid);
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className={`driver-card rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${selected ? 'ring-2 ring-[#E10600] scale-105' : ''}`}
      style={{ boxShadow: selected ? `0 0 24px ${color}55` : '0 6px 24px rgba(0,0,0,0.5)' }}
      onClick={() => onSelect(d)}>
      <div className="relative rounded-t-2xl p-3 pt-5 pb-6" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11, transparent)`, borderBottom: `1px solid ${color}22` }}>
        {d.legendary && <div className="absolute top-2 right-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-2 py-0.5"><span className="f1-mono text-yellow-400 text-xs">LEGEND</span></div>}
        <div className="absolute top-2 left-2">
          <div className="f1-heading text-4xl leading-none" style={{ color }}>{d.ovr}</div>
          <div className="f1-mono text-white/30 text-xs">{d.era}</div>
        </div>
        <div className="w-16 h-20 mx-auto rounded-lg overflow-hidden mt-4 relative flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}22` }}>
          {headshot && !imgFailed ? (
            <img src={headshot} alt={d.code} className="w-full h-full object-cover object-top"
              onError={() => setImgFailed(true)} />
          ) : (
            <div className="f1-heading text-2xl" style={{ color }}>{d.code}</div>
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="text-center mb-1">
          <div className="f1-heading text-xl text-white leading-tight">{d.firstName}</div>
          <div className="f1-heading text-xl leading-tight truncate" style={{ color }}>{d.lastName.toUpperCase()}</div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <img src={natToFlag(d.nat)} alt={d.nat} className="w-5 h-4 object-cover rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs f1-mono truncate max-w-20">{d.team}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <Stat value={d.pace} label="PCE" color={color} />
          <Stat value={d.race} label="RAC" color={color} />
          <Stat value={d.def} label="DEF" color={color} />
          <Stat value={d.con} label="CON" color={color} />
          <Stat value={d.wet} label="WET" color={color} />
          <Stat value={d.tyr} label="TYR" color={color} />
        </div>
        <div className="grid grid-cols-3 gap-1 pt-2 border-t" style={{ borderColor: `${color}22` }}>
          {[{ l: 'WC', v: d.titles }, { l: 'WIN', v: d.wins }, { l: 'POL', v: d.poles }].map(({ l, v }) => (
            <div key={l} className="text-center">
              <div className="f1-heading text-lg text-white">{v}</div>
              <div className="f1-mono text-white/25 text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-1 rounded-b-2xl" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </div>
  );
}

function CompareModal({ d1, d2, onClose, headshotMap }: { d1: Card; d2: Card; onClose: () => void; headshotMap: Record<string, string> }) {
  const c1 = tc(d1.cid); const c2 = tc(d2.cid);
  const stats = [{ k: 'pace', l: 'PACE' }, { k: 'race', l: 'RACECRAFT' }, { k: 'def', l: 'DEFENSE' }, { k: 'con', l: 'CONSISTENCY' }, { k: 'wet', l: 'WET WEATHER' }, { k: 'tyr', l: 'TYRE MGMT' }] as const;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="f1-heading text-3xl text-white">HEAD TO HEAD</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl">x</button>
          </div>
          <div className="grid grid-cols-3 mb-6 text-center">
            <div>
              {headshotMap[d1.code] && <img src={headshotMap[d1.code]} alt={d1.code} className="w-16 h-20 object-cover object-top rounded-lg mx-auto mb-2" style={{ border: `2px solid ${c1}` }} />}
              <div className="f1-heading text-3xl" style={{ color: c1 }}>{d1.code}</div>
              <div className="text-white/50 text-sm">{d1.firstName} {d1.lastName}</div>
              <div className="f1-mono text-xs mt-1" style={{ color: c1 }}>{d1.team}</div>
            </div>
            <div className="flex items-center justify-center f1-heading text-2xl text-white/20">VS</div>
            <div>
              {headshotMap[d2.code] && <img src={headshotMap[d2.code]} alt={d2.code} className="w-16 h-20 object-cover object-top rounded-lg mx-auto mb-2" style={{ border: `2px solid ${c2}` }} />}
              <div className="f1-heading text-3xl" style={{ color: c2 }}>{d2.code}</div>
              <div className="text-white/50 text-sm">{d2.firstName} {d2.lastName}</div>
              <div className="f1-mono text-xs mt-1" style={{ color: c2 }}>{d2.team}</div>
            </div>
          </div>
          {stats.map(({ k, l }) => {
            const v1 = d1[k] as number, v2 = d2[k] as number;
            return (
              <div key={k} className="mb-3">
                <div className="text-center f1-mono text-white/30 text-xs mb-1">{l}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex justify-end"><div className="h-6 rounded-l flex items-center justify-end px-2 f1-mono text-xs text-white font-bold" style={{ width: `${v1}%`, background: v1 >= v2 ? c1 : `${c1}44`, minWidth: 36 }}>{v1}</div></div>
                  <div className="flex-1"><div className="h-6 rounded-r flex items-center px-2 f1-mono text-xs text-white font-bold" style={{ width: `${v2}%`, background: v2 >= v1 ? c2 : `${c2}44`, minWidth: 36 }}>{v2}</div></div>
                </div>
              </div>
            );
          })}
          <div className="grid grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
            {[{ l: 'TITLES', k: 'titles' }, { l: 'WINS', k: 'wins' }, { l: 'POLES', k: 'poles' }, { l: 'PODS', k: 'pods' }, { l: 'OVR', k: 'ovr' }].map(({ l, k }) => {
              const v1 = d1[k as keyof Card] as number; const v2 = d2[k as keyof Card] as number;
              return (
                <div key={k} className="text-center">
                  <div className="f1-mono text-white/30 text-xs mb-1">{l}</div>
                  <div className="flex justify-around">
                    <span className="f1-heading text-lg" style={{ color: v1 >= v2 ? c1 : 'rgba(255,255,255,0.25)' }}>{v1}</span>
                    <span className="text-white/20 text-xs self-center">-</span>
                    <span className="f1-heading text-lg" style={{ color: v2 >= v1 ? c2 : 'rgba(255,255,255,0.25)' }}>{v2}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const [tab, setTab] = useState<'current' | 'year' | 'legends'>('current');
  const [yearInput, setYearInput] = useState('2024');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearCards, setYearCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState<Card[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  useEffect(() => {
  const year = new Date().getFullYear();
  fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`)
    .then(r => r.json())
    .then(json => {
      const standings = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
      standings.forEach((s: any) => {
        const id = s.Driver.driverId;
        const card = GRID_2026.find(d => d.driverId === id);
        if (card) {
          card.wins = parseInt(s.wins) || card.wins;
          card.team = s.Constructors?.[0]?.name ?? card.team;
          card.cid = s.Constructors?.[0]?.constructorId ?? card.cid;
        }
      });
    })
    .catch(() => {});
}, []);
  const [headshotMap, setHeadshotMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('https://api.openf1.org/v1/drivers?session_key=latest')
      .then(r => r.json())
      .then((drivers: any[]) => {
        const map: Record<string, string> = {};
        drivers.forEach(d => {
          if (d.name_acronym && d.headshot_url) {
            map[d.name_acronym] = d.headshot_url;
          }
        });
        setHeadshotMap(map);
      })
      .catch(console.error);
  }, []);

  const fetchYear = useCallback(async (year: number) => {
    setLoading(true); setError(''); setYearCards([]);
    try {
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      const standings = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
      if (!standings.length) throw new Error(`No data for ${year}`);
      setYearCards(standings.map((s: any) => buildCard(s, String(year))));
      setSelectedYear(year);
    } catch (e: any) { setError(e.message ?? 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const handleSearch = () => {
    const y = parseInt(yearInput);
    if (isNaN(y) || y < 1950 || y > 2030) { setError('Enter a year between 1950 and 2030'); return; }
    fetchYear(y);
  };

  const handleSelect = (d: Card) => setSel(prev => {
    if (prev.find(x => x.driverId === d.driverId)) return prev.filter(x => x.driverId !== d.driverId);
    if (prev.length >= 2) return [prev[1], d];
    return [...prev, d];
  });

  const active: Card[] = tab === 'current' ? GRID_2026 : tab === 'legends' ? LEGENDS : yearCards;
  const filtered = search ? active.filter(d => `${d.firstName} ${d.lastName} ${d.code} ${d.team}`.toLowerCase().includes(search.toLowerCase())) : active;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">DRIVER CARDS</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-3"><span className="text-white">DRIVER</span><br /><span className="text-[#E10600]">CARDS</span></h1>
        <p className="text-white/40 max-w-xl">FIFA-style cards for every F1 driver from 1950 to present. Search any season, compare across eras.</p>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        {[{ key: 'current', label: '2026 GRID (22)' }, { key: 'year', label: 'SEARCH BY YEAR' }, { key: 'legends', label: 'LEGENDS' }].map(({ key, label }) => (
          <button key={key} onClick={() => { setTab(key as any); setSearch(''); setError(''); }}
            className={`f1-subheading px-5 py-2 rounded transition-all ${tab === key ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/40 hover:border-white/30'}`}>{label}</button>
        ))}
      </div>
      {tab === 'year' && (
        <div className="glass-panel rounded-xl p-5 border border-white/5 mb-8">
          <div className="f1-mono text-white/40 text-xs mb-3 tracking-widest">SELECT A SEASON (1950-PRESENT)</div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex gap-2">
              <input type="number" min={1950} max={2030} value={yearInput} onChange={e => setYearInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white f1-mono text-sm w-28 outline-none focus:border-[#E10600]/50 transition-colors" placeholder="2024" />
              <button onClick={handleSearch} className="bg-[#E10600] hover:bg-red-700 text-white f1-subheading text-sm px-5 py-2.5 rounded transition-colors flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} LOAD
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[2026, 2024, 2023, 2021, 2016, 2012, 2010, 2008, 2004, 2000, 1994, 1988, 1984, 1976, 1970, 1960, 1950].map(y => (
                <button key={y} onClick={() => { setYearInput(String(y)); fetchYear(y); }}
                  className={`f1-mono text-xs px-3 py-1.5 rounded border transition-all ${selectedYear === y ? 'bg-[#E10600]/20 border-[#E10600]/40 text-[#E10600]' : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white'}`}>{y}</button>
              ))}
            </div>
          </div>
          {error && <div className="mt-3 text-[#E10600] f1-mono text-xs">{error}</div>}
          {selectedYear && !loading && yearCards.length > 0 && <div className="mt-3 f1-mono text-white/30 text-xs">Showing {yearCards.length} drivers from {selectedYear}</div>}
        </div>
      )}
      {active.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-white/20 f1-mono text-sm outline-none focus:border-[#E10600]/50 transition-colors"
            placeholder="Search driver or team..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}
      {sel.length === 2 && (
        <div className="mb-6 flex items-center gap-4 p-4 bg-[#E10600]/10 border border-[#E10600]/30 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="f1-heading text-xl" style={{ color: tc(sel[0].cid) }}>{sel[0].code}</span>
            <span className="f1-mono text-white/30 text-sm">vs</span>
            <span className="f1-heading text-xl" style={{ color: tc(sel[1].cid) }}>{sel[1].code}</span>
          </div>
          <button onClick={() => setShowCompare(true)} className="ml-auto bg-[#E10600] text-white f1-subheading text-sm px-6 py-2 rounded hover:bg-red-700 transition-colors">COMPARE</button>
          <button onClick={() => setSel([])} className="text-white/30 hover:text-white text-lg">x</button>
        </div>
      )}
      {loading && <div className="flex flex-col items-center justify-center py-24"><div className="w-12 h-12 border-2 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin mb-4" /><div className="f1-mono text-white/30 text-sm">Loading {yearInput} season...</div></div>}
      {tab === 'year' && !loading && yearCards.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🏁</div>
          <div className="f1-heading text-3xl text-white/20 mb-2">SELECT A SEASON</div>
          <div className="f1-mono text-white/20 text-sm">Enter any year from 1950 to present above</div>
        </div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(d => (
            <DriverCard
              key={`${d.driverId}-${d.era}`}
              d={d}
              onSelect={handleSelect}
              selected={!!sel.find(x => x.driverId === d.driverId)}
              headshot={headshotMap[d.code]}
            />
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && active.length > 0 && <div className="text-center py-16 text-white/20 f1-mono">No drivers match "{search}"</div>}
      {showCompare && sel.length === 2 && (
        <CompareModal d1={sel[0]} d2={sel[1]} onClose={() => setShowCompare(false)} headshotMap={headshotMap} />
      )}
    </div>
  );
}

