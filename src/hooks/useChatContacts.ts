
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';

export const useChatContacts = () => {
  const [contacts, setContacts] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First, get all unique users who have communicated with the current user
        const { data, error } = await supabase
          .from('chat_messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Extract unique user IDs
          const contactIds = new Set<string>();
          
          data.forEach(msg => {
            if (msg.sender_id === user.id) {
              contactIds.add(msg.receiver_id);
            } else {
              contactIds.add(msg.sender_id);
            }
          });

          // Fetch profile details for all contacts
          const contactsData = await Promise.all(
            Array.from(contactIds).map(async (id) => {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
              
              return data as ProfileData;
            })
          );

          // Filter out null values
          setContacts(contactsData.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();

    // Set up real-time subscription for new messages
    if (user) {
      const channel = supabase
        .channel('contacts_realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(sender_id=eq.${user.id},receiver_id=eq.${user.id})`
        }, () => {
          // Refresh contacts when a new message is received
          fetchContacts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    contacts,
    loading,
    error
  };
};
