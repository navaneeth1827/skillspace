
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
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
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
        "h-full min-h-[100px] p-1 border border-border relative",
        isToday(date) && "bg-accent/20",
        props.className
      )}
    >
      <div className="flex justify-between mb-2">
        <span className={cn(
          "text-sm font-medium",
          isToday(date) && "text-primary"
        )}>
          {format(date, 'd')}
        </span>
        {onAddEvent && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={(e) => {
              e.stopPropagation();
              onAddEvent();
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {dayEvents.slice(0, 3).map(event => (
          <div 
            key={event.id} 
            className={cn(
              "text-xs p-1 rounded truncate",
              event.event_type === 'meeting' && "bg-blue-500/20 text-blue-700",
              event.event_type === 'personal' && "bg-green-500/20 text-green-700",
              event.event_type === 'work' && "bg-purple-500/20 text-purple-700",
              event.event_type === 'holiday' && "bg-red-500/20 text-red-700",
              event.event_type === 'general' && "bg-gray-500/20 text-gray-700"
            )}
          >
            {event.title}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="text-xs text-muted-foreground">
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
      startTime: event.is_all_day ? undefined : format(startDate, 'HH:mm'),
      endDate: endDate,
      endTime: event.is_all_day ? undefined : format(endDate, 'HH:mm'),
      location: event.location || '',
      isAllDay: event.is_all_day,
      eventType: event.event_type,
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
      <div className="container py-8 pt-44">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{format(currentDate, 'MMMM yyyy')}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prevMonth = new Date(currentDate);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setCurrentDate(prevMonth);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setCurrentDate(today);
                      setSelected(today);
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
                    Next
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-[600px]">
                  Loading calendar...
                </div>
              ) : (
                <CalendarComponent
                  mode="single"
                  selected={selected}
                  onSelect={handleDayClick}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  components={customDayRenderer}
                  className="w-full h-[600px]"
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {selected ? format(selected, 'MMMM d, yyyy') : 'Events'}
              </CardTitle>
              <CardDescription>
                {selected && (
                  <span>
                    {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!selected ? (
                  <div className="text-center text-muted-foreground">
                    Select a day to see events
                  </div>
                ) : selectedDayEvents.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No events for this day
                    <div className="mt-2">
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
                    <Card key={event.id} className="overflow-hidden">
                      <div
                        className={cn(
                          "h-1",
                          event.event_type === 'meeting' && "bg-blue-500",
                          event.event_type === 'personal' && "bg-green-500",
                          event.event_type === 'work' && "bg-purple-500",
                          event.event_type === 'holiday' && "bg-red-500",
                          event.event_type === 'general' && "bg-gray-500"
                        )}
                      />
                      <CardContent className="p-3">
                        <div className="font-medium">
                          {event.title}
                          <Badge 
                            variant="outline" 
                            className="ml-2 text-xs"
                          >
                            {event.event_type}
                          </Badge>
                        </div>
                        
                        {!event.is_all_day && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="text-xs mt-1">
                            📍 {event.location}
                          </div>
                        )}
                        
                        {event.description && (
                          <div className="text-sm mt-2 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                        
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
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
