'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StandingsEntry, TEAM_COLORS } from '../../lib/api/f1-api';
import { Trophy } from 'lucide-react';

// Fallback 2024 standings data
const FALLBACK: StandingsEntry[] = [
  { position: '1', points: '437', wins: '9', Driver: { driverId: 'max_verstappen', code: 'VER', givenName: 'Max', familyName: 'Verstappen', permanentNumber: '1', nationality: 'Dutch' }, Constructors: [{ constructorId: 'red_bull', name: 'Red Bull Racing' }] },
  { position: '2', points: '374', wins: '6', Driver: { driverId: 'norris', code: 'NOR', givenName: 'Lando', familyName: 'Norris', permanentNumber: '4', nationality: 'British' }, Constructors: [{ constructorId: 'mclaren', name: 'McLaren' }] },
  { position: '3', points: '356', wins: '3', Driver: { driverId: 'leclerc', code: 'LEC', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', nationality: 'Monégasque' }, Constructors: [{ constructorId: 'ferrari', name: 'Ferrari' }] },
  { position: '4', points: '292', wins: '2', Driver: { driverId: 'piastri', code: 'PIA', givenName: 'Oscar', familyName: 'Piastri', permanentNumber: '81', nationality: 'Australian' }, Constructors: [{ constructorId: 'mclaren', name: 'McLaren' }] },
  { position: '5', points: '290', wins: '2', Driver: { driverId: 'sainz', code: 'SAI', givenName: 'Carlos', familyName: 'Sainz', permanentNumber: '55', nationality: 'Spanish' }, Constructors: [{ constructorId: 'ferrari', name: 'Ferrari' }] },
  { position: '6', points: '245', wins: '2', Driver: { driverId: 'russell', code: 'RUS', givenName: 'George', familyName: 'Russell', permanentNumber: '63', nationality: 'British' }, Constructors: [{ constructorId: 'mercedes', name: 'Mercedes' }] },
  { position: '7', points: '211', wins: '2', Driver: { driverId: 'hamilton', code: 'HAM', givenName: 'Lewis', familyName: 'Hamilton', permanentNumber: '44', nationality: 'British' }, Constructors: [{ constructorId: 'mercedes', name: 'Mercedes' }] },
  { position: '8', points: '72', wins: '0', Driver: { driverId: 'alonso', code: 'ALO', givenName: 'Fernando', familyName: 'Alonso', permanentNumber: '14', nationality: 'Spanish' }, Constructors: [{ constructorId: 'aston_martin', name: 'Aston Martin' }] },
  { position: '9', points: '42', wins: '0', Driver: { driverId: 'stroll', code: 'STR', givenName: 'Lance', familyName: 'Stroll', permanentNumber: '18', nationality: 'Canadian' }, Constructors: [{ constructorId: 'aston_martin', name: 'Aston Martin' }] },
  { position: '10', points: '30', wins: '0', Driver: { driverId: 'tsunoda', code: 'TSU', givenName: 'Yuki', familyName: 'Tsunoda', permanentNumber: '22', nationality: 'Japanese' }, Constructors: [{ constructorId: 'rb', name: 'RB' }] },
  { position: '11', points: '24', wins: '0', Driver: { driverId: 'hulkenberg', code: 'HUL', givenName: 'Nico', familyName: 'Hulkenberg', permanentNumber: '27', nationality: 'German' }, Constructors: [{ constructorId: 'haas', name: 'Haas F1 Team' }] },
  { position: '12', points: '22', wins: '0', Driver: { driverId: 'ricciardo', code: 'RIC', givenName: 'Daniel', familyName: 'Ricciardo', permanentNumber: '3', nationality: 'Australian' }, Constructors: [{ constructorId: 'rb', name: 'RB' }] },
  { position: '13', points: '19', wins: '0', Driver: { driverId: 'gasly', code: 'GAS', givenName: 'Pierre', familyName: 'Gasly', permanentNumber: '10', nationality: 'French' }, Constructors: [{ constructorId: 'alpine', name: 'Alpine F1 Team' }] },
  { position: '14', points: '17', wins: '0', Driver: { driverId: 'albon', code: 'ALB', givenName: 'Alexander', familyName: 'Albon', permanentNumber: '23', nationality: 'Thai' }, Constructors: [{ constructorId: 'williams', name: 'Williams' }] },
  { position: '15', points: '14', wins: '0', Driver: { driverId: 'ocon', code: 'OCO', givenName: 'Esteban', familyName: 'Ocon', permanentNumber: '31', nationality: 'French' }, Constructors: [{ constructorId: 'alpine', name: 'Alpine F1 Team' }] },
  { position: '16', points: '11', wins: '0', Driver: { driverId: 'magnussen', code: 'MAG', givenName: 'Kevin', familyName: 'Magnussen', permanentNumber: '20', nationality: 'Danish' }, Constructors: [{ constructorId: 'haas', name: 'Haas F1 Team' }] },
  { position: '17', points: '6', wins: '0', Driver: { driverId: 'bottas', code: 'BOT', givenName: 'Valtteri', familyName: 'Bottas', permanentNumber: '77', nationality: 'Finnish' }, Constructors: [{ constructorId: 'sauber', name: 'Sauber' }] },
  { position: '18', points: '6', wins: '0', Driver: { driverId: 'colapinto', code: 'COL', givenName: 'Franco', familyName: 'Colapinto', permanentNumber: '43', nationality: 'Argentine' }, Constructors: [{ constructorId: 'williams', name: 'Williams' }] },
  { position: '19', points: '4', wins: '0', Driver: { driverId: 'zhou', code: 'ZHO', givenName: 'Guanyu', familyName: 'Zhou', permanentNumber: '24', nationality: 'Chinese' }, Constructors: [{ constructorId: 'sauber', name: 'Sauber' }] },
  { position: '20', points: '0', wins: '0', Driver: { driverId: 'sargeant', code: 'SAR', givenName: 'Logan', familyName: 'Sargeant', permanentNumber: '2', nationality: 'American' }, Constructors: [{ constructorId: 'williams', name: 'Williams' }] },
];

const CONSTRUCTOR_STANDINGS = [
  { name: 'McLaren', constructorId: 'mclaren', points: 666 },
  { name: 'Ferrari', constructorId: 'ferrari', points: 652 },
  { name: 'Red Bull Racing', constructorId: 'red_bull', points: 589 },
  { name: 'Mercedes', constructorId: 'mercedes', points: 468 },
  { name: 'Aston Martin', constructorId: 'aston_martin', points: 94 },
  { name: 'Haas', constructorId: 'haas', points: 58 },
  { name: 'Alpine', constructorId: 'alpine', points: 49 },
  { name: 'RB', constructorId: 'rb', points: 46 },
  { name: 'Williams', constructorId: 'williams', points: 17 },
  { name: 'Sauber', constructorId: 'sauber', points: 4 },
];

interface Props {
  standings: StandingsEntry[];
}

export default function StandingsClient({ standings }: Props) {
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');
  const data = standings.length ? standings : FALLBACK;
  const maxPoints = Math.max(...data.map(s => parseFloat(s.points)));

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">2025 SEASON</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">CHAMPIONSHIP</span><br />
          <span className="text-[#E10600]">STANDINGS</span>
        </h1>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-8">
        {(['drivers', 'constructors'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`f1-subheading px-8 py-3 rounded transition-all ${
              tab === t ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/40 hover:border-white/30'
            }`}
          >
            {t === 'drivers' ? 'DRIVERS' : 'CONSTRUCTORS'}
          </button>
        ))}
      </div>

      {tab === 'drivers' && (
        <div className="flex flex-col gap-2">
          {data.map((entry, i) => {
            const color = TEAM_COLORS[entry.Constructors[0]?.constructorId] || '#888';
            const pts = parseFloat(entry.points);
            const barWidth = (pts / maxPoints) * 100;
            const isLeader = i === 0;

            return (
              <Link key={entry.Driver.driverId} href={`/driver/${entry.Driver.driverId}`}>
                <div
                  className="relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer group transition-all hover:-translate-x-1"
                  style={{
                    background: `linear-gradient(90deg, ${color}0a, transparent)`,
                    borderColor: isLeader ? `${color}44` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Points bar background */}
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-xl opacity-5 transition-all group-hover:opacity-10"
                    style={{ width: `${barWidth}%`, background: color }}
                  />

                  {/* Rank */}
                  <div className="relative z-10 w-10 text-center flex-shrink-0">
                    {isLeader
                      ? <Trophy size={20} className="text-[#FFD700] mx-auto" />
                      : <span className="f1-heading text-2xl text-white/30">{entry.position}</span>
                    }
                  </div>

                  {/* Color bar */}
                  <div className="relative z-10 w-1 h-12 rounded flex-shrink-0" style={{ background: color }} />

                  {/* Driver number */}
                  <div
                    className="relative z-10 w-10 h-10 rounded flex items-center justify-center f1-heading text-sm flex-shrink-0"
                    style={{ background: `${color}22`, color }}
                  >
                    {entry.Driver.permanentNumber}
                  </div>

                  {/* Name */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="f1-subheading text-white text-lg group-hover:text-[#E10600] transition-colors">
                      {entry.Driver.givenName} {entry.Driver.familyName}
                    </div>
                    <div className="f1-mono text-xs" style={{ color }}>{entry.Constructors[0]?.name}</div>
                  </div>

                  {/* Wins */}
                  <div className="relative z-10 text-right hidden sm:block flex-shrink-0">
                    <div className="f1-mono text-white/30 text-xs">WINS</div>
                    <div className="f1-heading text-xl text-white">{entry.wins}</div>
                  </div>

                  {/* Points */}
                  <div className="relative z-10 text-right flex-shrink-0">
                    <div className="f1-mono text-white/30 text-xs">PTS</div>
                    <div className="f1-heading text-3xl" style={{ color: isLeader ? '#FFD700' : 'white' }}>
                      {entry.points}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {tab === 'constructors' && (
        <div className="flex flex-col gap-3">
          {CONSTRUCTOR_STANDINGS.map((team, i) => {
            const color = TEAM_COLORS[team.constructorId] || '#888';
            const barWidth = (team.points / CONSTRUCTOR_STANDINGS[0].points) * 100;

            return (
              <div
                key={team.name}
                className="relative flex items-center gap-6 p-5 rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                style={{ background: `${color}08` }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-xl opacity-10 transition-all group-hover:opacity-15"
                  style={{ width: `${barWidth}%`, background: color }}
                />

                <div className="relative z-10 f1-heading text-4xl text-white/10 w-12 flex-shrink-0">
                  {i + 1}
                </div>

                <div className="relative z-10 w-1.5 h-14 rounded flex-shrink-0" style={{ background: color }} />

                <div className="relative z-10 flex-1">
                  <div className="f1-heading text-2xl text-white group-hover:text-[#E10600] transition-colors">
                    {team.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 bg-white/5 rounded-full flex-1 max-w-48 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: color }} />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-right flex-shrink-0">
                  <div className="f1-mono text-white/30 text-xs">PTS</div>
                  <div className="f1-heading text-4xl" style={{ color: i === 0 ? '#FFD700' : 'white' }}>
                    {team.points}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
