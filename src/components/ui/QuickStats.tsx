'use client';

import { StandingsEntry, TEAM_COLORS } from '../../lib/api/f1-api';
import { Trophy, Zap, TrendingUp } from 'lucide-react';

interface Props {
  standings: StandingsEntry[];
}

export default function QuickStats({ standings }: Props) {
  if (!standings.length) return null;

  const leader = standings[0];
  const second = standings[1];
  const gap = leader && second
    ? (parseFloat(leader.points) - parseFloat(second.points)).toFixed(0)
    : '—';

  const leaderColor = TEAM_COLORS[leader?.Constructors[0]?.constructorId] || '#E10600';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        {
          icon: <Trophy size={20} className="text-[#FFD700]" />,
          label: "CHAMPIONSHIP LEADER",
          value: leader ? `${leader.Driver.givenName} ${leader.Driver.familyName}` : '—',
          sub: `${leader?.points || 0} pts`,
          color: leaderColor,
        },
        {
          icon: <TrendingUp size={20} className="text-[#E10600]" />,
          label: "POINTS LEAD",
          value: `+${gap}`,
          sub: `over ${second?.Driver.familyName || '—'}`,
          color: '#E10600',
        },
        {
          icon: <Zap size={20} className="text-[#FF8000]" />,
          label: "MOST WINS",
          value: leader?.Driver.familyName || '—',
          sub: `${leader?.wins || 0} victories`,
          color: '#FF8000',
        },
        {
          icon: <div className="w-5 h-5 border-2 border-white/30 rounded-full" />,
          label: "SEASON RACES",
          value: '24',
          sub: 'rounds total',
          color: '#888',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="glass-panel rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            {stat.icon}
            <span className="f1-mono text-white/30 text-xs">{stat.label}</span>
          </div>
          <div
            className="f1-heading text-2xl leading-tight mb-1"
            style={{ color: stat.color }}
          >
            {stat.value}
          </div>
          <div className="text-white/30 text-xs f1-mono">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
