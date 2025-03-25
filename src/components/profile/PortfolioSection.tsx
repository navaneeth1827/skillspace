
import { useState } from "react";
import { PortfolioItem } from "@/types/profile";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PortfolioSectionProps {
  items: PortfolioItem[];
  isEditing: boolean;
  onAdd: (item: PortfolioItem) => Promise<any>;
  onUpdate: (id: string, updates: Partial<PortfolioItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function PortfolioSection({ 
  items, 
  isEditing, 
  onAdd, 
  onUpdate, 
  onDelete 
}: PortfolioSectionProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState<PortfolioItem>({
    title: "",
    description: "",
    image_url: "/placeholder.svg", // Default image
    link: ""
  });

  const handleOpenAddDialog = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "/placeholder.svg",
      link: ""
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (item: PortfolioItem) => {
    setCurrentItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      link: item.link
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your project.",
        variant: "destructive"
      });
      return;
    }

    const result = await onAdd(formData);
    if (result) {
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Portfolio item added successfully.",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem?.id) return;
    
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your project.",
        variant: "destructive"
      });
      return;
    }

    const success = await onUpdate(currentItem.id, formData);
    if (success) {
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Portfolio item updated successfully.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this portfolio item?")) {
      const success = await onDelete(id);
      if (success) {
        toast({
          title: "Success",
          description: "Portfolio item deleted successfully.",
        });
      }
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Portfolio Projects</h3>
        {isEditing && (
          <Button size="sm" onClick={handleOpenAddDialog}>
            <Plus size={14} className="mr-1" />
            Add Project
          </Button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No portfolio projects added yet.</p>
          {isEditing && (
            <Button size="sm" variant="outline" onClick={handleOpenAddDialog} className="mt-2">
              <Plus size={14} className="mr-1" />
              Add Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((project, index) => (
            <AnimatedCard
              key={project.id || index}
              className="hover-shadow overflow-hidden relative"
              delay={`${index * 0.1}s`}
            >
              {isEditing && (
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => handleOpenEditDialog(project)}
                  >
                    <span className="sr-only">Edit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => project.id && handleDeleteItem(project.id)}
                  >
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </Button>
                </div>
              )}
              <div className="aspect-video w-full relative overflow-hidden rounded-t-lg">
                <img 
                  src={project.image_url || "/placeholder.svg"} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-lg">{project.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                <div className="mt-3">
                  <Button size="sm" asChild>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      View Project
                    </a>
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Add Portfolio Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Portfolio Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g., E-commerce Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the project"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Project Link</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Portfolio Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
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
            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link">Project Link</Label>
              <Input
                id="edit-link"
                name="link"
                value={formData.link}
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
