
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Button from "@/components/Button";
import { Calendar as CalendarIcon, Clock, Plus, ArrowRight, Check, X, Trash2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectSingleEventHandler } from "react-day-picker";

// Sample events data
const initialEvents = [
  {
    id: "1",
    title: "Client Meeting - Website Redesign",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time: "10:00 AM",
    duration: "1 hour",
    type: "meeting",
    client: "Acme Corp"
  },
  {
    id: "2",
    title: "Proposal Deadline - Mobile App",
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    time: "5:00 PM",
    duration: "N/A",
    type: "deadline",
    client: "TechStart Inc"
  },
  {
    id: "3",
    title: "Weekly Team Sync",
    date: new Date(),
    time: "2:00 PM",
    duration: "30 minutes",
    type: "meeting",
    client: "Internal"
  }
];

type Event = {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  type: string;
  client: string;
};

const Calendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    time: "",
    duration: "",
    type: "meeting",
    client: ""
  });
  
  // Get events for the selected date
  const selectedDateEvents = events.filter(
    event => event.date.toDateString() === date.toDateString()
  );
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Handle date selection
  const handleDateSelect: SelectSingleEventHandler = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  // Function to add a new event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventToAdd = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9),
      date: date
    };
    
    setEvents([...events, eventToAdd as Event]);
    setIsAddingEvent(false);
    setNewEvent({
      title: "",
      date: new Date(),
      time: "",
      duration: "",
      type: "meeting",
      client: ""
    });
    
    toast({
      title: "Event added",
      description: "Your event has been successfully added to the calendar."
    });
  };
  
  // Function to delete an event
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    
    toast({
      title: "Event deleted",
      description: "The event has been removed from your calendar."
    });
  };
  
  // Helper function to generate date marker dots for the calendar
  const getDateHasEvents = (day: Date) => {
    return events.some(event => 
      event.date.getDate() === day.getDate() && 
      event.date.getMonth() === day.getMonth() && 
      event.date.getFullYear() === day.getFullYear()
    );
  };

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
                              event.type === "meeting" 
                                ? "bg-purple-400/20 text-purple-400" 
                                : "bg-indigo-400/20 text-indigo-400"
                            }>
                              {event.type === "meeting" ? "Meeting" : "Deadline"}
                            </Badge>
                            <span className="ml-3 text-sm text-white/60">{event.time}</span>
                          </div>
                          <h3 className="font-medium mt-1">{event.title}</h3>
                          <p className="text-sm text-white/70">
                            Client: {event.client} {event.duration && `• ${event.duration}`}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-white/50 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
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
                          <span className="text-sm font-medium">{format(event.date, "MMM")}</span>
                          <span className="text-lg font-bold">{format(event.date, "d")}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="flex items-center text-sm text-white/60 mt-1">
                            <Clock size={12} className="mr-1" />
                            <span>{event.time}</span>
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
                      <span>Client Meetings</span>
                    </div>
                    <Badge className="bg-purple-400/20 text-purple-400">
                      {events.filter(e => e.type === "meeting").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-md bg-indigo-400/10">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-400 mr-3"></div>
                      <span>Deadlines</span>
                    </div>
                    <Badge className="bg-indigo-400/20 text-indigo-400">
                      {events.filter(e => e.type === "deadline").length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  <label className="text-sm font-medium">Event Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      placeholder="e.g. 3:00 PM"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      value={newEvent.duration}
                      onChange={e => setNewEvent({...newEvent, duration: e.target.value})}
                      placeholder="e.g. 1 hour"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Client/Company</label>
                  <Input
                    value={newEvent.client}
                    onChange={e => setNewEvent({...newEvent, client: e.target.value})}
                    placeholder="Enter client or company name"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Tabs defaultValue="meeting" className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger 
                        value="meeting"
                        onClick={() => setNewEvent({...newEvent, type: "meeting"})}
                      >
                        Meeting
                      </TabsTrigger>
                      <TabsTrigger 
                        value="deadline"
                        onClick={() => setNewEvent({...newEvent, type: "deadline"})}
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
      
      <FooterSection />
    </div>
  );
};

export default Calendar;
