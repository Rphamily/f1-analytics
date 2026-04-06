import { getCurrentSchedule, getCurrentStandings } from '../lib/api/f1-api';
import RaceWeekendHero from '../components/track/RaceWeekendHero';
import DriverGrid from '../components/ui/DriverGrid';
import QuickStats from '../components/ui/QuickStats';
import UpcomingRaces from '../components/ui/UpcomingRaces';

export const revalidate = 3600;

async function getPageData() {
  try {
    const year = new Date().getFullYear();
    const [scheduleRes, standingsRes] = await Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${year}.json?limit=30`),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
    ]);
    const scheduleJson = await scheduleRes.json();
    const standingsJson = await standingsRes.json();
    const schedule = scheduleJson.MRData?.RaceTable?.Races ?? [];
    const standings = standingsJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const now = new Date();
    const nextRace = schedule.find((r: any) => new Date(r.date) >= now) ?? schedule[schedule.length - 1];
    const upcomingRaces = schedule.filter((r: any) => new Date(r.date) >= now).slice(0, 6);
    return { nextRace, standings, upcomingRaces, currentSeason: String(year) };
  } catch {
    return { nextRace: null, standings: [], upcomingRaces: [], currentSeason: String(new Date().getFullYear()) };
  }
}

export default async function HomePage() {
  const { nextRace, standings, upcomingRaces, currentSeason } = await getPageData();
  return (
    <div className="min-h-screen">
      <RaceWeekendHero race={nextRace} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <QuickStats standings={standings} />
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="f1-heading text-5xl">
            <span className="text-white/20">{currentSeason}</span>{' '}
            <span className="text-white">DRIVER</span>{' '}
            <span className="text-[#E10600]">GRID</span>
          </h2>
          <div className="flex items-center gap-2 text-white/40 f1-mono text-xs">
            <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse" />
            LIVE STANDINGS
          </div>
        </div>
        <DriverGrid standings={standings} />
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="f1-heading text-5xl mb-8">
          <span className="text-white">RACE</span>{' '}
          <span className="text-[#E10600]">CALENDAR</span>
        </h2>
        <UpcomingRaces races={upcomingRaces} />
      </section>
    </div>
  );
}
