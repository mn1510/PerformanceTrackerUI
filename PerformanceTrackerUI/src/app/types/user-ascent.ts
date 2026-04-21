export interface UserAscent {
  id: number;
  cognito_sub: string;
  eight_a_username?: string;
  route_id?: number;
  source: string;
  eight_a_ascent_id?: string;
  route_name?: string;
  grade?: string;
  grade_index?: number;
  ascent_type?: string;
  date?: string;
  tries?: number;
  score?: number;
  safety?: number;
  comment?: string;
  rating?: number;
  recommended?: boolean;
  crag_name?: string;
  country_slug?: string;
  is_repeat?: boolean;
  is_first_ascent?: boolean;
  raw_data?: Record<string, any>;
  custom_data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserAscentQueryParams {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  grade?: string;
  ascent_type?: string;
  crag_name?: string;
}
