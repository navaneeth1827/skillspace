
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioItem, ExperienceItem, EducationItem, ReviewItem } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

export function useProfileData(userId: string | undefined) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    
    async function fetchProfileData() {
      setIsLoading(true);
      try {
        // Fetch portfolio items
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio')
          .select('*')
          .eq('user_id', userId);
          
        if (portfolioError) throw portfolioError;
        setPortfolio(portfolioData || []);
        
        // Fetch experience items
        const { data: experienceData, error: experienceError } = await supabase
          .from('experience')
          .select('*')
          .eq('user_id', userId);
          
        if (experienceError) throw experienceError;
        setExperience(experienceData || []);
        
        // Fetch education items
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('user_id', userId);
          
        if (educationError) throw educationError;
        setEducation(educationData || []);
        
        // Fetch reviews (as freelancer)
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('freelancer_id', userId);
          
        if (reviewsError) throw reviewsError;
        
        // Get client names separately instead of using a join
        const clientIds = reviewsData?.map(review => review.client_id) || [];
        let clientNames: Record<string, string> = {};
        
        if (clientIds.length > 0) {
          const { data: clientData, error: clientError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', clientIds);
            
          if (!clientError && clientData) {
            clientNames = clientData.reduce((acc: Record<string, string>, client) => {
              acc[client.id] = client.full_name;
              return acc;
            }, {});
          }
        }
        
        // Map the reviews data to include client name
        const formattedReviews = reviewsData?.map(review => ({
          ...review,
          client_name: clientNames[review.client_id] || 'Unknown Client'
        })) || [];
        
        setReviews(formattedReviews);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfileData();
  }, [userId, toast]);

  // Functions to add/update/delete items
  async function addPortfolioItem(item: PortfolioItem) {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .insert({
          ...item,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setPortfolio(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to add portfolio item. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }
  
  async function updatePortfolioItem(id: string, updates: Partial<PortfolioItem>) {
    try {
      const { error } = await supabase
        .from('portfolio')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setPortfolio(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio item. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  async function deletePortfolioItem(id: string) {
    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setPortfolio(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio item. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  // Experience CRUD operations
  async function addExperienceItem(item: ExperienceItem) {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('experience')
        .insert({
          ...item,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setExperience(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding experience item:', error);
      toast({
        title: "Error",
        description: "Failed to add experience item. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }
  
  async function updateExperienceItem(id: string, updates: Partial<ExperienceItem>) {
    try {
      const { error } = await supabase
        .from('experience')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setExperience(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating experience item:', error);
      toast({
        title: "Error",
        description: "Failed to update experience item. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  async function deleteExperienceItem(id: string) {
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setExperience(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting experience item:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience item. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  // Education CRUD operations
  async function addEducationItem(item: EducationItem) {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('education')
        .insert({
          ...item,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setEducation(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding education item:', error);
      toast({
        title: "Error",
        description: "Failed to add education item. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }
  
  async function updateEducationItem(id: string, updates: Partial<EducationItem>) {
    try {
      const { error } = await supabase
        .from('education')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setEducation(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating education item:', error);
      toast({
        title: "Error",
        description: "Failed to update education item. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  async function deleteEducationItem(id: string) {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setEducation(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting education item:', error);
      toast({
        title: "Error",
        description: "Failed to delete education item. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  return {
    isLoading,
    portfolio,
    experience,
    education,
    reviews,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    addExperienceItem,
    updateExperienceItem,
    deleteExperienceItem,
    addEducationItem,
    updateEducationItem,
    deleteEducationItem
  };
}
