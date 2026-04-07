'use client';

import { useState, useEffect, useRef } from 'react';
import { Race } from '../../lib/api/f1-api';
import { TRACKS } from '../../lib/utils/track-data';
import { MapPin, Clock, Calendar, ChevronRight, Zap, Radio } from 'lucide-react';

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

interface LiveDriver {
  code: string; color: string; constructorId: string; team: string;
  number: number; x?: number; y?: number; inPit?: boolean;
  position?: number; gapToLeader?: string;
}

interface SessionInfo {
  isLive: boolean; sessionType: string; sessionKey: number | null;
}

// Map raw OpenF1 X/Y coordinates to SVG viewBox coordinates
function mapToSVG(x: number, y: number, viewBox: string, coordBounds: { minX: number; maxX: number; minY: number; maxY: number }) {
  const parts = viewBox.split(' ').map(Number);
  const [vx, vy, vw, vh] = parts;
  const nx = (x - coordBounds.minX) / (coordBounds.maxX - coordBounds.minX);
  const ny = (y - coordBounds.minY) / (coordBounds.maxY - coordBounds.minY);
  return {
    svgX: vx + nx * vw,
    svgY: vy + (1 - ny) * vh, // flip Y axis
  };
}

function AnimatedCar({ color, pathId, duration, begin, inPit }: { color: string; pathId: string; duration: number; begin: string; inPit?: boolean }) {
  return (
    <g style={{ filter: `drop-shadow(0 0 4px ${color}88)`, opacity: inPit ? 0.4 : 1 }}>
      <ellipse cx="0" cy="0" rx="22" ry="8" fill={color} opacity="0.2" />
      <path d="M-18 0 L-14 -5 L10 -5 L16 -2 L18 0 L16 2 L10 5 L-14 5 Z" fill={color} />
      <path d="M14 -1 L22 -3 L22 3 L14 1 Z" fill={color} />
      <rect x="-20" y="-5" width="3" height="10" fill={color} />
      <ellipse cx="-10" cy="5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <ellipse cx="8" cy="5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <ellipse cx="-10" cy="-5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      <ellipse cx="8" cy="-5" rx="4" ry="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.8" />
      {inPit && <rect x="-22" y="-9" width="44" height="18" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="4 2" rx="2" />}
      <animateMotion dur={`${duration}s`} begin={begin} repeatCount="indefinite" rotate="auto" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </g>
  );
}

function LiveCarDot({ svgX, svgY, color, code, inPit }: { svgX: number; svgY: number; color: string; code: string; inPit?: boolean }) {
  return (
    <g transform={`translate(${svgX}, ${svgY})`} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <circle r="8" fill={color} opacity={inPit ? 0.5 : 1} />
      {inPit && <circle r="10" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="3 2" />}
      <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="6" fontFamily="Share Tech Mono" fontWeight="bold">{code}</text>
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

interface Props { race: Race | null; }

export default function RaceWeekendHero({ race }: Props) {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [season, setSeason] = useState('');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({ isLive: false, sessionType: '', sessionKey: null });
  const [livePositions, setLivePositions] = useState<Record<number, { x: number; y: number; inPit: boolean }>>({});
  const [coordBounds, setCoordBounds] = useState<{ minX: number; maxX: number; minY: number; maxY: number } | null>(null);
  const [liveStatus, setLiveStatus] = useState('');
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const circuitId = race?.Circuit?.circuitId ?? '';
  const track = getTrack(circuitId) ?? TRACKS.miami;
  const pathId = `track-path-${track?.id ?? 'miami'}`;

  // Load driver standings
  useEffect(() => {
    const year = new Date().getFullYear();
    setSeason(String(year));
    fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`)
      .then(r => r.json())
      .then(json => {
        const standings = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        setDrivers(standings.map((s: any) => {
          const cid = s.Constructors?.[0]?.constructorId ?? 'unknown';
          return {
            code: s.Driver.code ?? s.Driver.driverId.slice(0, 3).toUpperCase(),
            color: tc(cid), constructorId: cid,
            team: s.Constructors?.[0]?.name ?? 'Unknown',
            number: parseInt(s.Driver.permanentNumber ?? '0'),
          };
        }));
      }).catch(console.error);
  }, []);

  // Check for live session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('https://api.openf1.org/v1/sessions?session_key=latest');
        const json = await res.json();
        const session = json[0];
        if (!session) return;
        const now = new Date();
        const start = new Date(session.date_start);
        const end = new Date(session.date_end);
        const isLive = now >= start && now <= end;
        setSessionInfo({ isLive, sessionType: session.session_type ?? '', sessionKey: session.session_key });
        if (isLive) setLiveStatus(`LIVE: ${session.session_name}`);
        else setLiveStatus('');
      } catch (e) { /* ignore */ }
    }
    checkSession();
    const id = setInterval(checkSession, 30000);
    return () => clearInterval(id);
  }, []);

  // Poll live positions when session is live
  useEffect(() => {
    if (!sessionInfo.isLive || !sessionInfo.sessionKey) {
      if (pollRef.current) clearInterval(pollRef.current);
      setLivePositions({});
      return;
    }

    async function fetchPositions() {
      try {
        const res = await fetch(`https://api.openf1.org/v1/location?session_key=${sessionInfo.sessionKey}&date>=${new Date(Date.now() - 10000).toISOString()}`);
        const data = await res.json();
        if (!data.length) return;

        // Compute coordinate bounds from all points
        const xs = data.map((d: any) => d.x).filter(Boolean);
        const ys = data.map((d: any) => d.y).filter(Boolean);
        if (xs.length && ys.length) {
          setCoordBounds({
            minX: Math.min(...xs), maxX: Math.max(...xs),
            minY: Math.min(...ys), maxY: Math.max(...ys),
          });
        }

        // Get latest position per driver
        const latest: Record<number, any> = {};
        data.forEach((d: any) => {
          if (!latest[d.driver_number] || d.date > latest[d.driver_number].date) {
            latest[d.driver_number] = d;
          }
        });

        // Check pit status
        const pitRes = await fetch(`https://api.openf1.org/v1/pit?session_key=${sessionInfo.sessionKey}&lap_number>=${1}`);
        const pitData = await pitRes.json();
        const inPitNow = new Set<number>();
        pitData.forEach((p: any) => {
          if (p.pit_out_time === null) inPitNow.add(p.driver_number);
        });

        const newPos: Record<number, { x: number; y: number; inPit: boolean }> = {};
        Object.entries(latest).forEach(([num, d]: [string, any]) => {
          newPos[parseInt(num)] = { x: d.x, y: d.y, inPit: inPitNow.has(parseInt(num)) };
        });
        setLivePositions(newPos);
      } catch (e) { console.error(e); }
    }

    fetchPositions();
    pollRef.current = setInterval(fetchPositions, 3500); // OpenF1 updates at 3.7Hz
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sessionInfo]);

  const raceDate = race?.date ?? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const raceName = race?.raceName ?? 'Next Grand Prix';
  const circuitName = race?.Circuit?.circuitName ?? 'Circuit';
  const location = race ? `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}` : 'TBC';
  const raceTime = race?.time?.slice(0, 5) ?? '14:00';
  const isLive = sessionInfo.isLive && Object.keys(livePositions).length > 0;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#080808] carbon-texture" />
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(225,6,0,0.08) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-2 bg-[#E10600] px-3 py-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="f1-mono text-white text-xs font-bold">RACE WEEKEND</span>
          </div>
          <span className="f1-mono text-white/30 text-xs">· {season} FORMULA 1 SEASON</span>
          {liveStatus && (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1">
              <Radio size={10} className="text-green-400 animate-pulse" />
              <span className="f1-mono text-green-400 text-xs">{liveStatus}</span>
            </div>
          )}
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
                { label: 'LENGTH', value: `${track?.length ?? '?'} KM` },
                { label: 'LAPS', value: track?.laps ?? '?' },
                { label: 'CORNERS', value: track?.corners ?? '?' },
                { label: 'DRS ZONES', value: track?.drsZones ?? '?' },
                { label: 'TOP SPEED', value: `${track?.topSpeed ?? '?'} KPH` },
                { label: 'LAP RECORD', value: track?.lapRecord?.time ?? '--' },
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
              <svg viewBox={track?.viewBox ?? '0 0 400 320'} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                <defs><path id={pathId} d={track?.svgPath ?? ''} fill="none" /></defs>
                <path d={track?.svgPath ?? ''} fill="none" stroke="rgba(225,6,0,0.12)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ''} fill="none" stroke="#1c1c1c" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ''} fill="none" stroke="#2a2a2a" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d={track?.svgPath ?? ''} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="6 10" strokeLinecap="round" strokeLinejoin="round" />
                {isLive && <path d={track?.svgPath ?? ''} fill="none" stroke="rgba(74,222,128,0.2)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Live mode — real GPS positions */}
                {isLive && coordBounds && drivers.map(driver => {
                  const pos = livePositions[driver.number];
                  if (!pos) return null;
                  const { svgX, svgY } = mapToSVG(pos.x, pos.y, track?.viewBox ?? '0 0 400 320', coordBounds);
                  return <LiveCarDot key={driver.code} svgX={svgX} svgY={svgY} color={driver.color} code={driver.code} inPit={pos.inPit} />;
                })}

                {/* Idle mode — animated loop */}
                {!isLive && drivers.slice(0, 12).map((d, i) => (
                  <AnimatedCar key={d.code} color={d.color} pathId={pathId}
                    duration={12 + i * 0.35}
                    begin={`${-(i * (12 / Math.min(drivers.length || 1, 12))).toFixed(2)}s`} />
                ))}

                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.03)" fontSize="20" fontFamily="Barlow Condensed" fontWeight="900" letterSpacing="4">{track?.name?.toUpperCase()}</text>
              </svg>

              {isLive && (
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="f1-mono text-green-400 text-xs">LIVE TRACKING</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-px bg-white/20" />
              <span className="f1-mono text-white/30 text-xs uppercase tracking-widest">{track?.name}</span>
              <div className="w-8 h-px bg-white/20" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-panel rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="f1-subheading text-white/60 text-xs tracking-widest">
                  {isLive ? 'LIVE POSITIONS' : 'ON TRACK'}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLive ? 'bg-green-400' : 'bg-[#E10600]'}`} />
                  <span className={`f1-mono text-xs ${isLive ? 'text-green-400' : 'text-[#E10600]'}`}>
                    {isLive ? sessionInfo.sessionType.toUpperCase() : `${drivers.length} CARS`}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
                {drivers.map((d, i) => {
                  const pos = livePositions[d.number];
                  const inPit = pos?.inPit;
                  return (
                    <div key={d.code} className={`flex items-center gap-3 p-2 rounded transition-colors ${inPit ? 'bg-yellow-500/10 border border-yellow-500/20' : 'hover:bg-white/5'}`}>
                      <div className="f1-mono text-white/30 text-xs w-4">{i + 1}</div>
                      <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}88` }} />
                      <div className="min-w-0 flex-1">
                        <div className="f1-subheading text-white text-sm">{d.code}</div>
                        <div className="text-white/30 text-xs truncate">{d.team}</div>
                      </div>
                      {inPit && <span className="f1-mono text-yellow-400 text-xs flex-shrink-0">PIT</span>}
                    </div>
                  );
                })}
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
