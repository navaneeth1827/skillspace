
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
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticEvent = {
        id: tempId,
        ...eventData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CalendarEvent;
      
      setEvents(prev => [...prev, optimisticEvent]);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        // Remove optimistic event on error
        setEvents(prev => prev.filter(e => e.id !== tempId));
        throw error;
      }
      
      // Replace optimistic event with real data
      setEvents(prev => prev.map(e => e.id === tempId ? (data as CalendarEvent) : e));
      
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
        prev.map(event => event.id === id ? { ...event, ...eventData, updated_at: new Date().toISOString() } : event)
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
      // Save the event before optimistic delete
      const eventToDelete = events.find(e => e.id === id);
      
      // Optimistic delete
      setEvents(prev => prev.filter(event => event.id !== id));
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        // Restore event on error
        if (eventToDelete) {
          setEvents(prev => [...prev, eventToDelete]);
        }
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      
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
              // Avoid duplicates by checking if the event is already in the list
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
  }, [user]);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
