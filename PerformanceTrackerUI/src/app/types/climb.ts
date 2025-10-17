export enum ClimbingType {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR'
}

export enum Discipline {
  SPORT = 'SPORT',
  BOULDERING = 'BOULDERING'
}

export enum Outcome {
  ONSIGHT = 'ONSIGHT',      // Completed on first attempt without prior knowledge
  FLASH = 'FLASH',          // Completed on first attempt with beta
  REDPOINT = 'REDPOINT',    // Completed after multiple attempts (2+)
  PROJECT = 'PROJECT'       // Not yet completed, still working on it
}

export interface Climb {
  id: string;
  date: Date | string;
  location: string;
  climbingType: ClimbingType;
  discipline: Discipline;
  rockType?: string;
  incline?: number;
  holdType?: string;
  setter?: string;
  attemptNumber: number;
  outcome: Outcome;
  effort: number; // 1-10
  overgripping: boolean;
  inefficientClips: boolean;
  routeReadingIssues: boolean;
  learnings?: string;
  comments?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
