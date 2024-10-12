export interface EventData {
  event: string;
  value: string;
  pr: number;
  positionChange: number;
}

interface WorkoutResult {
  value: string;
  overallRank: number | null;
  rankChange: number | null;
}

interface Sheet {
  properties: SheetProperties;
}

interface SheetProperties {
  title: string;
}

export interface SheetsSchema {
  sheets: Sheet[];
}

export interface AthleteResult {
  id: number;
  Division: string;
  Athlete: string;
  Rank: number;
  [key: string]: any; // To handle additional columns like W1A, W1B, W2, etc.
}
