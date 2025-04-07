
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Task } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from "@/components/Navbar";
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as z from "zod";
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import TaskFilters from '@/components/TaskFilters';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Task title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]).default("low"),
  status: z.enum(["todo", "in-progress", "completed"]).default("todo"),
  project: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create tasks',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert date to ISO string if it exists
      const dueDate = values.dueDate ? values.dueDate.toISOString() : null;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: values.title,
          description: values.description || null,
          user_id: user.id,
          due_date: dueDate,
          priority: values.priority,
          status: values.status,
          project: values.project || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Manually add the new task to the state for immediate UI update
      setTasks(prevTasks => [data as Task, ...prevTasks]);

      toast({
        title: 'Task created',
        description: 'Your task has been created successfully'
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Task creation failed',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('tasks-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Real-time task update received:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newTask = payload.new as Task;
          
          // Only add if not already in state
          setTasks(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
          });
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedTask = payload.new as Task;
          
          setTasks(prev => 
            prev.map(task => task.id === updatedTask.id ? updatedTask : task)
          );
        } 
        else if (payload.eventType === 'DELETE') {
          const deletedTaskId = payload.old.id;
          
          setTasks(prev => prev.filter(task => task.id !== deletedTaskId));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...tasks];

    if (search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(task => {
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'in-progress') return task.status === 'in-progress';
        if (filter === 'todo') return task.status === 'todo';
        if (filter === 'high') return task.priority === 'high';
        return true;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, search, filter]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    try {
      // Optimistically update the UI
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      
      // Revert optimistic update in case of error
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (data) {
        setTasks(prev =>
          prev.map(task => task.id === taskId ? data as Task : task)
        );
      }
      
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistically remove from UI
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Task deleted",
        description: "Task has been permanently removed",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      
      // Reload tasks in case of error
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setTasks(data as Task[]);
      }
      
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
              <TaskForm
                onSubmit={onSubmit}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Here's a list of your tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={filteredTasks}
                isLoading={isLoading}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                searchQuery={search}
                onSearchChange={setSearch}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter tasks by status or priority.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskFilters
                activeFilter={filter}
                onFilterChange={setFilter}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
