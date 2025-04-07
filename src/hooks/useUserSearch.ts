
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';

export const useUserSearch = () => {
  const [searchResults, setSearchResults] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,title.ilike.%${query}%,company_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        throw error;
      }

      setSearchResults(data as ProfileData[]);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    searchUsers,
    clearResults: () => setSearchResults([])
  };
};
