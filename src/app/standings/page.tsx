import { getCurrentStandings } from '../../lib/api/f1-api';
import StandingsClient from './StandingsClient';

export const revalidate = 3600;

export default async function StandingsPage() {
  let standings: any[] = [];
  try {
    standings = await getCurrentStandings();
  } catch {
    standings = [];
  }
  return <StandingsClient standings={standings} />;
}

