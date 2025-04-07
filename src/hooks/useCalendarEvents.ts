
import { useState, useEffect } from 'react';
import { supabase, CalendarEvent } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all events for the current user
  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setEvents(data as CalendarEvent[]);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new event
  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add to local state for immediate UI update
      setEvents(prev => [...prev, data as CalendarEvent]);
      
      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create calendar event',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    if (!user) return false;
    
    try {
      // Optimistic update
      setEvents(prev => 
        prev.map(event => event.id === id ? { ...event, ...eventData } : event)
      );
      
      const { error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      
      // Revert optimistic update
      fetchEvents();
      
      toast({
        title: 'Error',
        description: 'Failed to update calendar event',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    if (!user) return false;
    
    try {
      // Optimistic delete
      setEvents(prev => prev.filter(event => event.id !== id));
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      
      // Revert optimistic delete
      fetchEvents();
      
      toast({
        title: 'Error',
        description: 'Failed to delete calendar event',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      
      // Set up real-time subscription for calendar events
      const channel = supabase
        .channel('calendar_events_channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Calendar event change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newEvent = payload.new as CalendarEvent;
            setEvents(prev => {
              if (prev.some(event => event.id === newEvent.id)) return prev;
              return [...prev, newEvent];
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedEvent = payload.new as CalendarEvent;
            setEvents(prev => 
              prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
            );
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedEventId = payload.old.id;
            setEvents(prev => prev.filter(event => event.id !== deletedEventId));
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
