// lib/utils/track-data.ts
// SVG track outlines and circuit metadata for animated race visualization

export interface TrackData {
  id: string;
  name: string;
  country: string;
  city: string;
  length: number; // km
  laps: number;
  lapRecord: { time: string; driver: string; year: number };
  drsZones: number;
  corners: number;
  topSpeed: number; // km/h typical
  overallDifficulty: 1 | 2 | 3 | 4 | 5;
  type: 'street' | 'permanent' | 'hybrid';
  svgPath: string; // simplified SVG path for track outline
  viewBox: string;
  startLine: { x: number; y: number; angle: number };
  drsZonePaths?: string[];
  timezone: string;
}

// Simplified SVG paths for key circuits (points represent track centerline)
export const TRACKS: Record<string, TrackData> = {
  miami: {
    id: 'miami',
    name: 'Miami International Autodrome',
    country: 'USA',
    city: 'Miami',
    length: 5.412,
    laps: 57,
    lapRecord: { time: '1:29.708', driver: 'Max Verstappen', year: 2023 },
    drsZones: 3,
    corners: 19,
    topSpeed: 320,
    overallDifficulty: 3,
    type: 'street',
    timezone: 'America/New_York',
    viewBox: '0 0 400 320',
    startLine: { x: 300, y: 80, angle: 270 },
    svgPath: 'M 300 80 L 300 55 Q 300 35 275 30 L 180 28 Q 155 28 148 50 L 145 90 Q 142 118 120 128 L 85 138 Q 55 148 52 178 L 55 215 Q 62 245 90 255 L 140 262 Q 170 266 178 288 L 180 308 Q 182 320 200 320 L 240 318 Q 260 314 262 295 L 260 270 Q 258 248 278 240 L 310 228 Q 340 215 342 185 L 338 150 Q 330 120 308 108 L 300 80 Z',
    drsZonePaths: [],
  },
  albert_park: {
    id: 'albert_park',
    name: 'Albert Park Circuit',
    country: 'Australia',
    city: 'Melbourne',
    length: 5.278,
    laps: 58,
    lapRecord: { time: '1:20.235', driver: 'Charles Leclerc', year: 2022 },
    drsZones: 4,
    corners: 16,
    topSpeed: 318,
    overallDifficulty: 3,
    type: 'street',
    timezone: 'Australia/Melbourne',
    viewBox: '0 0 400 300',
    startLine: { x: 180, y: 200, angle: 0 },
    svgPath: `M 180 200 L 280 200 Q 310 200 310 180 L 310 120 Q 310 90 280 80 
      L 240 75 Q 220 70 210 55 L 200 30 Q 185 10 160 15 
      L 130 25 Q 105 35 95 60 L 90 100 Q 88 130 100 150 
      L 120 170 Q 140 185 160 185 L 180 200 Z`,
  },

  bahrain: {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    country: 'Bahrain',
    city: 'Sakhir',
    length: 5.412,
    laps: 57,
    lapRecord: { time: '1:31.447', driver: 'Pedro de la Rosa', year: 2005 },
    drsZones: 3,
    corners: 15,
    topSpeed: 322,
    overallDifficulty: 3,
    type: 'permanent',
    timezone: 'Asia/Bahrain',
    viewBox: '0 0 400 320',
    startLine: { x: 200, y: 60, angle: 90 },
    svgPath: `M 200 60 L 300 60 Q 340 60 340 100 L 340 140 Q 340 180 300 190
      L 260 195 Q 240 200 235 220 L 230 250 Q 225 270 210 275
      L 180 275 Q 155 275 145 255 L 140 230 Q 138 210 125 200
      L 100 190 Q 70 175 70 140 L 70 100 Q 70 60 110 60 L 200 60 Z`,
  },

  monaco: {
    id: 'monaco',
    name: 'Circuit de Monaco',
    country: 'Monaco',
    city: 'Monte Carlo',
    length: 3.337,
    laps: 78,
    lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: 2021 },
    drsZones: 1,
    corners: 19,
    topSpeed: 290,
    overallDifficulty: 5,
    type: 'street',
    timezone: 'Europe/Monaco',
    viewBox: '0 0 400 350',
    startLine: { x: 300, y: 160, angle: 180 },
    svgPath: `M 300 160 L 300 100 Q 300 70 270 60 L 220 50 Q 180 45 160 70
      L 130 110 Q 100 150 90 190 L 80 230 Q 75 260 90 280
      L 120 300 Q 155 315 190 305 L 230 285 Q 265 260 280 230
      L 295 200 L 300 160 Z`,
  },

  silverstone: {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    country: 'Great Britain',
    city: 'Silverstone',
    length: 5.891,
    laps: 52,
    lapRecord: { time: '1:27.097', driver: 'Max Verstappen', year: 2020 },
    drsZones: 2,
    corners: 18,
    topSpeed: 320,
    overallDifficulty: 4,
    type: 'permanent',
    timezone: 'Europe/London',
    viewBox: '0 0 400 300',
    startLine: { x: 250, y: 80, angle: 270 },
    svgPath: `M 250 80 L 320 80 Q 360 80 370 120 L 370 160 Q 370 200 340 210
      L 310 215 Q 290 218 280 235 L 275 260 Q 270 285 250 290
      L 200 290 Q 160 290 140 265 L 120 240 Q 100 215 90 185
      L 80 150 Q 75 110 100 90 L 140 75 L 250 80 Z`,
  },

  monza: {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    country: 'Italy',
    city: 'Monza',
    length: 5.793,
    laps: 53,
    lapRecord: { time: '1:21.046', driver: 'Rubens Barrichello', year: 2004 },
    drsZones: 2,
    corners: 11,
    topSpeed: 370,
    overallDifficulty: 2,
    type: 'permanent',
    timezone: 'Europe/Rome',
    viewBox: '0 0 400 300',
    startLine: { x: 300, y: 150, angle: 180 },
    svgPath: `M 300 150 L 300 80 Q 300 50 270 40 L 200 35 Q 170 32 155 50
      L 140 80 Q 128 110 140 135 L 160 155 Q 180 170 170 190
      L 150 220 Q 130 250 140 275 L 165 290 Q 190 298 215 285
      L 245 265 Q 275 240 285 210 L 295 180 L 300 150 Z`,
  },

  suzuka: {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    country: 'Japan',
    city: 'Suzuka',
    length: 5.807,
    laps: 53,
    lapRecord: { time: '1:30.983', driver: 'Lewis Hamilton', year: 2019 },
    drsZones: 1,
    corners: 18,
    topSpeed: 335,
    overallDifficulty: 5,
    type: 'permanent',
    timezone: 'Asia/Tokyo',
    viewBox: '0 0 400 300',
    startLine: { x: 290, y: 180, angle: 270 },
    svgPath: `M 290 180 L 290 100 Q 290 60 255 50 L 210 45 Q 175 42 160 65
      L 145 95 Q 130 130 145 160 L 160 185 Q 175 205 160 220
      L 140 240 Q 115 265 130 285 L 160 295 Q 195 300 220 280
      L 250 255 Q 270 230 275 205 L 290 180 Z`,
  },

  spa: {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    city: 'Spa',
    length: 7.004,
    laps: 44,
    lapRecord: { time: '1:41.252', driver: 'Valtteri Bottas', year: 2018 },
    drsZones: 2,
    corners: 20,
    topSpeed: 355,
    overallDifficulty: 5,
    type: 'permanent',
    timezone: 'Europe/Brussels',
    viewBox: '0 0 450 350',
    startLine: { x: 360, y: 160, angle: 270 },
    svgPath: `M 360 160 L 360 80 Q 360 40 315 35 L 270 32 Q 230 30 210 60
      L 180 105 Q 155 150 120 165 L 80 175 Q 45 182 40 220
      L 45 260 Q 60 295 100 305 L 150 310 Q 200 312 230 285
      L 270 250 Q 305 215 320 190 L 360 160 Z`,
  },

  interlagos: {
    id: 'interlagos',
    name: 'AutÃ³dromo JosÃ© Carlos Pace',
    country: 'Brazil',
    city: 'SÃ£o Paulo',
    length: 4.309,
    laps: 71,
    lapRecord: { time: '1:10.540', driver: 'Valtteri Bottas', year: 2018 },
    drsZones: 2,
    corners: 15,
    topSpeed: 325,
    overallDifficulty: 4,
    type: 'permanent',
    timezone: 'America/Sao_Paulo',
    viewBox: '0 0 400 300',
    startLine: { x: 250, y: 80, angle: 45 },
    svgPath: `M 250 80 L 320 100 Q 360 115 355 155 L 340 195 Q 318 235 280 240
      L 245 240 Q 220 240 210 255 L 200 275 Q 188 292 165 290
      L 135 282 Q 105 265 100 235 L 100 195 Q 102 160 130 145
      L 165 130 Q 195 118 200 95 L 215 75 L 250 80 Z`,
  },

  yas_marina: {
    id: 'yas_marina',
    name: 'Yas Marina Circuit',
    country: 'Abu Dhabi',
    city: 'Abu Dhabi',
    length: 5.281,
    laps: 58,
    lapRecord: { time: '1:26.103', driver: 'Max Verstappen', year: 2021 },
    drsZones: 2,
    corners: 16,
    topSpeed: 320,
    overallDifficulty: 2,
    type: 'permanent',
    timezone: 'Asia/Dubai',
    viewBox: '0 0 420 320',
    startLine: { x: 300, y: 80, angle: 180 },
    svgPath: `M 300 80 L 230 80 Q 180 80 175 130 L 178 180 Q 182 220 210 235
      L 245 242 Q 270 246 275 270 L 272 295 Q 268 315 245 318
      L 190 318 Q 155 315 148 285 L 145 250 Q 142 215 115 205
      L 80 195 Q 50 178 52 145 L 60 110 Q 75 80 110 75
      L 200 70 L 300 80 Z`,
  },

  las_vegas: {
    id: 'las_vegas',
    name: 'Las Vegas Street Circuit',
    country: 'USA',
    city: 'Las Vegas',
    length: 6.201,
    laps: 50,
    lapRecord: { time: '1:35.490', driver: 'Kevin Magnussen', year: 2023 },
    drsZones: 2,
    corners: 17,
    topSpeed: 342,
    overallDifficulty: 3,
    type: 'street',
    timezone: 'America/Los_Angeles',
    viewBox: '0 0 400 350',
    startLine: { x: 300, y: 80, angle: 270 },
    svgPath: `M 300 80 L 300 280 Q 300 315 265 320 L 140 320 Q 105 320 100 280
      L 100 200 Q 100 170 125 160 L 160 155 Q 190 150 195 125
      L 195 80 Q 195 50 225 45 L 275 45 Q 305 50 300 80 Z`,
  },
};

// Get track data by circuit ID
export function getTrackData(circuitId: string): TrackData | null {
  // Try exact match first
  if (TRACKS[circuitId]) return TRACKS[circuitId];

  // Fuzzy match
  const key = Object.keys(TRACKS).find(k =>
    circuitId.toLowerCase().includes(k) || k.includes(circuitId.toLowerCase())
  );

  return key ? TRACKS[key] : null;
}

// 2024/2025 Race calendar with circuit mappings
export const RACE_CALENDAR_CIRCUIT_MAP: Record<string, string> = {
  'Bahrain Grand Prix': 'bahrain',
  'Saudi Arabian Grand Prix': 'jeddah',
  'Australian Grand Prix': 'albert_park',
  'Japanese Grand Prix': 'suzuka',
  'Chinese Grand Prix': 'shanghai',
  'Miami Grand Prix': 'miami',
  'Emilia Romagna Grand Prix': 'imola',
  'Monaco Grand Prix': 'monaco',
  'Canadian Grand Prix': 'villeneuve',
  'Spanish Grand Prix': 'catalunya',
  'Austrian Grand Prix': 'red_bull_ring',
  'British Grand Prix': 'silverstone',
  'Hungarian Grand Prix': 'hungaroring',
  'Belgian Grand Prix': 'spa',
  'Dutch Grand Prix': 'zandvoort',
  'Italian Grand Prix': 'monza',
  'Azerbaijan Grand Prix': 'baku',
  'Singapore Grand Prix': 'marina_bay',
  'United States Grand Prix': 'americas',
  'Mexico City Grand Prix': 'rodriguez',
  'SÃ£o Paulo Grand Prix': 'interlagos',
  'Las Vegas Grand Prix': 'las_vegas',
  'Qatar Grand Prix': 'losail',
  'Abu Dhabi Grand Prix': 'yas_marina',
};

// Team color definitions
export const TEAM_COLOR_MAP: Record<string, { primary: string; secondary: string }> = {
  red_bull: { primary: '#3671C6', secondary: '#CC1E4A' },
  ferrari: { primary: '#E8002D', secondary: '#FFBE00' },
  mercedes: { primary: '#27F4D2', secondary: '#1E1E1E' },
  mclaren: { primary: '#FF8000', secondary: '#000000' },
  alpine: { primary: '#FF87BC', secondary: '#0093CC' },
  aston_martin: { primary: '#229971', secondary: '#CEDC00' },
  williams: { primary: '#64C4FF', secondary: '#00A0DC' },
  haas: { primary: '#B6BABD', secondary: '#E8002D' },
  sauber: { primary: '#52E252', secondary: '#00CF46' },
  rb: { primary: '#6692FF', secondary: '#CC1E4A' },
};

