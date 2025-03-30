
import { useState } from "react";
import { EducationItem } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EducationSectionProps {
  items: EducationItem[];
  isEditing: boolean;
  onAdd: (item: Partial<EducationItem>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<EducationItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function EducationSection({ 
  items, 
  isEditing, 
  onAdd, 
  onUpdate, 
  onDelete 
}: EducationSectionProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<EducationItem | null>(null);
  const [formData, setFormData] = useState<Partial<EducationItem>>({
    degree: "",
    school: "",
    year_range: ""
  });

  const handleOpenAddDialog = () => {
    setFormData({
      degree: "",
      school: "",
      year_range: ""
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (item: EducationItem) => {
    setCurrentItem(item);
    setFormData({
      degree: item.degree,
      school: item.school,
      year_range: item.year_range
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    // Basic validation
    if (!formData.degree.trim() || !formData.school.trim() || !formData.year_range.trim()) {
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
        description: "Education added successfully.",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem?.id) return;
    
    // Basic validation
    if (!formData.degree.trim() || !formData.school.trim() || !formData.year_range.trim()) {
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
        description: "Education updated successfully.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      const success = await onDelete(id);
      if (success) {
        toast({
          title: "Success",
          description: "Education deleted successfully.",
        });
      }
    }
  };

  return (
    <div className="mt-6 mb-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Education</h3>
        {isEditing && (
          <Button size="sm" variant="outline" onClick={handleOpenAddDialog}>
            <Plus size={14} className="mr-1" />
            Add Education
          </Button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>No education history added yet.</p>
          {isEditing && (
            <Button size="sm" variant="outline" onClick={handleOpenAddDialog} className="mt-2">
              <Plus size={14} className="mr-1" />
              Add Education
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((edu, index) => (
            <div key={edu.id || index} className="relative border-b border-white/10 last:border-0 pb-3 last:pb-0">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 w-7 p-0 rounded-full"
                    onClick={() => handleOpenEditDialog(edu)}
                  >
                    <span className="sr-only">Edit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-7 w-7 p-0 rounded-full"
                    onClick={() => edu.id && handleDeleteItem(edu.id)}
                  >
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </Button>
                </div>
              )}
              <h4 className="font-medium">{edu.degree}</h4>
              <p className="text-muted-foreground text-sm">{edu.school}</p>
              <p className="text-muted-foreground text-sm">{edu.year_range}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Education Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree/Certificate</Label>
              <Input
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                placeholder="E.g., Bachelor of Science in Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School/University</Label>
              <Input
                id="school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                placeholder="E.g., University of California, Berkeley"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_range">Years</Label>
              <Input
                id="year_range"
                name="year_range"
                value={formData.year_range}
                onChange={handleInputChange}
                placeholder="E.g., 2016 - 2020"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Education</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Education Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-degree">Degree/Certificate</Label>
              <Input
                id="edit-degree"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school">School/University</Label>
              <Input
                id="edit-school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year_range">Years</Label>
              <Input
                id="edit-year_range"
                name="year_range"
                value={formData.year_range}
                onChange={handleInputChange}
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
