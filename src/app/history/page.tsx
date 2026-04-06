'use client';

import { useState, useEffect } from 'react';
import { Calendar, Trophy, Flag, ChevronRight, Search } from 'lucide-react';

const SEASONS = Array.from({ length: 75 }, (_, i) => 2024 - i);

const CHAMPIONS: Record<number, { driver: string; team: string; wins: number; nationality: string }> = {
  2024: { driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 9, nationality: '🇳🇱' },
  2023: { driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 19, nationality: '🇳🇱' },
  2022: { driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 15, nationality: '🇳🇱' },
  2021: { driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 10, nationality: '🇳🇱' },
  2020: { driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, nationality: '🇬🇧' },
  2019: { driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, nationality: '🇬🇧' },
  2018: { driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, nationality: '🇬🇧' },
  2017: { driver: 'Lewis Hamilton', team: 'Mercedes', wins: 9, nationality: '🇬🇧' },
  2016: { driver: 'Nico Rosberg', team: 'Mercedes', wins: 9, nationality: '🇩🇪' },
  2015: { driver: 'Lewis Hamilton', team: 'Mercedes', wins: 10, nationality: '🇬🇧' },
  2014: { driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, nationality: '🇬🇧' },
  2013: { driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 13, nationality: '🇩🇪' },
  2012: { driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 5, nationality: '🇩🇪' },
  2011: { driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 11, nationality: '🇩🇪' },
  2010: { driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 5, nationality: '🇩🇪' },
  2009: { driver: 'Jenson Button', team: 'Brawn GP', wins: 6, nationality: '🇬🇧' },
  2008: { driver: 'Lewis Hamilton', team: 'McLaren', wins: 5, nationality: '🇬🇧' },
  2007: { driver: 'Kimi Räikkönen', team: 'Ferrari', wins: 6, nationality: '🇫🇮' },
  2006: { driver: 'Fernando Alonso', team: 'Renault', wins: 7, nationality: '🇪🇸' },
  2005: { driver: 'Fernando Alonso', team: 'Renault', wins: 7, nationality: '🇪🇸' },
  2004: { driver: 'Michael Schumacher', team: 'Ferrari', wins: 13, nationality: '🇩🇪' },
  2003: { driver: 'Michael Schumacher', team: 'Ferrari', wins: 6, nationality: '🇩🇪' },
  2002: { driver: 'Michael Schumacher', team: 'Ferrari', wins: 11, nationality: '🇩🇪' },
  2001: { driver: 'Michael Schumacher', team: 'Ferrari', wins: 9, nationality: '🇩🇪' },
  2000: { driver: 'Michael Schumacher', team: 'Ferrari', wins: 9, nationality: '🇩🇪' },
  1999: { driver: 'Mika Häkkinen', team: 'McLaren', wins: 5, nationality: '🇫🇮' },
  1998: { driver: 'Mika Häkkinen', team: 'McLaren', wins: 8, nationality: '🇫🇮' },
  1997: { driver: 'Jacques Villeneuve', team: 'Williams', wins: 7, nationality: '🇨🇦' },
  1996: { driver: 'Damon Hill', team: 'Williams', wins: 8, nationality: '🇬🇧' },
  1995: { driver: 'Michael Schumacher', team: 'Benetton', wins: 9, nationality: '🇩🇪' },
  1994: { driver: 'Michael Schumacher', team: 'Benetton', wins: 8, nationality: '🇩🇪' },
  1993: { driver: 'Alain Prost', team: 'Williams', wins: 7, nationality: '🇫🇷' },
  1992: { driver: 'Nigel Mansell', team: 'Williams', wins: 9, nationality: '🇬🇧' },
  1991: { driver: 'Ayrton Senna', team: 'McLaren', wins: 7, nationality: '🇧🇷' },
  1990: { driver: 'Ayrton Senna', team: 'McLaren', wins: 6, nationality: '🇧🇷' },
  1989: { driver: 'Alain Prost', team: 'McLaren', wins: 4, nationality: '🇫🇷' },
  1988: { driver: 'Ayrton Senna', team: 'McLaren', wins: 8, nationality: '🇧🇷' },
  1987: { driver: 'Nelson Piquet', team: 'Williams', wins: 3, nationality: '🇧🇷' },
  1986: { driver: 'Alain Prost', team: 'McLaren', wins: 4, nationality: '🇫🇷' },
  1985: { driver: 'Alain Prost', team: 'McLaren', wins: 5, nationality: '🇫🇷' },
  1984: { driver: 'Niki Lauda', team: 'McLaren', wins: 5, nationality: '🇦🇹' },
  1983: { driver: 'Nelson Piquet', team: 'Brabham', wins: 3, nationality: '🇧🇷' },
  1982: { driver: 'Keke Rosberg', team: 'Williams', wins: 1, nationality: '🇫🇮' },
  1981: { driver: 'Nelson Piquet', team: 'Brabham', wins: 3, nationality: '🇧🇷' },
  1980: { driver: 'Alan Jones', team: 'Williams', wins: 5, nationality: '🇦🇺' },
  1979: { driver: 'Jody Scheckter', team: 'Ferrari', wins: 3, nationality: '🇿🇦' },
  1978: { driver: 'Mario Andretti', team: 'Lotus', wins: 6, nationality: '🇺🇸' },
  1977: { driver: 'Niki Lauda', team: 'Ferrari', wins: 3, nationality: '🇦🇹' },
  1976: { driver: 'James Hunt', team: 'McLaren', wins: 6, nationality: '🇬🇧' },
  1975: { driver: 'Niki Lauda', team: 'Ferrari', wins: 5, nationality: '🇦🇹' },
  1974: { driver: 'Emerson Fittipaldi', team: 'McLaren', wins: 3, nationality: '🇧🇷' },
  1973: { driver: 'Jackie Stewart', team: 'Tyrrell', wins: 5, nationality: '🇬🇧' },
  1972: { driver: 'Emerson Fittipaldi', team: 'Lotus', wins: 5, nationality: '🇧🇷' },
  1971: { driver: 'Jackie Stewart', team: 'Tyrrell', wins: 6, nationality: '🇬🇧' },
  1970: { driver: 'Jochen Rindt', team: 'Lotus', wins: 5, nationality: '🇦🇹' },
  1969: { driver: 'Jackie Stewart', team: 'Matra', wins: 6, nationality: '🇬🇧' },
  1968: { driver: 'Graham Hill', team: 'Lotus', wins: 3, nationality: '🇬🇧' },
  1967: { driver: 'Denny Hulme', team: 'Brabham', wins: 2, nationality: '🇳🇿' },
  1966: { driver: 'Jack Brabham', team: 'Brabham', wins: 4, nationality: '🇦🇺' },
  1965: { driver: 'Jim Clark', team: 'Lotus', wins: 6, nationality: '🇬🇧' },
  1964: { driver: 'John Surtees', team: 'Ferrari', wins: 2, nationality: '🇬🇧' },
  1963: { driver: 'Jim Clark', team: 'Lotus', wins: 7, nationality: '🇬🇧' },
  1962: { driver: 'Graham Hill', team: 'BRM', wins: 4, nationality: '🇬🇧' },
  1961: { driver: 'Phil Hill', team: 'Ferrari', wins: 2, nationality: '🇺🇸' },
  1960: { driver: 'Jack Brabham', team: 'Cooper', wins: 5, nationality: '🇦🇺' },
  1959: { driver: 'Jack Brabham', team: 'Cooper', wins: 2, nationality: '🇦🇺' },
  1958: { driver: 'Mike Hawthorn', team: 'Ferrari', wins: 1, nationality: '🇬🇧' },
  1957: { driver: 'Juan Manuel Fangio', team: 'Maserati', wins: 4, nationality: '🇦🇷' },
  1956: { driver: 'Juan Manuel Fangio', team: 'Ferrari', wins: 3, nationality: '🇦🇷' },
  1955: { driver: 'Juan Manuel Fangio', team: 'Mercedes', wins: 4, nationality: '🇦🇷' },
  1954: { driver: 'Juan Manuel Fangio', team: 'Mercedes', wins: 6, nationality: '🇦🇷' },
  1953: { driver: 'Alberto Ascari', team: 'Ferrari', wins: 5, nationality: '🇮🇹' },
  1952: { driver: 'Alberto Ascari', team: 'Ferrari', wins: 6, nationality: '🇮🇹' },
  1951: { driver: 'Juan Manuel Fangio', team: 'Alfa Romeo', wins: 3, nationality: '🇦🇷' },
  1950: { driver: 'Nino Farina', team: 'Alfa Romeo', wins: 3, nationality: '🇮🇹' },
};

const ERA_COLORS: Record<string, string> = {
  'Verstappen Era': '#3671C6',
  'Hamilton Era': '#27F4D2',
  'Schumacher Era': '#E8002D',
  'Senna/Prost Era': '#FF8000',
  'Classic Era': '#FFD700',
};

function getEra(year: number): string {
  if (year >= 2021) return 'Verstappen Era';
  if (year >= 2014) return 'Hamilton Era';
  if (year >= 2000 && year <= 2013) return 'Schumacher Era';
  if (year >= 1984 && year <= 1999) return 'Senna/Prost Era';
  return 'Classic Era';
}

function ChampionCard({ year, data }: { year: number; data: typeof CHAMPIONS[2024] }) {
  const era = getEra(year);
  const eraColor = ERA_COLORS[era];

  return (
    <div
      className="group relative rounded-xl p-4 border border-white/5 hover:border-white/15 cursor-pointer transition-all hover:-translate-y-1"
      style={{ background: `${eraColor}08` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="f1-heading text-4xl text-white/10">{year}</div>
        <div
          className="f1-mono text-xs px-2 py-1 rounded-full border"
          style={{ color: eraColor, borderColor: `${eraColor}44`, background: `${eraColor}11` }}
        >
          {era}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{data.nationality}</span>
        <div className="f1-heading text-xl text-white group-hover:text-[#E10600] transition-colors">
          {data.driver}
        </div>
      </div>

      <div className="f1-mono text-xs mb-3" style={{ color: eraColor }}>
        {data.team}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Trophy size={12} className="text-[#FFD700]" />
          <span className="f1-mono text-white/50 text-xs">{data.wins} wins</span>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: eraColor }}
      />
    </div>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [eraFilter, setEraFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const eras = ['all', ...Object.keys(ERA_COLORS)];

  const filtered = Object.entries(CHAMPIONS)
    .filter(([year, data]) => {
      const matchesSearch = !search ||
        data.driver.toLowerCase().includes(search.toLowerCase()) ||
        data.team.toLowerCase().includes(search.toLowerCase()) ||
        year.includes(search);
      const matchesEra = eraFilter === 'all' || getEra(parseInt(year)) === eraFilter;
      return matchesSearch && matchesEra;
    })
    .sort(([a], [b]) => parseInt(b) - parseInt(a));

  // Driver win counts
  const driverTitles: Record<string, number> = {};
  Object.values(CHAMPIONS).forEach(({ driver }) => {
    driverTitles[driver] = (driverTitles[driver] || 0) + 1;
  });
  const topDrivers = Object.entries(driverTitles)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="f1-mono text-[#E10600] text-xs tracking-widest mb-3">FORMULA 1 HISTORY</div>
        <h1 className="f1-heading text-6xl sm:text-8xl mb-4">
          <span className="text-white">F1</span><br />
          <span className="text-[#E10600]">HISTORY</span>
        </h1>
        <p className="text-white/40 max-w-lg">
          Explore 75 years of Formula 1 history — from the 1950 championship to the modern era. Browse champions, iconic races, and legendary drivers.
        </p>
      </div>

      {/* All-time titles leaders */}
      <div className="mb-12">
        <h2 className="f1-heading text-3xl text-white mb-6">MOST CHAMPIONSHIPS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topDrivers.map(([driver, titles], i) => (
            <div
              key={driver}
              className="glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4"
            >
              <div className="f1-heading text-5xl text-white/10">{i + 1}</div>
              <div>
                <div className="f1-subheading text-white text-sm">{driver.split(' ').pop()}</div>
                <div className="flex items-center gap-1 mt-1">
                  {Array(titles).fill(null).map((_, j) => (
                    <Trophy key={j} size={10} className="text-[#FFD700]" />
                  ))}
                  <span className="f1-mono text-[#FFD700] text-xs ml-1">{titles}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-white/20 f1-mono text-sm outline-none focus:border-[#E10600]/50 transition-colors"
            placeholder="Search driver, team, year..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {eras.map(era => {
            const color = ERA_COLORS[era] || '#E10600';
            return (
              <button
                key={era}
                onClick={() => setEraFilter(era)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg f1-mono text-xs transition-all border`}
                style={eraFilter === era
                  ? { background: era === 'all' ? '#E10600' : color, borderColor: era === 'all' ? '#E10600' : color, color: 'white' }
                  : { borderColor: era === 'all' ? '#E10600' + '44' : color + '33', color: era === 'all' ? '#E10600' + '88' : color + '88' }
                }
              >
                {era === 'all' ? 'ALL ERAS' : era.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Champions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(([year, data]) => (
          <ChampionCard key={year} year={parseInt(year)} data={data} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-white/20 f1-mono">
          No results for "{search}"
        </div>
      )}
    </div>
  );
}
