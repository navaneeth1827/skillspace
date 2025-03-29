
export interface ProfileData {
  id: string;
  full_name: string;
  title?: string; // Added title property
  location?: string;
  bio?: string;
  hourly_rate?: number;
  skills?: string[];
  avatar_url?: string;
  user_type: string;
  company_name?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}
