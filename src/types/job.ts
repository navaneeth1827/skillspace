
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
  requirements?: string;
  application_instructions?: string;
  visibility?: string;
  application_count?: number;
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
  resume_url?: string;
  portfolio_url?: string;
  availability_date?: string;
  expected_salary?: string;
  interview_date?: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  status: string;
  notes?: string;
  changed_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  project?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_all_day: boolean;
  event_type: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
