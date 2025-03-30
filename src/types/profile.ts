
export interface ProfileData {
  id: string;
  full_name: string;
  title?: string;
  location?: string;
  bio?: string;
  hourly_rate?: number;
  skills: string[];
  avatar_url?: string | null;
  user_type: string;
  company_name?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary: string;
  category: string;
  description: string;
  skills: string[];
  recruiter_id?: string;
  status?: string;
  budget_min?: number;
  budget_max?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year_range: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewItem {
  id: string;
  client_id: string;
  freelancer_id: string;
  job_title: string;
  rating: number;
  review_text?: string;
  completed_date?: string;
  created_at?: string;
  client_name?: string;
  client_avatar?: string;
}
