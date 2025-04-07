
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateTaskStatus: (taskId: string, status: 'todo' | 'in-progress' | 'completed') => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TaskList = ({
  tasks,
  isLoading,
  onDeleteTask,
  onUpdateTaskStatus,
  searchQuery,
  onSearchChange
}: TaskListProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingId(taskId);
      await onDeleteTask(taskId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: 'todo' | 'in-progress' | 'completed') => {
    try {
      setUpdatingId(taskId);
      await onUpdateTaskStatus(taskId, status);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
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
                    <Select 
                      defaultValue={task.status}
                      onValueChange={(value: 'todo' | 'in-progress' | 'completed') => 
                        handleUpdateStatus(task.id, value)
                      }
                      disabled={updatingId === task.id}
                    >
                      <SelectTrigger className="w-[130px]">
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
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deletingId === task.id}
                      className="ml-2"
                    >
                      {deletingId === task.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TaskList;
