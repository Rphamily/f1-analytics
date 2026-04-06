'use client';

import { useState, useEffect } from 'react';
import { Race } from '../../lib/api/f1-api';
import { TRACKS } from '../../lib/utils/track-data';
import { MapPin, Clock, Calendar, ChevronRight, Zap } from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2',
  mclaren: '#FF8000', alpine: '#FF87BC', aston_martin: '#229971',
  williams: '#64C4FF', haas: '#B6BABD', sauber: '#52E252',
  rb: '#6692FF', cadillac: '#2C2C2C', audi: '#C0392B',
  racing_bulls: '#6692FF', kick_sauber: '#52E252',
};
function tc(cid: string) { return TEAM_COLORS[cid] ?? '#888'; }

const CIRCUIT_MAP: Record<string, string> = {
  miami: 'miami', albert_park: 'albert_park', bahrain: 'bahrain',
  monaco: 'monaco', silverstone: 'silverstone', monza: 'monza',
  suzuka: 'suzuka', spa: 'spa', interlagos: 'interlagos',
  yas_marina: 'yas_marina', las_vegas: 'las_vegas',
  villeneuve: 'albert_park', catalunya: 'albert_park',
  red_bull_ring: 'albert_park', hungaroring: 'albert_park',
  zandvoort: 'albert_park', baku: 'monaco', marina_bay: 'monaco',
  rodriguez: 'albert_park', americas: 'albert_park', losail: 'bahrain',
  jeddah: 'bahrain', shanghai: 'bahrain', madrid: 'miami',
};

function getTrack(circuitId: string) {
  const key = CIRCUIT_MAP[circuitId] ?? circuitId;
  return TRACKS[key]
    ?? Object.values(TRACKS).find(t => circuitId.includes(t.id) || t.id.includes(circuitId))
    ?? TRACKS.miami;
}

function AnimatedCar({ color, pathId, duration, begin }: { color: string; pathId: string; duration: number; begin: string }) {
  return (
    <g style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}>
      <ellipse cx="0" cy="0" rx="22" ry="8" fill={color} opacity="0.2" />
      <path d="M-18 0 L-14 -5 L10 -5 L16 -2 L18 0 L16 2 L10 5 L-14 5 Z" fill={color} />
      <path d="M-4 -5 L-1 -8 L6 -8 L9 -5" fill={color} opacity="0.6" />
      <rect x="-1" y="-8" width="7" height="3" rx="1" fill="#0a0a0a" opacity="0.8" />
      <path d="M0 -5 Q3 -8 6 -5" stroke="#FFD700" strokeWidth="1" fill="none" />
      <path d="M14 -1 L22 -3 L22 3 L14 1 Z" fill={color} />
      <rect x="-20" y="-5" width="3" height="10" fill={color} />
      <rect x="-22" y="-6" width="5" height="2" fill={color} />
      <rect x="-22" y="4" width="5" height="2" fill={color} />
      <ellipse cx="-10" cy="5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <ellipse cx="8" cy="5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <ellipse cx="-10" cy="-5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <ellipse cx="8" cy="-5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <animateMotion dur={`${duration}s`} begin={begin} repeatCount="indefinite" rotate="auto" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </g>
  );
}

function Countdown({ raceDate }: { raceDate: string }) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(raceDate).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [raceDate]);
  return (
    <div className="flex gap-4">
      {[{ v: t.days, l: 'DAYS' }, { v: t.hours, l: 'HRS' }, { v: t.minutes, l: 'MIN' }, { v: t.seconds, l: 'SEC' }].map(({ v, l }) => (
        <div key={l} className="text-center">
          <div className="f1-heading text-4xl sm:text-6xl text-white tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
          <div className="f1-mono text-[#E10600] text-xs mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}

interface Driver { code: string; name: string; team: string; constructorId: string; color: string; }
interface Props { race: Race | null; }

export default function RaceWeekendHero({ race }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [season, setSeason] = useState('');

  useEffect(() => {
    const year = new Date().getFullYear();
    setSeason(String(year));
    fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`)
      .then(r => r.json())
      .then(json => {
        const standings = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        setDrivers(standings.map((s: any) => {
          const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
          return { code: s.Driver.code ?? s.Driver.driverId.slice(0, 3).toUpperCase(), name: `${s.Driver.givenName} ${s.Driver.familyName}`, team: s.Constructors?.[0]?.name ?? 'Unknown', constructorId: cid, color: tc(cid) };
        }));
      }).catch(console.error);
  }, []);

  const circuitId = race?.Circuit?.circuitId ?? '';
  const track = getTrack(circuitId) ?? TRACKS.miami;
  const pathId = `track-path-${track?.id ?? 'miami'}`;
  const raceDate = race?.date ?? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const raceName = race?.raceName ?? 'Next Grand Prix';
  const circuitName = race?.Circuit?.circuitName ?? 'Circuit';
  const location = race ? `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}` : 'TBC';
  const raceTime = race?.time?.slice(0, 5) ?? '14:00';

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#080808] carbon-texture" />
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(225,6,0,0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(39,244,210,0.05) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-[#E10600] px-3 py-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="f1-mono text-white text-xs font-bold">RACE WEEKEND</span>
          </div>
          <span className="f1-mono text-white/30 text-xs">· {season} FORMULA 1 SEASON</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div>
              <div className="f1-mono text-[#E10600] text-xs mb-2 tracking-widest">NEXT RACE</div>
              <h1 className="f1-heading text-5xl sm:text-7xl leading-none mb-4">
                {raceName.replace(' Grand Prix', '')}<br />
                <span className="text-[#E10600]">GRAND PRIX</span>
              </h1>
              <div className="flex flex-col gap-2 text-white/50">
                <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-[#E10600]" /><span className="f1-mono">{circuitName}</span></div>
                <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-white/30" /><span>{location}</span></div>
                <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-white/30" /><span>{new Date(raceDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-white/30" /><span>{raceTime} UTC</span></div>
              </div>
            </div>
            <div>
              <div className="f1-mono text-white/30 text-xs mb-4 tracking-widest">RACE STARTS IN</div>
              <Countdown raceDate={raceDate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'LENGTH', value: `${track?.length ?? 0} KM` },
                { label: 'LAPS', value: track?.laps ?? 0 },
                { label: 'CORNERS', value: track?.corners ?? 0 },
                { label: 'DRS ZONES', value: track?.drsZones ?? 0 },
                { label: 'TOP SPEED', value: `${track?.topSpeed ?? 0} KPH` },
                { label: 'LAP RECORD', value: track?.lapRecord?.time ?? "--" },
              ].map(s => (
                <div key={s.label} className="glass-panel p-3 rounded-lg">
                  <div className="f1-mono text-white/30 text-xs mb-1">{s.label}</div>
                  <div className="f1-heading text-xl text-white">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/predict" className="flex-1 bg-[#E10600] hover:bg-[#ff0a00] text-white py-3 px-4 rounded flex items-center justify-center gap-2 f1-subheading text-sm transition-colors red-glow"><Zap size={16} /> PREDICT RACE</a>
              <a href="/compare" className="flex-1 border border-white/20 hover:border-white/40 text-white py-3 px-4 rounded flex items-center justify-center gap-2 f1-subheading text-sm transition-colors">COMPARE <ChevronRight size={16} /></a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-square relative">
              <svg viewBox={track?.viewBox ?? "0 0 400 320"} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                <defs><path id={pathId} d={track?.svgPath ?? ""} fill="none" /></defs>
                <path d={track?.svgPath ?? ""} fill="none" stroke="rgba(225,6,0,0.12)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ""} fill="none" stroke="#1c1c1c" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ""} fill="none" stroke="#2a2a2a" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ""} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="6 10" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ""} fill="none" stroke="rgba(39,244,210,0.18)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="35 600" />
                <line x1={(track?.startLine?.x ?? 200) - 11} y1={(track?.startLine?.y ?? 100) + 9} x2={(track?.startLine?.x ?? 200) + 11} y2={(track?.startLine?.y ?? 100) + 9} stroke="white" strokeWidth="3" strokeDasharray="3 3" opacity="0.7" />
                {drivers.slice(0, 12).map((d, i) => (
                  <AnimatedCar key={d.code} color={d.color} pathId={pathId} duration={12 + i * 0.35} begin={`${-(i * (12 / Math.min(drivers.length || 1, 12))).toFixed(2)}s`} />
                ))}
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.03)" fontSize="20" fontFamily="Barlow Condensed" fontWeight="900" letterSpacing="4">{track?.name ?? "".toUpperCase()}</text>
              </svg>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-px bg-white/20" />
              <span className="f1-mono text-white/30 text-xs uppercase tracking-widest">{track?.name ?? ""}</span>
              <div className="w-8 h-px bg-white/20" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-panel rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="f1-subheading text-white/60 text-xs tracking-widest">ON TRACK</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="f1-mono text-green-400 text-xs">{drivers.length > 0 ? `${drivers.length} CARS` : 'LOADING...'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                {drivers.map((d, i) => (
                  <div key={d.code} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                    <div className="f1-mono text-white/30 text-xs w-4">{i + 1}</div>
                    <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}88` }} />
                    <div className="min-w-0">
                      <div className="f1-subheading text-white text-sm">{d.code}</div>
                      <div className="text-white/30 text-xs truncate">{d.team}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="f1-mono text-white/30 text-xs mb-3">{season} GRID</div>
                <div className="grid grid-cols-2 gap-1">
                  {drivers.map((d, i) => (
                    <div key={d.code} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: `${d.color}11`, borderLeft: `2px solid ${d.color}` }}>
                      <span className="f1-mono text-white/30 text-xs w-3">{i + 1}</span>
                      <span className="f1-subheading text-white text-xs">{d.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />
    </div>
  );
}

