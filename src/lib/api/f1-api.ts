// lib/api/f1-api.ts
// Data sources: Ergast API (historical) + OpenF1 API (live/current)

const ERGAST_BASE = 'https://ergast.com/api/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  constructorId?: string;
  constructorName?: string;
  teamColor?: string;
  points?: number;
  wins?: number;
  podiums?: number;
  poles?: number;
  championships?: number;
  fastestLaps?: number;
  avgFinishPos?: number;
  racesEntered?: number;
  imageUrl?: string;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: { locality: string; country: string; lat: string; long: string };
  };
  date: string;
  time?: string;
  Results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
}

export interface RaceResult {
  position: string;
  Driver: { driverId: string; code: string; givenName: string; familyName: string };
  Constructor: { constructorId: string; name: string };
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: { rank: string; lap: string; Time: { time: string }; AverageSpeed: { units: string; speed: string } };
  points: string;
}

export interface QualifyingResult {
  position: string;
  Driver: { driverId: string; code: string; givenName: string; familyName: string };
  Constructor: { constructorId: string; name: string };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface StandingsEntry {
  position: string;
  points: string;
  wins: string;
  Driver: { driverId: string; code: string; givenName: string; familyName: string; permanentNumber: string; nationality: string };
  Constructors: Array<{ constructorId: string; name: string }>;
}

// Team color map
export const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6',
  ferrari: '#E8002D',
  mercedes: '#27F4D2',
  mclaren: '#FF8000',
  alpine: '#FF87BC',
  aston_martin: '#229971',
  williams: '#64C4FF',
  haas: '#B6BABD',
  sauber: '#52E252',
  rb: '#6692FF',
  alphatauri: '#6692FF',
  alfa: '#52E252',
  renault: '#FFF500',
  racing_point: '#F596C8',
  force_india: '#F596C8',
  toro_rosso: '#469BFF',
  lotus_f1: '#FFB800',
};

export const CONSTRUCTOR_SLUG: Record<string, string> = {
  red_bull: 'redbull',
  ferrari: 'ferrari',
  mercedes: 'mercedes',
  mclaren: 'mclaren',
  alpine: 'alpine',
  aston_martin: 'aston',
  williams: 'williams',
  haas: 'haas',
  sauber: 'sauber',
  rb: 'rb',
};

// Ergast: Current season schedule
export async function getCurrentSchedule(): Promise<Race[]> {
  const res = await fetch(`${ERGAST_BASE}/current.json?limit=30`, { next: { revalidate: 3600 } });
  const data = await res.json();
  return data.MRData.RaceTable.Races;
}

// Ergast: Next race
export async function getNextRace(): Promise<Race | null> {
  const schedule = await getCurrentSchedule();
  const now = new Date();
  const next = schedule.find(r => new Date(r.date) >= now);
  return next || null;
}

// Ergast: Current driver standings
export async function getCurrentStandings(): Promise<StandingsEntry[]> {
  const res = await fetch(`${ERGAST_BASE}/current/driverStandings.json`, { next: { revalidate: 3600 } });
  const data = await res.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
}

// Ergast: Driver career stats
export async function getDriverCareerStats(driverId: string) {
  const [results, wins, poles] = await Promise.all([
    fetch(`${ERGAST_BASE}/drivers/${driverId}/results.json?limit=1000`, { next: { revalidate: 86400 } }),
    fetch(`${ERGAST_BASE}/drivers/${driverId}/results/1.json?limit=1000`, { next: { revalidate: 86400 } }),
    fetch(`${ERGAST_BASE}/drivers/${driverId}/qualifying/1.json?limit=1000`, { next: { revalidate: 86400 } }),
  ]);

  const [resultsData, winsData, polesData] = await Promise.all([
    results.json(),
    wins.json(),
    poles.json(),
  ]);

  const allResults = resultsData.MRData.RaceTable.Races;
  const podiums = allResults.filter((r: Race) =>
    r.Results && parseInt(r.Results[0]?.position) <= 3
  ).length;

  return {
    races: parseInt(resultsData.MRData.total),
    wins: parseInt(winsData.MRData.total),
    poles: parseInt(polesData.MRData.total),
    podiums,
    allResults,
  };
}

// Ergast: Driver info
export async function getDriverInfo(driverId: string): Promise<Driver | null> {
  const res = await fetch(`${ERGAST_BASE}/drivers/${driverId}.json`, { next: { revalidate: 86400 } });
  const data = await res.json();
  const d = data.MRData.DriverTable.Drivers[0];
  if (!d) return null;
  return d;
}

// Ergast: All current drivers
export async function getCurrentDrivers(): Promise<Driver[]> {
  const standings = await getCurrentStandings();
  return standings.map(s => ({
    driverId: s.Driver.driverId,
    permanentNumber: s.Driver.permanentNumber,
    code: s.Driver.code,
    givenName: s.Driver.givenName,
    familyName: s.Driver.familyName,
    dateOfBirth: '',
    nationality: s.Driver.nationality,
    constructorId: s.Constructors[0]?.constructorId,
    constructorName: s.Constructors[0]?.name,
    teamColor: TEAM_COLORS[s.Constructors[0]?.constructorId] || '#888',
    points: parseFloat(s.points),
    wins: parseInt(s.wins),
  }));
}

// Ergast: Race history for a specific circuit
export async function getCircuitHistory(circuitId: string, limit = 10): Promise<Race[]> {
  const res = await fetch(
    `${ERGAST_BASE}/circuits/${circuitId}/results/1.json?limit=${limit}`,
    { next: { revalidate: 86400 } }
  );
  const data = await res.json();
  return data.MRData.RaceTable.Races;
}

// Ergast: Lap times for a race
export async function getRaceLapTimes(season: string, round: string) {
  const res = await fetch(
    `${ERGAST_BASE}/${season}/${round}/laps.json?limit=2000`,
    { next: { revalidate: 86400 } }
  );
  const data = await res.json();
  return data.MRData.RaceTable.Races[0]?.Laps || [];
}

// Ergast: Season races with results
export async function getSeasonResults(season: string): Promise<Race[]> {
  const res = await fetch(
    `${ERGAST_BASE}/${season}/results.json?limit=500`,
    { next: { revalidate: 86400 } }
  );
  const data = await res.json();
  return data.MRData.RaceTable.Races;
}

// Ergast: Compare two drivers head-to-head
export async function compareDrivers(driver1Id: string, driver2Id: string) {
  const seasons = Array.from({ length: 30 }, (_, i) => 2024 - i);

  const results = await Promise.all(
    seasons.slice(0, 10).map(s =>
      fetch(`${ERGAST_BASE}/${s}/results.json?limit=500`, { next: { revalidate: 86400 } }).then(r => r.json())
    )
  );

  const races: Race[] = results.flatMap(r => r.MRData.RaceTable.Races);

  let d1Wins = 0, d2Wins = 0, d1Podiums = 0, d2Podiums = 0;
  const headToHead: Array<{ race: string; d1Pos: number; d2Pos: number }> = [];

  for (const race of races) {
    if (!race.Results) continue;
    const d1Result = race.Results.find((r: RaceResult) => r.Driver.driverId === driver1Id);
    const d2Result = race.Results.find((r: RaceResult) => r.Driver.driverId === driver2Id);

    if (d1Result && d2Result) {
      const d1Pos = parseInt(d1Result.position);
      const d2Pos = parseInt(d2Result.position);
      if (d1Pos < d2Pos) d1Wins++;
      else d2Wins++;
      if (d1Pos <= 3) d1Podiums++;
      if (d2Pos <= 3) d2Podiums++;
      headToHead.push({ race: race.raceName, d1Pos, d2Pos });
    }
  }

  return { headToHead, d1Wins, d2Wins, d1Podiums, d2Podiums };
}

// Ergast: Championship winners
export async function getChampionshipHistory(start = 2000, end = 2024) {
  const seasons = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const results = await Promise.all(
    seasons.map(s =>
      fetch(`${ERGAST_BASE}/${s}/driverStandings/1.json`, { next: { revalidate: 86400 } }).then(r => r.json())
    )
  );

  return results.map((data, i) => ({
    season: seasons[i],
    champion: data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings[0],
  })).filter(r => r.champion);
}

// Parse lap time string to milliseconds
export function lapTimeToMs(time: string): number {
  if (!time) return 0;
  const parts = time.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60000 + parseFloat(parts[1]) * 1000;
  }
  return parseFloat(time) * 1000;
}

// Format milliseconds to lap time string
export function msToLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(3);
  return `${minutes}:${parseFloat(seconds) < 10 ? '0' : ''}${seconds}`;
}
