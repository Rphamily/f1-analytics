// lib/ml/race-predictor.ts
// ML-powered race outcome prediction using historical data

import * as tf from '@tensorflow/tfjs';
import { lapTimeToMs } from '../api/f1-api';

export interface DriverPrediction {
  driverId: string;
  driverCode: string;
  driverName: string;
  teamName: string;
  teamColor: string;
  predictedPosition: number;
  winProbability: number;
  podiumProbability: number;
  confidence: number;
  keyFactors: string[];
  predictedLapTime?: string;
}

export interface RacePrediction {
  raceId: string;
  raceName: string;
  circuitId: string;
  predictions: DriverPrediction[];
  modelAccuracy: number;
  predictionBasis: string;
  generatedAt: string;
}

export interface DriverFeatures {
  driverId: string;
  // Qualifying performance (most predictive)
  qualifyingPosition: number;
  qualifyingGap: number; // gap to pole in %

  // Recent form (last 5 races)
  avgFinishLast5: number;
  dnfRateLast5: number;
  pointsLast5: number;

  // Circuit-specific performance
  circuitAvgFinish: number;
  circuitWins: number;
  circuitPoles: number;

  // Season form
  championshipPosition: number;
  pointsGap: number; // gap to leader

  // Team performance
  teamAvgFinish: number;
  teamReliability: number;

  // Historical at this track
  trackExperience: number; // number of races at circuit
}

// Simple ELO-style driver rating for cross-era comparison
export function calculateEloRating(
  results: Array<{ position: number; totalDrivers: number }>,
  baseRating = 1500,
  kFactor = 32
): number {
  let rating = baseRating;

  for (const result of results) {
    const { position, totalDrivers } = result;
    // Expected score based on position
    const normalizedPos = (totalDrivers - position) / (totalDrivers - 1);
    const expectedScore = 0.5; // neutral expectation
    const actualScore = normalizedPos;
    rating += kFactor * (actualScore - expectedScore);
  }

  return Math.round(rating);
}

// Feature normalization
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Build feature vector for a driver
function buildFeatureVector(features: DriverFeatures): number[] {
  return [
    normalize(features.qualifyingPosition, 1, 20),
    normalize(features.qualifyingGap, 0, 5),
    normalize(features.avgFinishLast5, 1, 20),
    normalize(features.dnfRateLast5, 0, 1),
    normalize(features.pointsLast5, 0, 130),
    normalize(features.circuitAvgFinish, 1, 20),
    normalize(features.circuitWins, 0, 10),
    normalize(features.circuitPoles, 0, 10),
    normalize(features.championshipPosition, 1, 20),
    normalize(features.pointsGap, 0, 500),
    normalize(features.teamAvgFinish, 1, 20),
    normalize(features.teamReliability, 0, 1),
    normalize(features.trackExperience, 0, 20),
  ];
}

// Train a simple neural network on historical data
export async function trainPredictionModel(
  historicalFeatures: DriverFeatures[][],
  historicalResults: number[][]
): Promise<tf.LayersModel> {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [13], units: 64, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.1 }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  // Flatten features
  const xs = historicalFeatures.flatMap(race =>
    race.map(driver => buildFeatureVector(driver))
  );
  const ys = historicalResults.flat().map(pos => (pos === 1 ? 1 : 0));

  const xTensor = tf.tensor2d(xs);
  const yTensor = tf.tensor1d(ys);

  await model.fit(xTensor, yTensor, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    verbose: 0,
  });

  xTensor.dispose();
  yTensor.dispose();

  return model;
}

// Rule-based prediction (fallback when not enough data)
export function ruleBasedPrediction(
  drivers: Array<{
    driverId: string;
    code: string;
    name: string;
    teamName: string;
    teamColor: string;
    qualPosition: number;
    recentForm: number; // avg finish last 3
    circuitHistory: number; // avg finish at circuit
    teamStrength: number; // 1-10
  }>
): DriverPrediction[] {
  // Score each driver
  const scored = drivers.map(d => {
    // Qualifying is the strongest predictor (~60% weight)
    const qualScore = (21 - d.qualPosition) * 3;

    // Recent form (~25% weight)
    const formScore = (21 - d.recentForm) * 1.25;

    // Circuit history (~10% weight)
    const circuitScore = (21 - d.circuitHistory) * 0.5;

    // Team strength (~5% weight)
    const teamScore = d.teamStrength * 0.3;

    // Add small random factor for unpredictability
    const chaos = (Math.random() - 0.5) * 2;

    const totalScore = qualScore + formScore + circuitScore + teamScore + chaos;

    return { ...d, score: totalScore };
  });

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Calculate probabilities using softmax
  const scores = scored.map(d => d.score);
  const maxScore = Math.max(...scores);
  const expScores = scores.map(s => Math.exp((s - maxScore) / 5));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probs = expScores.map(e => e / sumExp);

  return scored.map((driver, i) => {
    const winProb = probs[i];
    const podiumProb = probs.slice(0, 3).includes(probs[i])
      ? probs[i] * 2.5
      : probs.slice(0, 3).reduce((a, b) => a + b, 0) * (probs[i] / probs.slice(3).reduce((a, b) => a + b, 0));

    const keyFactors: string[] = [];
    if (driver.qualPosition <= 3) keyFactors.push(`P${driver.qualPosition} on grid`);
    if (driver.recentForm <= 3) keyFactors.push('Strong recent form');
    if (driver.circuitHistory <= 3) keyFactors.push('Circuit specialist');
    if (driver.teamStrength >= 8) keyFactors.push('Top team machinery');
    if (driver.qualPosition > 10) keyFactors.push('Grid penalty recovery needed');

    return {
      driverId: driver.driverId,
      driverCode: driver.code,
      driverName: driver.name,
      teamName: driver.teamName,
      teamColor: driver.teamColor,
      predictedPosition: i + 1,
      winProbability: Math.min(0.99, Math.max(0.01, winProb)),
      podiumProbability: Math.min(0.99, Math.max(0.01, podiumProb)),
      confidence: 0.65 + (Math.random() * 0.2),
      keyFactors: keyFactors.slice(0, 3),
    };
  });
}

// Predict race outcome from qualifying results
export function predictFromQualifying(
  qualifyingResults: Array<{
    position: number;
    driverId: string;
    code: string;
    name: string;
    teamName: string;
    teamColor: string;
    constructorId: string;
    q3Time?: string;
  }>,
  circuitStats: Record<string, { avgFinish: number; wins: number }>,
  recentForm: Record<string, number>
): DriverPrediction[] {
  const TEAM_STRENGTH: Record<string, number> = {
    red_bull: 9.5,
    ferrari: 8.8,
    mercedes: 8.5,
    mclaren: 8.7,
    aston_martin: 7.5,
    alpine: 7.0,
    williams: 6.5,
    haas: 6.0,
    rb: 6.5,
    sauber: 5.5,
  };

  const drivers = qualifyingResults.map(q => ({
    driverId: q.driverId,
    code: q.code,
    name: q.name,
    teamName: q.teamName,
    teamColor: q.teamColor,
    qualPosition: q.position,
    recentForm: recentForm[q.driverId] || 10,
    circuitHistory: circuitStats[q.driverId]?.avgFinish || 10,
    teamStrength: TEAM_STRENGTH[q.constructorId] || 6,
  }));

  return ruleBasedPrediction(drivers);
}

// Calculate driver ELO for cross-era comparison
export function calculateDriverElo(
  allResults: Array<{ position: number; totalDrivers: number; year: number }>
): { rating: number; peak: number; trajectory: number[] } {
  let rating = 1500;
  const trajectory: number[] = [];
  let peak = 1500;

  for (const result of allResults) {
    const expected = 1 / result.totalDrivers;
    const actual = result.position === 1
      ? 1
      : Math.max(0, 1 - result.position / result.totalDrivers);

    rating += 32 * (actual - expected);
    peak = Math.max(peak, rating);
    trajectory.push(Math.round(rating));
  }

  return { rating: Math.round(rating), peak: Math.round(peak), trajectory };
}

// All-time great driver ratings (pre-computed estimates)
export const LEGEND_RATINGS: Record<string, { elo: number; era: string; description: string }> = {
  hamilton: { elo: 2180, era: '2007-2023', description: '7x World Champion, all-time wins record' },
  schumacher: { elo: 2150, era: '1991-2012', description: '7x World Champion, dominated 2000-2004' },
  senna: { elo: 2100, era: '1984-1994', description: '3x Champion, greatest qualifier ever' },
  verstappen: { elo: 2120, era: '2015-present', description: '4x Champion, dominant era' },
  vettel: { elo: 2050, era: '2007-2022', description: '4x Champion, Red Bull dynasty' },
  prost: { elo: 2070, era: '1980-1993', description: '4x Champion, The Professor' },
  alonso: { elo: 2040, era: '2001-present', description: '2x Champion, greatest all-rounder' },
  lauda: { elo: 2020, era: '1971-1985', description: '3x Champion, comeback legend' },
  clark: { elo: 1980, era: '1960-1968', description: '2x Champion, the standard of his era' },
  fangio: { elo: 2200, era: '1950-1958', description: '5x Champion, era-adjusted greatest ever' },
};
