export type ProfileData = {
  full_name: string;
  title?: string;
  location?: string;
  bio?: string;
  hourly_rate?: number;
  skills?: string[] | string;
  avatar_url?: string | null;
  user_type?: string;
  company_name?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  id?: string;
};

export type PortfolioItem = {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
};

export type ExperienceItem = {
  id?: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date?: string;
  description: string;
};

export type EducationItem = {
  id?: string;
  degree: string;
  school: string;
  year_range: string;
};

export type ReviewItem = {
  id?: string;
  job_title: string;
  client_id: string;
  client_name?: string;
  rating: number;
  review_text: string;
  completed_date: string;
};

