
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import UserAvatar from "@/components/UserAvatar";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, MessageSquare, Heart, Share2, 
  ThumbsUp, MessagesSquare, Bookmark, 
  Search, PlusCircle, Globe, Sparkles, Award 
} from "lucide-react";

const projects = [
  {
    id: 1,
    title: "E-commerce Website Redesign",
    author: "Jane Cooper",
    authorAvatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    date: "2 hours ago",
    collaborators: 3,
    skills: ["UI/UX", "React", "Node.js"],
    description: "Looking for collaborators on a complete redesign of an e-commerce platform. Need help with frontend development and UI design.",
    comments: 12,
    likes: 34
  },
  {
    id: 2,
    title: "Mobile App Development Team",
    author: "Alex Morgan",
    authorAvatar: null,
    date: "Yesterday",
    collaborators: 5,
    skills: ["React Native", "Firebase", "TypeScript"],
    description: "Forming a team to develop a fitness tracking mobile application. Need developers, designers and content creators.",
    comments: 8,
    likes: 27
  },
  {
    id: 3,
    title: "Open Source Project Contributors",
    author: "Robert Chen",
    authorAvatar: "https://images.unsplash.com/photo-1501286353178-1ec871214838",
    date: "3 days ago",
    collaborators: 12,
    skills: ["Python", "Machine Learning", "Data Science"],
    description: "Seeking contributors for an open-source ML project focused on natural language processing.",
    comments: 21,
    likes: 56
  }
];

const discussions = [
  {
    id: 1,
    title: "Best practices for freelancing in 2024",
    author: "Michael Johnson",
    authorAvatar: null,
    date: "4 hours ago",
    tags: ["Freelancing", "Business", "Best Practices"],
    description: "Let's discuss current best practices for freelancers in today's market. What strategies are working for you?",
    comments: 28,
    likes: 42
  },
  {
    id: 2,
    title: "How to handle difficult clients?",
    author: "Sarah Williams",
    authorAvatar: "https://images.unsplash.com/photo-1441057206919-63d19fac2369",
    date: "1 day ago",
    tags: ["Client Management", "Communication"],
    description: "Looking for advice on handling clients who constantly change requirements or are slow to pay.",
    comments: 43,
    likes: 67
  }
];

const Community = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleJoinProject = (projectId: number) => {
    toast({
      title: "Request sent",
      description: "Your collaboration request has been sent to the project owner."
    });
  };
  
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Post created",
      description: "Your community post has been published successfully."
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-purple-gradient py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Freelancer Community</h1>
              <p className="text-lg text-white/80 mb-6">
                Connect, collaborate, and grow with fellow freelancers. Find project partners and share knowledge.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button className="bg-purple-400 text-purple-900 hover:bg-purple-300" size="lg">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create a Project
                </Button>
                <Button variant="outline" size="lg">
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  Start a Discussion
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="glass-card p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-purple-400" />
                  Community Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-400">2.4k</div>
                    <div className="text-sm text-white/70">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-400">187</div>
                    <div className="text-sm text-white/70">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-400">435</div>
                    <div className="text-sm text-white/70">Discussions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-400">56</div>
                    <div className="text-sm text-white/70">Events</div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-400" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Web Development", "Design", "Marketing", "Writing", "UI/UX", "Mobile", "AI", "Blockchain", "Programming", "Copywriting"].map(tag => (
                    <Badge 
                      key={tag}
                      className="bg-purple-900/50 hover:bg-purple-800/50 text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="glass-card p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Award className="mr-2 h-5 w-5 text-purple-400" />
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {["Alex Morgan", "Sarah Williams", "Robert Chen", "Jane Cooper", "Michael Johnson"].map((name, index) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserAvatar 
                          username={name} 
                          size="sm" 
                          avatarUrl={index % 2 ? `https://images.unsplash.com/photo-${1582562124811 + index * 100}-c09040d0a901` : null}
                        />
                        <span className="ml-2 text-sm">{name}</span>
                      </div>
                      <Badge className="bg-purple-400/20 text-purple-400">
                        {120 - index * 15} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search projects, discussions, or members..."
                    className="pl-10 bg-purple-900/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Tabs defaultValue="projects" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="projects" className="text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    Collaboration Projects
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="text-sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Discussions
                  </TabsTrigger>
                  <TabsTrigger value="create" className="text-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create
                  </TabsTrigger>
                </TabsList>
                
                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6">
                  {projects.map(project => (
                    <div key={project.id} className="glass-card p-5 transition-all hover:shadow-[0_5px_15px_rgba(155,135,245,0.1)]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <UserAvatar avatarUrl={project.authorAvatar} username={project.author} />
                          <div>
                            <h3 className="font-medium text-lg">{project.title}</h3>
                            <div className="flex items-center text-sm text-white/60 mt-1">
                              <span>{project.author}</span>
                              <span className="mx-2">•</span>
                              <span>{project.date}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleJoinProject(project.id)}>
                          Join Project
                        </Button>
                      </div>
                      
                      <p className="mt-3 text-white/80">
                        {project.description}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.skills.map(skill => (
                          <Badge 
                            key={skill} 
                            className="bg-purple-400/10 hover:bg-purple-400/20 text-purple-400"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center text-white/60 hover:text-purple-400">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{project.likes}</span>
                          </button>
                          <button className="flex items-center text-white/60 hover:text-purple-400">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{project.comments}</span>
                          </button>
                          <button className="flex items-center text-white/60 hover:text-purple-400">
                            <Share2 className="h-4 w-4 mr-1" />
                            <span>Share</span>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-white/60 mr-2">Collaborators:</span>
                          <span className="text-sm font-medium">{project.collaborators}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button variant="outline">
                      Load More Projects
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Discussions Tab */}
                <TabsContent value="discussions" className="space-y-6">
                  {discussions.map(discussion => (
                    <div key={discussion.id} className="glass-card p-5 transition-all hover:shadow-[0_5px_15px_rgba(155,135,245,0.1)]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <UserAvatar avatarUrl={discussion.authorAvatar} username={discussion.author} />
                          <div>
                            <h3 className="font-medium text-lg">{discussion.title}</h3>
                            <div className="flex items-center text-sm text-white/60 mt-1">
                              <span>{discussion.author}</span>
                              <span className="mx-2">•</span>
                              <span>{discussion.date}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="mt-3 text-white/80">
                        {discussion.description}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {discussion.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            className="bg-purple-400/10 hover:bg-purple-400/20 text-purple-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center">
                        <button className="flex items-center text-white/60 hover:text-purple-400 mr-4">
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{discussion.likes}</span>
                        </button>
                        <button className="flex items-center text-white/60 hover:text-purple-400 mr-4">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{discussion.comments}</span>
                        </button>
                        <button className="flex items-center text-white/60 hover:text-purple-400">
                          <Share2 className="h-4 w-4 mr-1" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button variant="outline">
                      Load More Discussions
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Create Tab */}
                <TabsContent value="create">
                  <form onSubmit={handleCreatePost} className="glass-card p-5 space-y-4">
                    <h3 className="font-medium text-xl mb-2">Create a New Post</h3>
                    
                    <div className="space-y-2">
                      <label htmlFor="post-type" className="text-sm font-medium">Post Type</label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="project" 
                            name="post-type" 
                            value="project"
                            defaultChecked
                            className="h-4 w-4 text-purple-400 border-white/20 bg-purple-900/20 focus:ring-purple-400"
                          />
                          <label htmlFor="project" className="text-sm">Collaboration Project</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="discussion" 
                            name="post-type" 
                            value="discussion"
                            className="h-4 w-4 text-purple-400 border-white/20 bg-purple-900/20 focus:ring-purple-400"
                          />
                          <label htmlFor="discussion" className="text-sm">Discussion</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">Title</label>
                      <Input
                        id="title"
                        placeholder="Enter a descriptive title for your post"
                        className="bg-purple-900/30"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">Description</label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project or start a discussion topic..."
                        className="bg-purple-900/30 min-h-[120px]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="tags" className="text-sm font-medium">
                        Skills/Tags (comma separated)
                      </label>
                      <Input
                        id="tags"
                        placeholder="e.g. React, Design, Marketing"
                        className="bg-purple-900/30"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button type="submit" className="w-full">
                        Publish Post
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Community;
