import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, isToday, isSameMonth, addDays } from 'date-fns';
import Navbar from "@/components/Navbar";
import {
  Calendar as CalendarComponent,
  CalendarProps,
} from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/integrations/supabase/client';
import CalendarEventForm from '@/components/CalendarEventForm';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CalendarDayProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date;
  events: CalendarEvent[];
  onAddEvent?: () => void;
}

// Component for displaying events on a calendar day
const CalendarDay = ({ date, events, onAddEvent, ...props }: CalendarDayProps) => {
  const dayEvents = events.filter(event => {
    const startDate = parseISO(event.start_time);
    return format(startDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  return (
    <div
      className={cn(
        "h-full p-1 relative",
        isToday(date) && "bg-accent/20",
        props.className
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn(
          "inline-block h-7 w-7 text-sm pt-1.5 rounded-full",
          isToday(date) && "bg-primary text-primary-foreground font-bold"
        )}>
          {format(date, 'd')}
        </span>
        {onAddEvent && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onAddEvent();
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="space-y-1 mt-1">
        {dayEvents.map(event => (
          <div 
            key={event.id} 
            className={cn(
              "text-xs px-1 py-0.5 rounded-sm truncate cursor-pointer hover:opacity-80 transition-opacity",
              event.event_type === 'meeting' && "bg-blue-500/30 text-blue-700 border-l-2 border-blue-500",
              event.event_type === 'personal' && "bg-green-500/30 text-green-700 border-l-2 border-green-500",
              event.event_type === 'work' && "bg-purple-500/30 text-purple-700 border-l-2 border-purple-500",
              event.event_type === 'holiday' && "bg-red-500/30 text-red-700 border-l-2 border-red-500",
              event.event_type === 'general' && "bg-gray-500/30 text-gray-700 border-l-2 border-gray-500"
            )}
            title={`${event.title}${event.location ? ` (${event.location})` : ''}`}
          >
            {!event.is_all_day && (
              <span className="text-[10px] opacity-70 mr-1">{format(parseISO(event.start_time), 'h:mm a')}</span>
            )}
            <span className="font-medium truncate">{event.title}</span>
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="text-[10px] text-muted-foreground text-center bg-accent/30 rounded-sm px-1">
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

const Calendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();

  // Custom day renderer for the calendar
  const customDayRenderer: CalendarProps["components"] = {
    Day: (props) => {
      // Skip rendering for dates outside the current month
      if (!isSameMonth(props.date, currentDate)) {
        return null;
      }
      
      return (
        <CalendarDay
          date={props.date}
          events={events}
          onAddEvent={() => {
            setSelected(props.date);
            setDialogOpen(true);
          }}
          {...props}
        />
      );
    }
  };

  const handleDayClick = (date: Date) => {
    setSelected(date);
    
    // Filter events for the selected day
    const dayEvents = events.filter(event => {
      const startDate = parseISO(event.start_time);
      return format(startDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
    
    setSelectedDayEvents(dayEvents);
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const startDateTime = values.isAllDay 
        ? new Date(values.startDate).toISOString()
        : new Date(
            values.startDate.getFullYear(),
            values.startDate.getMonth(),
            values.startDate.getDate(),
            ...(values.startTime ? values.startTime.split(':').map(Number) : [0, 0])
          ).toISOString();
      
      const endDateTime = values.isAllDay 
        ? addDays(new Date(values.endDate), 1).toISOString() // End of the day
        : new Date(
            values.endDate.getFullYear(),
            values.endDate.getMonth(),
            values.endDate.getDate(),
            ...(values.endTime ? values.endTime.split(':').map(Number) : [0, 0])
          ).toISOString();
      
      const eventData = {
        title: values.title,
        description: values.description || null,
        start_time: startDateTime,
        end_time: endDateTime,
        location: values.location || null,
        is_all_day: values.isAllDay,
        event_type: values.eventType,
      };
      
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
        toast({
          title: "Event updated",
          description: "Calendar event has been updated successfully",
        });
      } else {
        await createEvent(eventData);
        toast({
          title: "Event created",
          description: "New calendar event has been created",
        });
      }
      
      setDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save calendar event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    // Parse dates from ISO strings
    const startDate = parseISO(event.start_time);
    const endDate = parseISO(event.end_time);
    
    // Set default form values with the event data
    const defaultValues = {
      title: event.title,
      description: event.description || '',
      startDate: startDate,
      startTime: !selectedEvent.is_all_day 
        ? format(parseISO(event.start_time), 'HH:mm') 
        : undefined,
      endDate: endDate,
      endTime: !selectedEvent.is_all_day 
        ? format(parseISO(event.end_time), 'HH:mm') 
        : undefined,
      location: event.location || '',
      isAllDay: selectedEvent.is_all_day,
      eventType: selectedEvent.event_type,
    };
    
    setDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
      toast({
        title: "Event deleted",
        description: "Calendar event has been deleted",
      });
    }
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 pt-44">
          <h1 className="text-2xl font-bold mb-6">Calendar</h1>
          <p>Please sign in to view your calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-full py-8 pt-44 px-0">
        <div className="flex justify-between items-center mb-6 px-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevMonth = new Date(currentDate);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentDate(prevMonth);
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelected(today);
                handleDayClick(today);
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentDate(nextMonth);
              }}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setSelectedEvent(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedEvent ? "Edit Event" : "Add New Event"}
                  </DialogTitle>
                </DialogHeader>
                <CalendarEventForm
                  onSubmit={handleSubmit}
                  isLoading={isSubmitting}
                  defaultValues={selectedEvent ? {
                    title: selectedEvent.title,
                    description: selectedEvent.description || '',
                    startDate: parseISO(selectedEvent.start_time),
                    startTime: !selectedEvent.is_all_day 
                      ? format(parseISO(selectedEvent.start_time), 'HH:mm') 
                      : undefined,
                    endDate: parseISO(selectedEvent.end_time),
                    endTime: !selectedEvent.is_all_day 
                      ? format(parseISO(selectedEvent.end_time), 'HH:mm') 
                      : undefined,
                    location: selectedEvent.location || '',
                    isAllDay: selectedEvent.is_all_day,
                    eventType: selectedEvent.event_type,
                  } : {
                    startDate: selected,
                    endDate: selected,
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6">
          <Card className="lg:col-span-10 shadow-lg border-0 rounded-none">
            <CardHeader className="pb-0 border-b">
              <CardTitle className="text-xl text-center">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 w-full">
              {loading ? (
                <div className="flex justify-center items-center h-[800px]">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
                    <p>Loading calendar...</p>
                  </div>
                </div>
              ) : (
                <CalendarComponent
                  mode="single"
                  selected={selected}
                  onSelect={handleDayClick}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  components={customDayRenderer}
                  className="w-full overflow-auto border-none"
                  fixedWeeks
                />
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm shadow-lg lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <CardHeader className="bg-card/70">
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {selected ? format(selected, 'MMMM d, yyyy') : 'Events'}
              </CardTitle>
              <CardDescription>
                {selected && (
                  <span className={cn(
                    "inline-block",
                    isToday(selected) && "bg-primary/20 px-2 py-0.5 rounded-full text-primary"
                  )}>
                    {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
                    {isToday(selected) && " • Today"}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!selected ? (
                  <div className="text-center text-muted-foreground p-8">
                    <CalendarIcon className="mx-auto h-10 w-10 mb-3 opacity-50" />
                    <p>Select a day to see events</p>
                  </div>
                ) : selectedDayEvents.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    <div className="mx-auto h-10 w-10 border-2 border-dashed border-muted-foreground/50 rounded-full flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 opacity-50" />
                    </div>
                    <p>No events for this day</p>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  </div>
                ) : (
                  selectedDayEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div
                        className={cn(
                          "h-2",
                          event.event_type === 'meeting' && "bg-blue-500",
                          event.event_type === 'personal' && "bg-green-500",
                          event.event_type === 'work' && "bg-purple-500",
                          event.event_type === 'holiday' && "bg-red-500",
                          event.event_type === 'general' && "bg-gray-500"
                        )}
                      />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-base">
                            {event.title}
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "ml-2 text-xs",
                                event.event_type === 'meeting' && "text-blue-500 border-blue-200 bg-blue-50/30",
                                event.event_type === 'personal' && "text-green-500 border-green-200 bg-green-50/30",
                                event.event_type === 'work' && "text-purple-500 border-purple-200 bg-purple-50/30",
                                event.event_type === 'holiday' && "text-red-500 border-red-200 bg-red-50/30",
                                event.event_type === 'general' && "text-gray-500 border-gray-200 bg-gray-50/30"
                              )}
                            >
                              {event.event_type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-3 text-sm text-muted-foreground">
                          <span className="inline-block w-3 h-3 rounded-full mr-2 bg-primary/30"></span>
                          {event.is_all_day ? (
                            <span>All day</span>
                          ) : (
                            <span>{format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}</span>
                          )}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-sm mt-2 text-muted-foreground">
                            <span className="inline-block w-3 h-3 rounded-full mr-2 bg-accent"></span>
                            {event.location}
                          </div>
                        )}
                        
                        {event.description && (
                          <div className="text-sm mt-3 border-t pt-2 border-border/50 line-clamp-2 text-muted-foreground">
                            {event.description}
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleEditEvent(event)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50/10"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
