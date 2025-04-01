import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Button from "@/components/Button";
import { Calendar as CalendarIcon, Clock, Plus, X, Trash2, Edit } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectSingleEventHandler } from "react-day-picker";
import { supabase, CalendarEvent } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Calendar = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: "10:00",
    location: "",
    eventType: "meeting",
    isAllDay: false
  });
  
  // Fetch events from database
  useEffect(() => {
    if (!user) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setEvents(data as CalendarEvent[]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
    
    // Set up real-time subscription for events
    const eventsChannel = supabase
      .channel('calendar_events_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // Handle different events
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [...prev, payload.new as CalendarEvent]);
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(event => 
            event.id === (payload.new as CalendarEvent).id ? (payload.new as CalendarEvent) : event
          ));
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(event => event.id !== (payload.old as CalendarEvent).id));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [user, toast]);
  
  // Get events for the selected date
  const selectedDateEvents = events.filter(
    event => {
      const eventDate = new Date(event.start_time).toDateString();
      return eventDate === date.toDateString();
    }
  );
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start_time);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  // Handle date selection
  const handleDateSelect: SelectSingleEventHandler = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  // Format date and time for display
  const formatEventTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };
  
  // Format date for display
  const formatEventDate = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return timeString;
    }
  };
  
  // Combine date and time into ISO string
  const combineDateAndTime = (dateStr: string, timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(dateStr);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };
  
  // Function to add a new event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add events."
      });
      return;
    }
    
    try {
      const startDateTime = combineDateAndTime(newEvent.startDate, newEvent.startTime);
      const endDateTime = combineDateAndTime(newEvent.endDate, newEvent.endTime);
      
      const eventToAdd = {
        title: newEvent.title,
        description: newEvent.description || null,
        start_time: startDateTime,
        end_time: endDateTime,
        location: newEvent.location || null,
        is_all_day: newEvent.isAllDay,
        event_type: newEvent.eventType,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('calendar_events')
        .insert(eventToAdd);
      
      if (error) throw error;
      
      setIsAddingEvent(false);
      resetEventForm();
      
      toast({
        title: "Event added",
        description: "Your event has been successfully added to the calendar."
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to edit an event
  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !currentEvent) return;
    
    try {
      const startDateTime = combineDateAndTime(newEvent.startDate, newEvent.startTime);
      const endDateTime = combineDateAndTime(newEvent.endDate, newEvent.endTime);
      
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: newEvent.title,
          description: newEvent.description || null,
          start_time: startDateTime,
          end_time: endDateTime,
          location: newEvent.location || null,
          is_all_day: newEvent.isAllDay,
          event_type: newEvent.eventType
        })
        .eq('id', currentEvent.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setIsEditingEvent(false);
      setCurrentEvent(null);
      resetEventForm();
      
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to delete an event
  const handleDeleteEvent = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Event deleted",
        description: "The event has been removed from your calendar."
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Open edit event modal
  const openEditModal = (event: CalendarEvent) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    
    setCurrentEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      startDate: format(startDate, "yyyy-MM-dd"),
      startTime: format(startDate, "HH:mm"),
      endDate: format(endDate, "yyyy-MM-dd"),
      endTime: format(endDate, "HH:mm"),
      location: event.location || "",
      eventType: event.event_type,
      isAllDay: event.is_all_day
    });
    setIsEditingEvent(true);
  };
  
  // Reset the event form
  const resetEventForm = () => {
    setNewEvent({
      title: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endDate: format(new Date(), "yyyy-MM-dd"),
      endTime: "10:00",
      location: "",
      eventType: "meeting",
      isAllDay: false
    });
  };
  
  // Helper function to generate date marker dots for the calendar
  const getDateHasEvents = (day: Date) => {
    return events.some(event => 
      new Date(event.start_time).getDate() === day.getDate() && 
      new Date(event.start_time).getMonth() === day.getMonth() && 
      new Date(event.start_time).getFullYear() === day.getFullYear()
    );
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-4">Calendar</h1>
            <p>Please sign in to view your calendar.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-white/70">Manage your schedule and deadlines</p>
            </div>
            <Button onClick={() => setIsAddingEvent(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p>Loading your calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-6">
                <div className="mb-6">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="p-3 pointer-events-auto rounded-md border border-white/10"
                    modifiers={{
                      booked: (day) => getDateHasEvents(day)
                    }}
                    modifiersStyles={{
                      booked: {
                        fontWeight: "bold",
                        borderWidth: "2px",
                        backgroundColor: "rgba(155, 135, 245, 0.15)",
                        borderColor: "rgba(155, 135, 245, 0.5)"
                      }
                    }}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium">
                      Events for {format(date, "MMMM d, yyyy")}
                    </h2>
                  </div>
                  
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map(event => (
                        <div key={event.id} className="glass-card p-4 flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <Badge className={
                                event.event_type === "meeting" 
                                  ? "bg-purple-400/20 text-purple-400" 
                                  : "bg-indigo-400/20 text-indigo-400"
                              }>
                                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                              </Badge>
                              <span className="ml-3 text-sm text-white/60">
                                {event.is_all_day ? 'All day' : 
                                  `${formatEventTime(event.start_time)} - ${formatEventTime(event.end_time)}`}
                              </span>
                            </div>
                            <h3 className="font-medium mt-1">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-white/70">{event.description}</p>
                            )}
                            {event.location && (
                              <p className="text-sm text-white/70 mt-1">
                                Location: {event.location}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEditModal(event)}
                              className="text-white/50 hover:text-white"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-white/50 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 glass-card">
                      <CalendarIcon className="mx-auto h-12 w-12 text-white/30 mb-3" />
                      <h3 className="text-lg font-medium">No events scheduled</h3>
                      <p className="text-white/60 mt-1 mb-4">
                        There are no events scheduled for this date.
                      </p>
                      <Button size="sm" onClick={() => setIsAddingEvent(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="glass-card p-6 mb-6">
                  <h2 className="text-xl font-medium mb-4">Upcoming Events</h2>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map(event => (
                        <div key={event.id} className="flex items-start space-x-3 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                          <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-md bg-purple-900/50">
                            <span className="text-sm font-medium">{format(new Date(event.start_time), "MMM")}</span>
                            <span className="text-lg font-bold">{format(new Date(event.start_time), "d")}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center text-sm text-white/60 mt-1">
                              <Clock size={12} className="mr-1" />
                              <span>
                                {event.is_all_day ? 'All day' : formatEventTime(event.start_time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-center py-4">
                      No upcoming events in the next 7 days.
                    </p>
                  )}
                </div>
                
                <div className="glass-card p-6">
                  <h2 className="text-xl font-medium mb-4">Event Types</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-md bg-purple-400/10">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-400 mr-3"></div>
                        <span>Meetings</span>
                      </div>
                      <Badge className="bg-purple-400/20 text-purple-400">
                        {events.filter(e => e.event_type === "meeting").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-indigo-400/10">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-400 mr-3"></div>
                        <span>Deadlines</span>
                      </div>
                      <Badge className="bg-indigo-400/20 text-indigo-400">
                        {events.filter(e => e.event_type === "deadline").length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Add Event Dialog */}
      {isAddingEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Add New Event</h2>
              <button 
                onClick={() => setIsAddingEvent(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Title</label>
                  <Input
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Enter event title"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Enter event description"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Location (Optional)</label>
                  <Input
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Enter location"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={newEvent.isAllDay}
                    onChange={e => setNewEvent({...newEvent, isAllDay: e.target.checked})}
                    className="mr-1"
                  />
                  <label htmlFor="isAllDay" className="text-sm font-medium">All-day event</label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={newEvent.startDate}
                      onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                      className="mt-1"
                      required
                    />
                  </div>
                  {!newEvent.isAllDay && (
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="time"
                        value={newEvent.startTime}
                        onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                      className="mt-1"
                      required
                    />
                  </div>
                  {!newEvent.isAllDay && (
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="time"
                        value={newEvent.endTime}
                        onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Tabs defaultValue={newEvent.eventType} className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger 
                        value="meeting"
                        onClick={() => setNewEvent({...newEvent, eventType: "meeting"})}
                      >
                        Meeting
                      </TabsTrigger>
                      <TabsTrigger 
                        value="deadline"
                        onClick={() => setNewEvent({...newEvent, eventType: "deadline"})}
                      >
                        Deadline
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAddingEvent(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Event
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Event Dialog */}
      {isEditingEvent && currentEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Edit Event</h2>
              <button 
                onClick={() => {
                  setIsEditingEvent(false);
                  setCurrentEvent(null);
                }}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditEvent}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Title</label>
                  <Input
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Enter event title"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Enter event description"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Location (Optional)</label>
                  <Input
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Enter location"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={newEvent.isAllDay}
                    onChange={e => setNewEvent({...newEvent, isAllDay: e.target.checked})}
                    className="mr-1"
                  />
                  <label htmlFor="isAllDay" className="text-sm font-medium">All-day event</label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={newEvent.startDate}
                      onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                      className="mt-1"
                      required
                    />
                  </div>
                  {!newEvent.isAllDay && (
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="time"
                        value={newEvent.startTime}
                        onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                      className="mt-1"
                      required
                    />
                  </div>
                  {!newEvent.isAllDay && (
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="time"
                        value={newEvent.endTime}
                        onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Tabs value={newEvent.eventType} className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger 
                        value="meeting"
                        onClick={() => setNewEvent({...newEvent, eventType: "meeting"})}
                      >
                        Meeting
                      </TabsTrigger>
                      <TabsTrigger 
                        value="deadline"
                        onClick={() => setNewEvent({...newEvent, eventType: "deadline"})}
                      >
                        Deadline
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setIsEditingEvent(false);
                      setCurrentEvent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <FooterSection />
    </div>
  );
};

export default Calendar;
