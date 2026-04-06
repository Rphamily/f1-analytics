'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StandingsEntry, TEAM_COLORS } from '../../lib/api/f1-api';
import { Trophy, TrendingUp } from 'lucide-react';

interface Props {
  standings: StandingsEntry[];
}

const DRIVER_NUMBERS: Record<string, string> = {
  max_verstappen: '1', norris: '4', leclerc: '16', hamilton: '44',
  russell: '63', sainz: '55', antonelli: '12', alonso: '14',
  stroll: '18', piastri: '81', tsunoda: '22', hulkenberg: '27',
  lawson: '30', albon: '23', gasly: '10', ocon: '31',
  bearman: '87', doohan: '7', hadjar: '6', bortoleto: '5',
};

function DriverCard({ entry, rank }: { entry: StandingsEntry; rank: number }) {
  const [hovered, setHovered] = useState(false);
  const constructorId = entry.Constructors[0]?.constructorId || '';
  const teamColor = TEAM_COLORS[constructorId] || '#888888';
  const driverNum = DRIVER_NUMBERS[entry.Driver.driverId] || entry.Driver.permanentNumber;
  const isLeader = rank === 1;

  return (
    <Link href={`/driver/${entry.Driver.driverId}`}>
      <div
        className={`relative flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden group ${
          isLeader ? 'border border-[#FFD700]/20' : 'border border-white/5 hover:border-white/15'
        }`}
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${teamColor}15, ${teamColor}08, transparent)`
            : `linear-gradient(135deg, ${teamColor}08, transparent)`,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Pos number background */}
        <div className="grid-pos">{rank}</div>

        {/* Team color indicator */}
        <div
          className="w-1 h-14 rounded-full flex-shrink-0"
          style={{
            background: teamColor,
            boxShadow: hovered ? `0 0 12px ${teamColor}88` : 'none',
            transition: 'box-shadow 0.3s',
          }}
        />

        {/* Position */}
        <div className="w-8 text-center flex-shrink-0">
          {isLeader ? (
            <Trophy size={20} className="text-[#FFD700] mx-auto" />
          ) : (
            <span className="f1-heading text-2xl text-white/40">{rank}</span>
          )}
        </div>

        {/* Driver number */}
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 f1-heading text-lg"
          style={{ background: `${teamColor}22`, color: teamColor, border: `1px solid ${teamColor}33` }}
        >
          {driverNum}
        </div>

        {/* Driver info */}
        <div className="flex-1 min-w-0">
          <div className="f1-subheading text-white text-base leading-tight group-hover:text-[#E10600] transition-colors">
            {entry.Driver.givenName} {entry.Driver.familyName}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs f1-mono font-medium"
              style={{ color: teamColor }}
            >
              {entry.Constructors[0]?.name || '—'}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/30 text-xs">{entry.Driver.nationality}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="f1-mono text-white/30 text-xs">WINS</div>
            <div className="f1-heading text-xl text-white">{entry.wins}</div>
          </div>
          <div className="text-right">
            <div className="f1-mono text-white/30 text-xs">PTS</div>
            <div className="f1-heading text-2xl" style={{ color: isLeader ? '#FFD700' : 'white' }}>
              {entry.points}
            </div>
          </div>
        </div>

        {/* Points bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${(parseFloat(entry.points) / 400) * 100}%`,
              background: `linear-gradient(90deg, ${teamColor}, ${teamColor}44)`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

// Fallback driver grid if API fails
const FALLBACK_DRIVERS = [
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing', color: '#3671C6', pts: 437, wins: 19, pos: 1 },
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8000', pts: 374, wins: 6, pos: 2 },
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#E8002D', pts: 356, wins: 3, pos: 3 },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8000', pts: 292, wins: 2, pos: 4 },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#E8002D', pts: 290, wins: 2, pos: 5 },
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#27F4D2', pts: 245, wins: 2, pos: 6 },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#27F4D2', pts: 211, wins: 2, pos: 7 },
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#229971', pts: 72, wins: 0, pos: 8 },
  { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', color: '#229971', pts: 42, wins: 0, pos: 9 },
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', color: '#6692FF', pts: 30, wins: 0, pos: 10 },
];

export default function DriverGrid({ standings }: Props) {
  const [filter, setFilter] = useState<string>('all');

  if (!standings || standings.length === 0) {
    // Render fallback
    return (
      <div>
        <div className="flex items-center gap-2 mb-4 text-amber-400/60 text-sm">
          <TrendingUp size={14} />
          <span>Showing estimated standings — live data loading...</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {FALLBACK_DRIVERS.map((d) => (
            <Link key={d.code} href={`/driver/${d.code.toLowerCase()}`}>
              <div
                className="relative flex items-center gap-4 p-4 rounded-lg border border-white/5 hover:border-white/15 cursor-pointer transition-all overflow-hidden group"
                style={{ background: `${d.color}08` }}
              >
                <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <div className="w-8 flex-shrink-0 f1-heading text-2xl text-white/40">{d.pos}</div>
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 f1-heading text-sm"
                  style={{ background: `${d.color}22`, color: d.color }}
                >
                  {d.code}
                </div>
                <div className="flex-1">
                  <div className="f1-subheading text-white text-base group-hover:text-[#E10600] transition-colors">{d.name}</div>
                  <div className="text-xs f1-mono" style={{ color: d.color }}>{d.team}</div>
                </div>
                <div className="text-right">
                  <div className="f1-mono text-white/30 text-xs">PTS</div>
                  <div className="f1-heading text-2xl text-white">{d.pts}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Get unique teams
  const teams = Array.from(new Set(standings.map(s => s.Constructors[0]?.constructorId))).filter(Boolean);

  const filtered = filter === 'all' ? standings : standings.filter(s => s.Constructors[0]?.constructorId === filter);

  return (
    <div>
      {/* Team filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          className={`flex-shrink-0 px-4 py-1.5 rounded-full f1-mono text-xs transition-all ${
            filter === 'all' ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/40 hover:border-white/30'
          }`}
          onClick={() => setFilter('all')}
        >
          ALL
        </button>
        {teams.map(team => {
          const color = TEAM_COLORS[team] || '#888';
          return (
            <button
              key={team}
              className="flex-shrink-0 px-4 py-1.5 rounded-full f1-mono text-xs transition-all border"
              style={filter === team
                ? { background: color, borderColor: color, color: 'white' }
                : { borderColor: `${color}44`, color: `${color}88` }
              }
              onClick={() => setFilter(team)}
            >
              {team.replace('_', ' ').toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((entry) => (
          <DriverCard
            key={entry.Driver.driverId}
            entry={entry}
            rank={parseInt(entry.position)}
          />
        ))}
      </div>
    </div>
  );
}
