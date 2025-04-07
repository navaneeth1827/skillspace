
import { Button } from '@/components/ui/button';
import { TaskFilterOptions } from '@/types/task';
import { ListChecks, Timer, CalendarIcon, CheckCheck, User2 } from 'lucide-react';

interface TaskFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const TaskFilters = ({ activeFilter, onFilterChange }: TaskFiltersProps) => {
  // Map icons to filter options
  const getFilterIcon = (filterValue: string): React.ReactNode => {
    switch (filterValue) {
      case 'all':
        return <ListChecks className="mr-2 h-4 w-4" />;
      case 'todo':
        return <Timer className="mr-2 h-4 w-4" />;
      case 'in-progress':
        return <CalendarIcon className="mr-2 h-4 w-4" />;
      case 'completed':
        return <CheckCheck className="mr-2 h-4 w-4" />;
      case 'high':
        return <User2 className="mr-2 h-4 w-4" />;
      default:
        return <ListChecks className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-4">
      {TaskFilterOptions.map((option) => (
        <Button
          key={option.value}
          variant={activeFilter === option.value ? "default" : "outline"}
          className="justify-start"
          onClick={() => onFilterChange(option.value)}
        >
          {getFilterIcon(option.value)}
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default TaskFilters;
