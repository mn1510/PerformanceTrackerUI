export interface RedpointData {
  count: number;
  total_attempts: number;
}

export interface PyramidGradeRow {
  grade: string;
  grade_index: number;
  onsights: number;
  flashes: number;
  redpoints: RedpointData;
}

export interface PyramidMetadata {
  total_ascents: number;
  date_range?: {
    from: string | null;
    to: string | null;
  };
  filters_applied: {
    country?: string;
  };
}

export interface PyramidResponse {
  pyramid: PyramidGradeRow[];
  metadata: PyramidMetadata;
}

export interface PyramidFilters {
  country_slug: string;
  date_from: string;
  date_to: string;
}

export interface PyramidInstance {
  id: string;
  filters: PyramidFilters;
  data: PyramidResponse | null;
  loading: boolean;
  error: string | null;
}

export interface Country {
  slug: string;
  name: string;
  ascent_count: number;
}
