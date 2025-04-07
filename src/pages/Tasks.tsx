import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Task } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from "@/components/Navbar";
import { CalendarIcon, CheckCheck, ListChecks, LucideIcon, Plus, Search, Timer, User2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface TaskPriority {
  value: "low" | "medium" | "high"
  label: string
}

interface TaskStatus {
  value: "todo" | "in-progress" | "completed"
  label: string
}

const priorityOptions: TaskPriority[] = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
]

const statusOptions: TaskStatus[] = [
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in-progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
]

const filterOptions = [
  {
    label: "All",
    value: "all",
    icon: ListChecks,
  },
  {
    label: "Todo",
    value: "todo",
    icon: Timer,
  },
  {
    label: "In Progress",
    value: "in-progress",
    icon: CalendarIcon,
  },
  {
    label: "Completed",
    value: "completed",
    icon: CheckCheck,
  },
  {
    label: "High Priority",
    value: "high",
    icon: User2,
  },
]

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Task title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]).default("low"),
  status: z.enum(["todo", "in-progress", "completed"]).default("todo"),
  project: z.string().optional(),
})

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: date,
      priority: "low",
      status: "todo",
      project: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create tasks',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...values,
          user_id: user.id,
          due_date: values.dueDate?.toISOString() || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Task created',
        description: 'Your task has been created successfully'
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Task creation failed',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setTasks(data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();

    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Real-time task update received:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newTask = payload.new as Task;
          console.log('Adding new task to state:', newTask);
          
          setTasks(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
          });
          
          if (matchesFilter(newTask, filter)) {
            setFilteredTasks(prev => {
              if (prev.some(t => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          }
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedTask = payload.new as Task;
          console.log('Updating task in state:', updatedTask);
          
          setTasks(prev => 
            prev.map(task => task.id === updatedTask.id ? updatedTask : task)
          );
          
          if (matchesFilter(updatedTask, filter)) {
            setFilteredTasks(prev => {
              if (prev.some(t => t.id === updatedTask.id)) {
                return prev.map(task => task.id === updatedTask.id ? updatedTask : task);
              }
              return [updatedTask, ...prev];
            });
          } else {
            setFilteredTasks(prev => prev.filter(task => task.id !== updatedTask.id));
          }
        } 
        else if (payload.eventType === 'DELETE') {
          const deletedTask = payload.old as Task;
          console.log('Removing deleted task from state:', deletedTask);
          
          setTasks(prev => prev.filter(task => task.id !== deletedTask.id));
          setFilteredTasks(prev => prev.filter(task => task.id !== deletedTask.id));
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
    
    return () => {
      console.log('Unsubscribing from tasks channel');
      supabase.removeChannel(tasksChannel);
    };
  }, [user, toast, filter]);

  const matchesFilter = (task: Task, currentFilter: string): boolean => {
    switch (currentFilter) {
      case 'all':
        return true;
      case 'completed':
        return task.status === 'completed';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'todo':
        return task.status === 'todo';
      case 'high':
        return task.priority === 'high';
      default:
        return true;
    }
  };

  useEffect(() => {
    let newFilteredTasks = [...tasks];

    if (search) {
      newFilteredTasks = newFilteredTasks.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (filter !== 'all') {
      newFilteredTasks = newFilteredTasks.filter(task => {
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'in-progress') return task.status === 'in-progress';
        if (filter === 'todo') return task.status === 'todo';
        if (filter === 'high') return task.priority === 'high';
        return true;
      });
    }

    setFilteredTasks(newFilteredTasks);
  }, [tasks, search, filter]);

  const updateTaskStatus = async (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 pt-44">
          <h1 className="text-2xl font-bold mb-6">Tasks</h1>
          <p>Please sign in to view your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-44">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
                <DialogDescription>
                  Create a new task to keep track of your work
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Task description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select a due date for the task.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between gap-2">
                    <FormField
                      control={form.control}
                      name="priority"
                      defaultValue="low"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorityOptions.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      defaultValue="todo"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <FormControl>
                          <Input placeholder="Project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Here&apos;s a list of your tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading tasks...
                        </TableCell>
                      </TableRow>
                    ) : filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No tasks found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                task.priority === "low" && "bg-green-500/10 text-green-500",
                                task.priority === "medium" && "bg-yellow-500/10 text-yellow-500",
                                task.priority === "high" && "bg-red-500/10 text-red-500"
                              )}
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                task.status === "todo" && "bg-sky-500/10 text-sky-500",
                                task.status === "in-progress" && "bg-orange-500/10 text-orange-500",
                                task.status === "completed" && "bg-emerald-500/10 text-emerald-500"
                              )}
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select onValueChange={(value: "todo" | "in-progress" | "completed") => updateTaskStatus(task.id, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">Todo</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter tasks by status or priority.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setFilter(option.value)}
                >
                  <option.icon className="mr-2 h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
