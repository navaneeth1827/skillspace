
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  job_type: string;
  salary: string;
  category: string;
  skills: string[];
  recruiter_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  skills_required?: string[];
  budget?: number;
  recruiter_info?: {
    full_name: string;
    avatar_url: string;
    title: string;
  };
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  cover_letter: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  user_info: {
    full_name: string;
    avatar_url: string;
    title: string;
  };
}
