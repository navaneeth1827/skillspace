
import { useState } from "react";
import { ExperienceItem } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExperienceSectionProps {
  items: ExperienceItem[];
  isEditing: boolean;
  onAdd: (item: Partial<ExperienceItem>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<ExperienceItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function ExperienceSection({ 
  items, 
  isEditing, 
  onAdd, 
  onUpdate, 
  onDelete 
}: ExperienceSectionProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ExperienceItem | null>(null);
  const [formData, setFormData] = useState<Partial<ExperienceItem>>({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    description: ""
  });

  const handleOpenAddDialog = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      description: ""
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (item: ExperienceItem) => {
    setCurrentItem(item);
    setFormData({
      title: item.title,
      company: item.company,
      location: item.location,
      start_date: item.start_date,
      end_date: item.end_date || "",
      description: item.description
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    // Basic validation
    if (!formData.title.trim() || !formData.company.trim() || !formData.start_date.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const result = await onAdd(formData);
    if (result) {
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Experience added successfully.",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem?.id) return;
    
    // Basic validation
    if (!formData.title.trim() || !formData.company.trim() || !formData.start_date.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const success = await onUpdate(currentItem.id, formData);
    if (success) {
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Experience updated successfully.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      const success = await onDelete(id);
      if (success) {
        toast({
          title: "Success",
          description: "Experience deleted successfully.",
        });
      }
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Work Experience</h3>
        {isEditing && (
          <Button size="sm" onClick={handleOpenAddDialog}>
            <Plus size={14} className="mr-1" />
            Add Experience
          </Button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No work experience added yet.</p>
          {isEditing && (
            <Button size="sm" variant="outline" onClick={handleOpenAddDialog} className="mt-2">
              <Plus size={14} className="mr-1" />
              Add Your First Experience
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((exp, index) => (
            <div key={exp.id || index} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-navy-accent">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 w-7 p-0 rounded-full"
                    onClick={() => handleOpenEditDialog(exp)}
                  >
                    <span className="sr-only">Edit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-7 w-7 p-0 rounded-full"
                    onClick={() => exp.id && handleDeleteItem(exp.id)}
                  >
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </Button>
                </div>
              )}
              <h4 className="font-medium">{exp.title}</h4>
              <p className="text-navy-accent text-sm">{exp.company}</p>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin size={12} className="mr-1" />
                <span>{exp.location}</span>
                <span className="mx-2">•</span>
                <span>{exp.end_date ? `${exp.start_date} - ${exp.end_date}` : `${exp.start_date} - Present`}</span>
              </div>
              <p className="text-muted-foreground mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Experience Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g., Senior Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="E.g., TechCorp Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="E.g., San Francisco, CA"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  placeholder="E.g., Jan 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (or 'Present')</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  placeholder="E.g., Dec 2022 (or leave blank for current job)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your responsibilities and achievements"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Experience</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Experience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start_date">Start Date</Label>
                <Input
                  id="edit-start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end_date">End Date</Label>
                <Input
                  id="edit-end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
