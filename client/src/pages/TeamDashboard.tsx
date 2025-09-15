import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Users, Plus, Settings, Crown, Shield, User, Eye, Share2, UserPlus,
  BarChart3, Target, TrendingUp, Calendar, Clock, MessageSquare, FileText,
  Activity, Zap, Star, CheckCircle, AlertCircle, ArrowUp, ArrowDown,
  PlayCircle, PauseCircle, Timer, Trophy, Flame, Rocket, Brain, Heart,
  Lightbulb, Award, Briefcase, MapPin, Phone, Mail, Edit3, MoreVertical,
  Download, Filter, Search, Bell, Maximize2, RefreshCw, Archive, Bookmark,
  Share, Copy, ExternalLink, ChevronRight, ChevronDown, Sparkles, Coffee,
  Headphones, Video, Mic, Camera, Monitor, Globe, Database, Cloud, Code,
  Terminal, GitBranch, Package, Layers, Lock, Key, Fingerprint, Tag, Link,
  Hash, Percent, DollarSign, CreditCard, Wallet, Gift, ShoppingCart, Truck,
  Navigation, Compass, Flag, Home, Building, Sun, Moon, ThumbsUp, ThumbsDown,
  Send, Repeat, Volume2, Gamepad2, Linkedin, Github, Figma, Slack,
  Youtube, Instagram, Twitter, Facebook, Upload, ArrowLeft
} from "lucide-react";

interface Team {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  memberCount: number;
  role: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedAt: string;
  activityScore?: number;
  lastActive?: string;
}

interface TeamProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  assignedMembers: number;
}

interface TeamActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  icon: string;
}

export default function TeamDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [integrationStates, setIntegrationStates] = useState({
    GitHub: true,
    Slack: true,
    Figma: true,
    Teams: false,
    LinkedIn: true,
    YouTube: false,
    OpenAI: true,
    Anthropic: true
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
    { id: 'projects', label: 'Projects', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { id: 'files', label: 'Files & Share', icon: Cloud, color: 'from-emerald-500 to-teal-500' },
    { id: 'members', label: 'Members', icon: Users, color: 'from-green-500 to-emerald-500' },
    { id: 'activity', label: 'Activity', icon: Activity, color: 'from-orange-500 to-red-500' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-indigo-500 to-purple-500' },
    { id: 'integrations', label: 'Integrations', icon: GitBranch, color: 'from-teal-500 to-cyan-500' }
  ];

  // Fetch user's teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch team members for selected team
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/teams", selectedTeam, "members"],
    enabled: !!selectedTeam,
  });

  // Fetch team projects
  const { data: teamProjects = [] } = useQuery<TeamProject[]>({
    queryKey: ["/api/teams", selectedTeam, "projects"],
    enabled: !!selectedTeam,
  });

  // Fetch team activity
  const { data: teamActivity = [] } = useQuery<TeamActivity[]>({
    queryKey: ["/api/teams", selectedTeam, "activity"],
    enabled: !!selectedTeam,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/teams", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setShowCreateTeam(false);
      toast({
        title: "Team Created",
        description: "Your team workspace is ready for collaboration",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; dueDate: string }) => {
      const response = await apiRequest("POST", `/api/teams/${selectedTeam}/projects`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "projects"] });
      setShowCreateProject(false);
      toast({
        title: "Project Created",
        description: "New team project has been created successfully",
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await apiRequest("POST", `/api/teams/${selectedTeam}/invite`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "members"] });
      setShowInviteUser(false);
      toast({
        title: "Invitation Sent",
        description: "Team member will receive an email invitation",
      });
    },
  });

  const roleIcons = {
    owner: Crown,
    admin: Shield,
    member: User,
    viewer: Eye
  };

  const roleColors = {
    owner: "bg-yellow-100 text-yellow-800",
    admin: "bg-purple-100 text-purple-800",
    member: "bg-blue-100 text-blue-800",
    viewer: "bg-gray-100 text-gray-800"
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return FileText;
      case 'member_joined': return UserPlus;
      case 'comment_added': return MessageSquare;
      case 'task_completed': return Target;
      default: return Activity;
    }
  };

  const selectedTeamData = teams.find(team => team.id === selectedTeam);

  // Mock data for enhanced features
  const mockTeamStats = {
    totalProjects: 24,
    activeProjects: 12,
    completedProjects: 8,
    onHoldProjects: 4,
    totalMembers: teamMembers.length || 8,
    activeMembers: 6,
    productivity: 94,
    satisfaction: 87,
    efficiency: 91,
    collaboration: 89
  };

  const mockNotifications = [
    { id: 1, type: 'info', title: 'New team member', message: 'Sarah joined the Marketing team', time: '2m ago', icon: UserPlus },
    { id: 2, type: 'success', title: 'Project completed', message: 'Website Redesign project completed successfully', time: '1h ago', icon: CheckCircle },
    { id: 3, type: 'warning', title: 'Deadline approaching', message: 'Mobile App project due in 2 days', time: '3h ago', icon: AlertCircle },
    { id: 4, type: 'info', title: 'Meeting scheduled', message: 'Team standup at 10:00 AM tomorrow', time: '5h ago', icon: Calendar }
  ];

  const mockTopPerformers = [
    { id: 1, name: 'Alice Johnson', score: 98, tasks: 24, avatar: 'AJ', trend: 'up' },
    { id: 2, name: 'Bob Smith', score: 94, tasks: 21, avatar: 'BS', trend: 'up' },
    { id: 3, name: 'Carol Davis', score: 91, tasks: 19, avatar: 'CD', trend: 'down' },
    { id: 4, name: 'David Wilson', score: 88, tasks: 17, avatar: 'DW', trend: 'up' }
  ];

  const mockTechStack = [
    { name: 'React', icon: '⚛️', status: 'active' },
    { name: 'TypeScript', icon: '📘', status: 'active' },
    { name: 'Node.js', icon: '🟢', status: 'active' },
    { name: 'PostgreSQL', icon: '🐘', status: 'active' },
    { name: 'Docker', icon: '🐳', status: 'active' },
    { name: 'AWS', icon: '☁️', status: 'active' }
  ];

  const mockIntegrations = [
    { name: 'GitHub', icon: Github, connected: integrationStates.GitHub, lastSync: integrationStates.GitHub ? '5m ago' : 'Never' },
    { name: 'Slack', icon: Slack, connected: integrationStates.Slack, lastSync: integrationStates.Slack ? '1h ago' : 'Never' },
    { name: 'Figma', icon: Figma, connected: integrationStates.Figma, lastSync: integrationStates.Figma ? '2h ago' : 'Never' },
    { name: 'Teams', icon: Users, connected: integrationStates.Teams, lastSync: integrationStates.Teams ? '30m ago' : 'Never' },
    { name: 'LinkedIn', icon: Linkedin, connected: integrationStates.LinkedIn, lastSync: integrationStates.LinkedIn ? '1d ago' : 'Never' },
    { name: 'YouTube', icon: Youtube, connected: integrationStates.YouTube, lastSync: integrationStates.YouTube ? '2h ago' : 'Never' },
    { name: 'OpenAI', icon: Brain, connected: integrationStates.OpenAI, lastSync: integrationStates.OpenAI ? 'Live' : 'Never' },
    { name: 'Anthropic', icon: Zap, connected: integrationStates.Anthropic, lastSync: integrationStates.Anthropic ? 'Live' : 'Never' }
  ];

  const toggleIntegration = (integrationName: string) => {
    setIntegrationStates(prev => ({
      ...prev,
      [integrationName]: !prev[integrationName as keyof typeof prev]
    }));

    const isCurrentlyConnected = integrationStates[integrationName as keyof typeof integrationStates];

    // Special handling for AI providers
    if (integrationName === 'OpenAI' || integrationName === 'Anthropic') {
      toast({
        title: isCurrentlyConnected ? `${integrationName} Disconnected` : `${integrationName} Connected`,
        description: isCurrentlyConnected
          ? `AI app generation disabled`
          : `Live AI app generation and template testing enabled`,
      });
    } else {
      toast({
        title: isCurrentlyConnected ? `${integrationName} Disconnected` : `${integrationName} Connected`,
        description: isCurrentlyConnected
          ? `${integrationName} integration has been disabled`
          : `${integrationName} integration is now active and syncing`,
      });
    }
  };

  const mockSharedFiles = [
    { id: 1, name: 'Project_Wireframes.pdf', size: '2.4 MB', type: 'pdf', uploadedBy: 'Alice Johnson', uploadedAt: '2 hours ago', downloads: 12, shared: true },
    { id: 2, name: 'Team_Photos.zip', size: '15.7 MB', type: 'archive', uploadedBy: 'Bob Smith', uploadedAt: '1 day ago', downloads: 8, shared: true },
    { id: 3, name: 'Meeting_Notes.docx', size: '245 KB', type: 'document', uploadedBy: 'Carol Davis', uploadedAt: '3 hours ago', downloads: 15, shared: false },
    { id: 4, name: 'App_Demo.mp4', size: '48.2 MB', type: 'video', uploadedBy: 'David Wilson', uploadedAt: '5 hours ago', downloads: 25, shared: true },
    { id: 5, name: 'Budget_2024.xlsx', size: '890 KB', type: 'spreadsheet', uploadedBy: 'Alice Johnson', uploadedAt: '1 week ago', downloads: 45, shared: true }
  ];

  // File handling functions
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    // Simulate file upload with progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Files Uploaded Successfully!",
            description: `${files.length} file(s) shared with team members via email`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'document': return FileText;
      case 'spreadsheet': return FileText;
      case 'video': return PlayCircle;
      case 'archive': return Archive;
      default: return FileText;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-500';
      case 'document': return 'text-blue-500';
      case 'spreadsheet': return 'text-green-500';
      case 'video': return 'text-purple-500';
      case 'archive': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with Real-time Features */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            {/* Back Arrow Button */}
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 group"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
            </Button>

            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <Sparkles className="mr-3 text-yellow-400 animate-pulse" size={32} />
                Team Dashboard
                <Badge className="ml-3 bg-green-500/20 text-green-300 border-green-500/30 animate-bounce">
                  <Activity size={12} className="mr-1" />
                  Live
                </Badge>
              </h1>
              <p className="text-purple-200 flex items-center">
                <Clock size={16} className="mr-2" />
                Manage projects, track progress, and collaborate effectively
              </p>
            </div>

            {/* Real-time Stats Preview */}
            <div className="hidden lg:flex space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <span className="text-white text-sm font-medium">{mockTeamStats.activeMembers} Active</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center space-x-2">
                  <Trophy className="text-yellow-400" size={16} />
                  <span className="text-white text-sm font-medium">{mockTeamStats.productivity}% Productivity</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications Bell */}
            <div className="relative">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 relative">
                <Bell size={16} className="animate-pulse" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {mockNotifications.length}
                </span>
              </Button>
            </div>

            {/* Real-time Refresh */}
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <RefreshCw size={16} className="animate-spin" />
            </Button>

            {/* Settings */}
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Settings size={16} />
            </Button>

            <div className="flex space-x-3">
              {!selectedTeam && teams.length === 0 && (
                <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2" size={20} />
                      Create Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createTeamMutation.mutate({
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                      });
                    }} className="space-y-4">
                      <Input name="name" placeholder="Team name" required />
                      <Textarea name="description" placeholder="Team description (optional)" />
                      <Button type="submit" disabled={createTeamMutation.isPending} className="w-full bg-green-600 hover:bg-green-700">
                        {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {selectedTeam && (
                <>
                <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="mr-2" size={20} />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createProjectMutation.mutate({
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                        dueDate: formData.get('dueDate') as string,
                      });
                    }} className="space-y-4">
                      <Input name="name" placeholder="Project name" required />
                      <Textarea name="description" placeholder="Project description" />
                      <Input name="dueDate" type="date" required />
                      <Button type="submit" disabled={createProjectMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <UserPlus className="mr-2" size={20} />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      inviteUserMutation.mutate({
                        email: formData.get('email') as string,
                        role: formData.get('role') as string,
                      });
                    }} className="space-y-4">
                      <Input name="email" type="email" placeholder="Email address" required />
                      <Select name="role" defaultValue="member">
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" disabled={inviteUserMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                        {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          {selectedTeam || teams.length === 0 ? (
            <>
              {/* Enhanced Team Header */}
              <Card className="mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <Rocket className="text-white animate-bounce" size={24} />
                      </div>
                      <div>
                        <CardTitle className="text-3xl flex items-center">
                          {selectedTeamData?.name || "Demo Team"}
                          <Badge className="ml-3 bg-green-500/30 text-green-100 border-green-400/50 animate-pulse">
                            <Flame size={12} className="mr-1" />
                            {teams.length === 0 ? "Demo" : "Active"}
                          </Badge>
                        </CardTitle>
                        <p className="text-purple-100 mt-1 flex items-center">
                          <Sparkles size={16} className="mr-2 animate-spin" />
                          {selectedTeamData?.description || "Experience the amazing team collaboration features"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="text-yellow-400" size={16} />
                            <span className="text-sm font-medium">{mockTeamStats.satisfaction}% Satisfaction</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="text-yellow-400" size={16} />
                            <span className="text-sm font-medium">Top Performer</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-right">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold flex items-center justify-center">
                          <Users size={20} className="mr-2" />
                          {teamMembers.length}
                        </div>
                        <div className="text-sm text-purple-100">Team Members</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold flex items-center justify-center">
                          <FileText size={20} className="mr-2" />
                          {mockTeamStats.activeProjects}
                        </div>
                        <div className="text-sm text-purple-100">Active Projects</div>
                      </div>
                    </div>
                  </div>

                  {/* Team Performance Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Team Performance</span>
                      <span>{mockTeamStats.efficiency}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${mockTeamStats.efficiency}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Enhanced Tabs with Gradient Colors */}
              <div className="flex flex-wrap gap-2 mb-6 bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300 text-sm font-medium relative overflow-hidden group ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                          : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-102'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg"></div>
                      )}
                      <Icon size={16} className={`relative z-10 ${activeTab === tab.id ? 'animate-bounce' : ''}`} />
                      <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Enhanced Stats Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-white backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-3 bg-blue-500/30 rounded-xl backdrop-blur-sm border border-blue-400/30 group-hover:animate-bounce">
                              <FileText className="text-blue-200" size={24} />
                            </div>
                            <div className="ml-4">
                              <div className="text-3xl font-bold text-white">{teamProjects.length || mockTeamStats.activeProjects}</div>
                              <div className="text-sm text-blue-200">Active Projects</div>
                              <div className="flex items-center mt-1">
                                <ArrowUp size={12} className="text-green-400 mr-1" />
                                <span className="text-xs text-green-400">+12% this month</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30 text-white backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-3 bg-green-500/30 rounded-xl backdrop-blur-sm border border-green-400/30 group-hover:animate-bounce">
                              <TrendingUp className="text-green-200" size={24} />
                            </div>
                            <div className="ml-4">
                              <div className="text-3xl font-bold text-white">{mockTeamStats.productivity}%</div>
                              <div className="text-sm text-green-200">Productivity</div>
                              <div className="flex items-center mt-1">
                                <ArrowUp size={12} className="text-green-400 mr-1" />
                                <span className="text-xs text-green-400">+5% this week</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 text-white backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-3 bg-purple-500/30 rounded-xl backdrop-blur-sm border border-purple-400/30 group-hover:animate-bounce">
                              <Users className="text-purple-200" size={24} />
                            </div>
                            <div className="ml-4">
                              <div className="text-3xl font-bold text-white">{teamMembers.length || mockTeamStats.totalMembers}</div>
                              <div className="text-sm text-purple-200">Team Members</div>
                              <div className="flex items-center mt-1">
                                <Star size={12} className="text-yellow-400 mr-1" />
                                <span className="text-xs text-yellow-400">{mockTeamStats.activeMembers} active now</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 text-white backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-3 bg-orange-500/30 rounded-xl backdrop-blur-sm border border-orange-400/30 group-hover:animate-bounce">
                              <Zap className="text-orange-200" size={24} />
                            </div>
                            <div className="ml-4">
                              <div className="text-3xl font-bold text-white">{mockTeamStats.collaboration}%</div>
                              <div className="text-sm text-orange-200">Collaboration</div>
                              <div className="flex items-center mt-1">
                                <Flame size={12} className="text-red-400 mr-1 animate-pulse" />
                                <span className="text-xs text-red-400">On fire!</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Insights Row */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Trophy className="mr-2 text-yellow-400" size={20} />
                          Top Performers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockTopPerformers.slice(0, 3).map((performer) => (
                          <div key={performer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                  {performer.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white">{performer.name}</div>
                                <div className="text-sm text-white/70">{performer.tasks} tasks</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-yellow-400">{performer.score}</span>
                              {performer.trend === 'up' ? (
                                <ArrowUp size={16} className="text-green-400" />
                              ) : (
                                <ArrowDown size={16} className="text-red-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Bell className="mr-2 text-blue-400 animate-pulse" size={20} />
                          Recent Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockNotifications.slice(0, 3).map((notification) => {
                          const NotificationIcon = notification.icon;
                          return (
                            <div key={notification.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                              <div className={`p-2 rounded-lg ${
                                notification.type === 'success' ? 'bg-green-500/20' :
                                notification.type === 'warning' ? 'bg-yellow-500/20' :
                                'bg-blue-500/20'
                              }`}>
                                <NotificationIcon size={16} className={
                                  notification.type === 'success' ? 'text-green-400' :
                                  notification.type === 'warning' ? 'text-yellow-400' :
                                  'text-blue-400'
                                } />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm">{notification.title}</div>
                                <div className="text-xs text-white/60">{notification.time}</div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Code className="mr-2 text-green-400" size={20} />
                          Tech Stack
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          {mockTechStack.map((tech) => (
                            <div key={tech.name} className="flex flex-col items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                              <div className="text-2xl mb-1">{tech.icon}</div>
                              <div className="text-xs text-white/70 text-center">{tech.name}</div>
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-1 animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity & Quick Actions */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardHeader>
                        <CardTitle className="flex items-center text-white">
                          <Activity className="mr-2" size={20} />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {teamActivity.slice(0, 5).map((activity) => {
                            const ActivityIcon = getActivityIcon(activity.type);
                            return (
                              <div key={activity.id} className="flex items-start space-x-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                  <ActivityIcon size={14} className="text-white/70" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white">{activity.description}</p>
                                  <p className="text-xs text-white/60">by {activity.user} • {activity.timestamp}</p>
                                </div>
                              </div>
                            );
                          })}
                          {teamActivity.length === 0 && (
                            <div className="text-center py-8 text-white/60">
                              <Activity size={32} className="mx-auto mb-2 opacity-50" />
                              <p>No recent activity</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardHeader>
                        <CardTitle className="flex items-center text-white">
                          <Target className="mr-2" size={20} />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white"
                          variant="outline"
                          onClick={() => setShowCreateProject(true)}
                        >
                          <Plus className="mr-2" size={16} />
                          Create New Project
                        </Button>
                        <Button
                          className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white"
                          variant="outline"
                          onClick={() => setShowInviteUser(true)}
                        >
                          <UserPlus className="mr-2" size={16} />
                          Invite Team Member
                        </Button>
                        <Button
                          className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white"
                          variant="outline"
                          onClick={() => toast({
                            title: "Discussion Started",
                            description: "Team discussion channel has been opened",
                          })}
                        >
                          <MessageSquare className="mr-2" size={16} />
                          Start Discussion
                        </Button>
                        <Button
                          className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white"
                          variant="outline"
                          onClick={() => toast({
                            title: "Meeting Scheduled",
                            description: "Team meeting scheduled for tomorrow at 10:00 AM",
                          })}
                        >
                          <Calendar className="mr-2" size={16} />
                          Schedule Meeting
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Team Projects</h3>
                    <Button onClick={() => setShowCreateProject(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus size={16} className="mr-2" />
                      New Project
                    </Button>
                  </div>

                  <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                      { id: 1, name: "Website Redesign", status: "in_progress", progress: 75, dueDate: "2024-02-15", members: 4, priority: "high" },
                      { id: 2, name: "Mobile App Development", status: "in_progress", progress: 45, dueDate: "2024-03-01", members: 6, priority: "high" },
                      { id: 3, name: "Marketing Campaign", status: "completed", progress: 100, dueDate: "2024-01-20", members: 3, priority: "medium" },
                      { id: 4, name: "User Research", status: "planning", progress: 20, dueDate: "2024-02-28", members: 2, priority: "low" },
                      { id: 5, name: "API Documentation", status: "in_progress", progress: 60, dueDate: "2024-02-10", members: 2, priority: "medium" },
                      { id: 6, name: "Performance Optimization", status: "planning", progress: 10, dueDate: "2024-03-15", members: 3, priority: "high" }
                    ].map((project) => (
                      <Card key={project.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                            <Badge className={`${
                              project.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}>
                              {project.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-white/70">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {project.dueDate}
                            </div>
                            <div className="flex items-center">
                              <Users size={14} className="mr-1" />
                              {project.members}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">Progress</span>
                              <span className="text-white font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <Badge className={`${
                                project.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                  <Eye size={14} />
                                </Button>
                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                  <Edit3 size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Files & Share Tab */}
              {activeTab === 'files' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <Cloud className="mr-3 text-emerald-400" size={24} />
                      Files & Share
                      <Badge className="ml-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        {mockSharedFiles.length} files
                      </Badge>
                    </h3>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setShowFileShare(true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Upload size={16} className="mr-2" />
                        Upload Files
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Filter size={16} className="mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <Card className={`border-2 border-dashed transition-all duration-300 ${
                    dragActive
                      ? 'border-emerald-400 bg-emerald-500/10 scale-105'
                      : 'border-white/30 bg-white/5 hover:bg-white/10'
                  }`}>
                    <CardContent
                      className="p-8 text-center"
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-4">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          dragActive ? 'bg-emerald-500/20 animate-bounce' : 'bg-white/10'
                        }`}>
                          <Cloud size={32} className={`${dragActive ? 'text-emerald-400' : 'text-white/60'}`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {dragActive ? 'Drop files here!' : 'Drag & Drop Files'}
                          </h4>
                          <p className="text-white/60 mb-4">
                            Or click to browse and select files to share with your team
                          </p>
                          <Button
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => document.getElementById('file-input')?.click()}
                          >
                            <Plus size={16} className="mr-2" />
                            Choose Files
                          </Button>
                          <input
                            id="file-input"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) handleFileUpload(files);
                            }}
                          />
                        </div>

                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="max-w-xs mx-auto">
                            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* File List */}
                  <div className="grid gap-4">
                    {mockSharedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      const fileColor = getFileColor(file.type);

                      return (
                        <Card key={file.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all group">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-lg bg-white/10 group-hover:scale-110 transition-transform`}>
                                  <FileIcon size={24} className={fileColor} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                    {file.name}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm text-white/60">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>by {file.uploadedBy}</span>
                                    <span>•</span>
                                    <span>{file.uploadedAt}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                      <Download size={12} className="mr-1" />
                                      {file.downloads} downloads
                                    </Badge>
                                    {file.shared && (
                                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                        <Share2 size={12} className="mr-1" />
                                        Shared
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                  onClick={() => toast({
                                    title: "Download Started",
                                    description: `Downloading ${file.name}`,
                                  })}
                                >
                                  <Download size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                  onClick={() => toast({
                                    title: "Link Copied",
                                    description: "Share link copied to clipboard",
                                  })}
                                >
                                  <Share2 size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                  onClick={() => toast({
                                    title: "Email Sent",
                                    description: `File shared via email to team members`,
                                  })}
                                >
                                  <Mail size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <MoreVertical size={14} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* File Sharing Stats */}
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              {mockSharedFiles.reduce((sum, file) => sum + file.downloads, 0)}
                            </div>
                            <div className="text-sm text-emerald-200">Total Downloads</div>
                          </div>
                          <Download className="text-emerald-400" size={24} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              {mockSharedFiles.filter(f => f.shared).length}
                            </div>
                            <div className="text-sm text-blue-200">Shared Files</div>
                          </div>
                          <Share2 className="text-blue-400" size={24} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              {(mockSharedFiles.reduce((sum, file) => sum + parseFloat(file.size.split(' ')[0]), 0)).toFixed(1)} MB
                            </div>
                            <div className="text-sm text-purple-200">Storage Used</div>
                          </div>
                          <Database className="text-purple-400" size={24} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Team Members</h3>
                    <Button onClick={() => setShowInviteUser(true)} className="bg-green-600 hover:bg-green-700">
                      <UserPlus size={16} className="mr-2" />
                      Invite Member
                    </Button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {[
                      { id: 1, name: "Alice Johnson", role: "owner", email: "alice@company.com", avatar: "AJ", status: "online", lastActive: "now", projects: 5 },
                      { id: 2, name: "Bob Smith", role: "admin", email: "bob@company.com", avatar: "BS", status: "online", lastActive: "2m ago", projects: 3 },
                      { id: 3, name: "Carol Davis", role: "member", email: "carol@company.com", avatar: "CD", status: "away", lastActive: "1h ago", projects: 4 },
                      { id: 4, name: "David Wilson", role: "member", email: "david@company.com", avatar: "DW", status: "offline", lastActive: "3h ago", projects: 2 },
                      { id: 5, name: "Emma Thompson", role: "viewer", email: "emma@company.com", avatar: "ET", status: "online", lastActive: "5m ago", projects: 1 },
                      { id: 6, name: "Frank Miller", role: "member", email: "frank@company.com", avatar: "FM", status: "away", lastActive: "30m ago", projects: 3 }
                    ].map((member) => {
                      const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                      return (
                        <Card key={member.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all group">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold">
                                      {member.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    member.status === 'online' ? 'bg-green-500' :
                                    member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                                  }`}></div>
                                </div>
                                <div>
                                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {member.name}
                                  </div>
                                  <div className="text-sm text-white/60">{member.email}</div>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                                      <RoleIcon size={12} className="mr-1" />
                                      {member.role}
                                    </Badge>
                                    <span className="text-xs text-white/60">{member.projects} projects</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className={`text-sm font-medium ${
                                  member.status === 'online' ? 'text-green-400' :
                                  member.status === 'away' ? 'text-yellow-400' : 'text-gray-400'
                                }`}>
                                  {member.status}
                                </div>
                                <div className="text-xs text-white/60">{member.lastActive}</div>
                                <div className="flex space-x-2 mt-2">
                                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    <MessageSquare size={14} />
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    <Mail size={14} />
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    <MoreVertical size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Team Activity</h3>
                    <div className="flex space-x-3">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Filter size={16} className="mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <RefreshCw size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 1, type: "project_created", user: "Alice Johnson", action: "created new project", target: "Website Redesign", time: "2 minutes ago", color: "blue" },
                      { id: 2, type: "member_joined", user: "Emma Thompson", action: "joined the team", target: "", time: "1 hour ago", color: "green" },
                      { id: 3, type: "file_uploaded", user: "Bob Smith", action: "uploaded file", target: "Team_Photos.zip", time: "3 hours ago", color: "purple" },
                      { id: 4, type: "task_completed", user: "Carol Davis", action: "completed task", target: "User Interface Design", time: "5 hours ago", color: "emerald" },
                      { id: 5, type: "comment_added", user: "David Wilson", action: "commented on", target: "Mobile App Development", time: "1 day ago", color: "orange" },
                      { id: 6, type: "project_updated", user: "Frank Miller", action: "updated project", target: "API Documentation", time: "2 days ago", color: "pink" }
                    ].map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      return (
                        <Card key={activity.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all group">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-full bg-${activity.color}-500/20 group-hover:scale-110 transition-transform`}>
                                <ActivityIcon size={20} className={`text-${activity.color}-400`} />
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  <span className="text-blue-400">{activity.user}</span> {activity.action}
                                  {activity.target && <span className="text-emerald-400"> {activity.target}</span>}
                                </div>
                                <div className="text-sm text-white/60 mt-1">{activity.time}</div>
                              </div>
                              <Badge className="bg-white/10 text-white/70 border-white/20">
                                {activity.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Team Analytics</h3>
                    <div className="flex space-x-3">
                      <Select defaultValue="7d">
                        <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Download size={16} className="mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Analytics Header Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "Productivity Score", value: "94%", change: "+8%", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
                      { title: "Team Satisfaction", value: "87%", change: "+12%", icon: Heart, color: "from-pink-500 to-rose-500" },
                      { title: "Project Velocity", value: "2.4x", change: "+15%", icon: Rocket, color: "from-purple-500 to-indigo-500" },
                      { title: "Collaboration Index", value: "91%", change: "+6%", icon: Users, color: "from-emerald-500 to-teal-500" }
                    ].map((metric, index) => {
                      const Icon = metric.icon;
                      return (
                        <Card key={index} className={`bg-gradient-to-br ${metric.color}/20 border border-white/20 text-white backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden`}>
                          <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-bold text-white">{metric.value}</div>
                                <div className="text-sm text-white/70">{metric.title}</div>
                                <div className="flex items-center mt-1">
                                  <ArrowUp size={12} className="text-green-400 mr-1" />
                                  <span className="text-xs text-green-400">{metric.change}</span>
                                </div>
                              </div>
                              <Icon size={24} className="text-white/70 group-hover:text-white group-hover:animate-pulse transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Performance Charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardHeader>
                        <CardTitle className="text-white">Team Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { metric: "Code Quality", score: 92, color: "bg-blue-500" },
                            { metric: "Task Completion", score: 88, color: "bg-green-500" },
                            { metric: "Communication", score: 95, color: "bg-purple-500" },
                            { metric: "Innovation", score: 76, color: "bg-orange-500" },
                            { metric: "Problem Solving", score: 91, color: "bg-pink-500" }
                          ].map((item, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/70">{item.metric}</span>
                                <span className="text-white font-medium">{item.score}%</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                  className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardHeader>
                        <CardTitle className="text-white">Project Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center">
                        <div className="w-48 h-48 relative">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="10"
                              strokeDasharray="75 25"
                              strokeDashoffset="0"
                              className="animate-pulse"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="10"
                              strokeDasharray="15 85"
                              strokeDashoffset="-75"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="10"
                              strokeDasharray="10 90"
                              strokeDashoffset="-90"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{mockTeamStats.activeProjects}</div>
                              <div className="text-sm text-white/60">Active</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Team Integrations</h3>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Plus size={16} className="mr-2" />
                      Add Integration
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockIntegrations.map((integration, index) => {
                      const Icon = integration.icon;
                      return (
                        <Card key={index} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all group">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                                  <Icon size={24} className="text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-white">{integration.name}</div>
                                  <div className="text-sm text-white/60">Last sync: {integration.lastSync}</div>
                                </div>
                              </div>
                              <Badge className={`${
                                integration.connected
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              }`}>
                                {integration.connected ? 'Connected' : 'Disconnected'}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={integration.connected ? "outline" : "default"}
                                className={integration.connected
                                  ? "border-white/20 text-white hover:bg-white/10"
                                  : "bg-teal-600 hover:bg-teal-700"
                                }
                                onClick={() => toggleIntegration(integration.name)}
                              >
                                {integration.connected ? 'Disconnect' : 'Connect'}
                              </Button>
                              {(integration.name === 'OpenAI' || integration.name === 'Anthropic') && integration.connected ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                  onClick={() => toast({
                                    title: `${integration.name} Test`,
                                    description: `Testing live app generation and template functions...`,
                                  })}
                                >
                                  <Zap size={14} className="mr-1" />
                                  Test
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                onClick={() => toast({
                                  title: `${integration.name} Settings`,
                                  description: `Configure ${integration.name} integration settings`,
                                })}
                              >
                                <Settings size={14} />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

            </>
          ) : (
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users size={20} className="mr-2" />
                  Select Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className="p-3 rounded-lg border cursor-pointer transition-all border-white/20 hover:border-white/40 bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{team.name}</h4>
                        <Badge className="bg-white/20 text-white border-white/20" variant="outline">
                          {team.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{team.description}</p>
                      <div className="flex items-center text-xs text-white/60">
                        <Users size={12} className="mr-1" />
                        {team.memberCount} members
                      </div>
                    </div>
                  ))}
                  {teams.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No teams yet</p>
                      <p className="text-xs">Create a team to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}