'use client';

import Link from 'next/link';
import { Race } from '../../lib/api/f1-api';
import { MapPin, ChevronRight } from 'lucide-react';

interface Props {
  races: Race[];
}

const FLAG_EMOJI: Record<string, string> = {
  'Australia': '🇦🇺', 'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Japan': '🇯🇵',
  'China': '🇨🇳', 'USA': '🇺🇸', 'United States': '🇺🇸', 'Italy': '🇮🇹',
  'Monaco': '🇲🇨', 'Canada': '🇨🇦', 'Spain': '🇪🇸', 'Austria': '🇦🇹',
  'Great Britain': '🇬🇧', 'Hungary': '🇭🇺', 'Belgium': '🇧🇪', 'Netherlands': '🇳🇱',
  'Azerbaijan': '🇦🇿', 'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
  'Las Vegas': '🇺🇸', 'Qatar': '🇶🇦', 'Abu Dhabi': '🇦🇪', 'Miami': '🇺🇸',
};

export default function UpcomingRaces({ races }: Props) {
  if (!races.length) {
    return (
      <div className="text-white/30 text-center py-12 f1-mono">
        Race calendar data loading...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {races.map((race, i) => {
        const date = new Date(race.date);
        const isNext = i === 0;
        const flag = FLAG_EMOJI[race.Circuit.Location.country] || '🏁';

        return (
          <Link key={`${race.season}-${race.round}`} href={`/race/${race.season}/${race.round}`}>
            <div
              className={`relative rounded-xl p-4 border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl group ${
                isNext
                  ? 'border-[#E10600]/40 bg-[#E10600]/5'
                  : 'border-white/5 bg-white/2 hover:border-white/15'
              }`}
            >
              {isNext && (
                <div className="absolute -top-2 left-4">
                  <div className="bg-[#E10600] text-white f1-mono text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    NEXT
                  </div>
                </div>
              )}

              <div className="text-3xl mb-3">{flag}</div>

              <div className="f1-mono text-white/30 text-xs mb-1">
                ROUND {race.round}
              </div>

              <div className="f1-heading text-lg leading-tight mb-1 group-hover:text-[#E10600] transition-colors">
                {race.raceName.replace(' Grand Prix', '')}
              </div>

              <div className="text-[#E10600] f1-heading text-sm mb-3">
                GRAND PRIX
              </div>

              <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                <MapPin size={10} />
                <span>{race.Circuit.Location.locality}</span>
              </div>

              <div className="f1-mono text-white/50 text-xs">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-[#E10600]" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
