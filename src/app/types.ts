export interface EventData {
  event: string;
  value: string;
  pr: number;
  positionChange: number;
}

export interface Player {
  id: number;
  name: string;
  gender: string;
  total: number;
  events: EventData[];
}

export interface SheetData {
  headers: string[];
  data: Player[];
}
