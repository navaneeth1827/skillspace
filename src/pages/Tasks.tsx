
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Filter, 
  Plus, 
  MoreVertical, 
  X, 
  CalendarClock,
  ArrowUp,
  ArrowDown,
  Edit3
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Task priority types
type Priority = "low" | "medium" | "high";

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: "todo" | "in-progress" | "completed";
  project: string;
}

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete website redesign for client",
    description: "Finish the homepage and about page designs",
    dueDate: "2023-06-20",
    priority: "high",
    status: "in-progress",
    project: "Website Redesign"
  },
  {
    id: "2",
    title: "Send invoice to TechCorp",
    description: "Create and send invoice for completed work",
    dueDate: "2023-06-15",
    priority: "medium",
    status: "todo",
    project: "Invoicing"
  },
  {
    id: "3",
    title: "Update portfolio with recent projects",
    description: "Add case studies for the last 3 projects",
    dueDate: "2023-06-25",
    priority: "low",
    status: "todo",
    project: "Personal"
  },
  {
    id: "4",
    title: "Research new design tools",
    description: "Look into Figma alternatives and new plugins",
    dueDate: "2023-06-18",
    priority: "low",
    status: "completed",
    project: "Research"
  },
  {
    id: "5",
    title: "Client meeting preparation",
    description: "Prepare slides and demo for the client meeting",
    dueDate: "2023-06-14",
    priority: "high",
    status: "todo",
    project: "Client Meeting"
  }
];

const Tasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "todo",
    project: ""
  });
  
  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
  const todoTasks = tasks.filter(task => task.status === "todo").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Handle filter changes
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    
    if (newFilter === "all") {
      setFilteredTasks(tasks);
    } else if (newFilter === "completed") {
      setFilteredTasks(tasks.filter(task => task.status === "completed"));
    } else if (newFilter === "in-progress") {
      setFilteredTasks(tasks.filter(task => task.status === "in-progress"));
    } else if (newFilter === "todo") {
      setFilteredTasks(tasks.filter(task => task.status === "todo"));
    } else if (["high", "medium", "low"].includes(newFilter)) {
      setFilteredTasks(tasks.filter(task => task.priority === newFilter));
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      handleFilterChange(filter);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const searchResults = tasks.filter(
      task => 
        task.title.toLowerCase().includes(lowercaseQuery) || 
        task.description.toLowerCase().includes(lowercaseQuery) ||
        task.project.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredTasks(searchResults);
  };
  
  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskToAdd = {
      ...newTask,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    const updatedTasks = [...tasks, taskToAdd];
    setTasks(updatedTasks);
    
    // Update filtered tasks based on current filter
    if (filter === "all" || filter === newTask.status || 
       (filter === newTask.priority && ["high", "medium", "low"].includes(filter))) {
      setFilteredTasks([...filteredTasks, taskToAdd]);
    }
    
    setIsAddingTask(false);
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: "todo",
      project: ""
    });
    
    toast({
      title: "Task added",
      description: "New task has been added to your list."
    });
  };
  
  // Toggle task status
  const toggleTaskStatus = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        // Cycle through statuses: todo -> in-progress -> completed -> todo
        let newStatus: "todo" | "in-progress" | "completed";
        
        if (task.status === "todo") newStatus = "in-progress";
        else if (task.status === "in-progress") newStatus = "completed";
        else newStatus = "todo";
        
        return { ...task, status: newStatus };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update filtered tasks
    if (filter === "all") {
      setFilteredTasks(updatedTasks);
    } else {
      handleFilterChange(filter);
    }
    
    toast({
      title: "Task updated",
      description: "Task status has been updated."
    });
  };
  
  // Delete task
  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    
    // Update filtered tasks
    setFilteredTasks(filteredTasks.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "Task has been removed from your list."
    });
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-purple-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-400/20 text-red-400">
            <ArrowUp className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-400/20 text-yellow-400">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-400/20 text-green-400">
            <ArrowDown className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Task Manager</h1>
              <p className="text-white/70">Organize and track your work</p>
            </div>
            <Button onClick={() => setIsAddingTask(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          
          {/* Task Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-white/70 mb-1">Completion Rate</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{completionRate}%</span>
                <Progress value={completionRate} className="h-2 w-24" />
              </div>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-white/70 mb-1">To Do</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{todoTasks}</span>
                <Circle className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-white/70 mb-1">In Progress</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{inProgressTasks}</span>
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-white/70 mb-1">Completed</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{completedTasks}</span>
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </div>
          
          {/* Task List */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-8"
                />
                {search && (
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    onClick={() => {
                      setSearch("");
                      handleFilterChange(filter);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                    All Tasks
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleFilterChange("todo")}>
                    To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("in-progress")}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("completed")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleFilterChange("high")}>
                    High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("medium")}>
                    Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("low")}>
                    Low Priority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-lg border ${
                      task.status === "completed" 
                        ? "border-green-500/20 bg-green-500/5" 
                        : task.status === "in-progress"
                          ? "border-purple-500/20 bg-purple-500/5"
                          : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <button 
                          onClick={() => toggleTaskStatus(task.id)}
                          className="mt-0.5"
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        <div>
                          <h3 className={`font-medium ${
                            task.status === "completed" ? "line-through text-white/50" : ""
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-white/70 text-sm mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getPriorityBadge(task.priority)}
                            
                            {task.project && (
                              <Badge className="bg-purple-400/20 text-purple-400">
                                {task.project}
                              </Badge>
                            )}
                            
                            {task.dueDate && (
                              <div className="flex items-center text-xs text-white/60">
                                <CalendarClock className="h-3 w-3 mr-1" />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500"
                            onClick={() => deleteTask(task.id)}
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-white/60 mt-1 mb-4">
                  {search ? `No tasks match "${search}"` : "You have no tasks matching the current filter"}
                </p>
                <Button size="sm" onClick={() => setIsAddingTask(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add a new task
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Add New Task</h2>
              <button 
                onClick={() => setIsAddingTask(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Task Title</label>
                  <Input
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Project/Category</label>
                  <Input
                    value={newTask.project}
                    onChange={e => setNewTask({...newTask, project: e.target.value})}
                    placeholder="e.g. Website Redesign, Client X"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Due Date (Optional)</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Button
                      type="button"
                      variant={newTask.priority === "low" ? "default" : "outline"}
                      className={`${newTask.priority === "low" ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}`}
                      onClick={() => setNewTask({...newTask, priority: "low"})}
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      Low
                    </Button>
                    <Button
                      type="button"
                      variant={newTask.priority === "medium" ? "default" : "outline"}
                      className={`${newTask.priority === "medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : ""}`}
                      onClick={() => setNewTask({...newTask, priority: "medium"})}
                    >
                      Medium
                    </Button>
                    <Button
                      type="button"
                      variant={newTask.priority === "high" ? "default" : "outline"}
                      className={`${newTask.priority === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" : ""}`}
                      onClick={() => setNewTask({...newTask, priority: "high"})}
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      High
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Task
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

export default Tasks;
