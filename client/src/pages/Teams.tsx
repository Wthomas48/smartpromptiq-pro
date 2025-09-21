import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users, Plus, Settings, Crown, Shield, User, Eye, Share2, UserPlus, BarChart3, Target, TrendingUp,
  Calendar, Clock, MessageSquare, FileText, Activity, Zap, ExternalLink, Rocket, Sparkles, ArrowLeft,
  Video, Phone, Mic, MicOff, VideoOff, Upload, Download, Search, Filter, MoreHorizontal, Edit,
  Trash2, Mail, Bell, Star, Heart, ThumbsUp, Send, Paperclip, Image, Smile, ChevronDown,
  PlayCircle, PauseCircle, Volume2, VolumeX, Maximize, Minimize, Copy, CheckCircle, AlertCircle,
  Folder, File, Archive, Link, Globe, Lock, Unlock, Wifi, WifiOff, Laptop, Smartphone, Tablet
} from "lucide-react";

// Custom Tab Components
const Tabs = ({ defaultValue, children, className = "" }: any) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={`w-full ${className}`} data-active-tab={activeTab}>
      {(Array.isArray(children) ? children : []).map((child: any) =>
        child.type.name === 'TabsList'
          ? { ...child, props: { ...child.props, activeTab, setActiveTab } }
          : child.props.value === activeTab ? child : null
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: any) => (
  <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4">
    {(Array.isArray(children) ? children : []).map((child: any) => ({
      ...child,
      props: { ...child.props, activeTab, setActiveTab }
    }))}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      activeTab === value
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children }: any) => (
  <div className="space-y-4">{children}</div>
);

// Custom Progress Component
const Progress = ({ value = 0, className = "" }: { value?: number; className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
    <div
      className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Custom ScrollArea Component
const ScrollArea = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);

interface Team {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  memberCount: number;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  projects: number;
  completedTasks: number;
  totalTasks: number;
  productivity: number;
  collaboration: number;
  activity: number;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedAt: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  dueDate: string;
  assignedMembers: string[];
  priority: 'low' | 'medium' | 'high';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image' | 'video';
  attachments?: any[];
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  owner: string;
  shared: boolean;
}

const mockTeams: Team[] = [
  {
    id: 1,
    name: "AI Development Team",
    description: "Building next-generation AI solutions for enterprise clients",
    ownerId: "user1",
    memberCount: 8,
    role: "owner",
    status: 'active',
    createdAt: "2024-01-15",
    projects: 5,
    completedTasks: 127,
    totalTasks: 150,
    productivity: 85,
    collaboration: 92,
    activity: 78
  },
  {
    id: 2,
    name: "Marketing Analytics",
    description: "Data-driven marketing strategies and campaign optimization",
    ownerId: "user2",
    memberCount: 6,
    role: "member",
    status: 'active',
    createdAt: "2024-02-01",
    projects: 3,
    completedTasks: 89,
    totalTasks: 120,
    productivity: 74,
    collaboration: 88,
    activity: 82
  },
  {
    id: 3,
    name: "Product Design Hub",
    description: "Creating beautiful and intuitive user experiences",
    ownerId: "user3",
    memberCount: 4,
    role: "admin",
    status: 'active',
    createdAt: "2024-01-20",
    projects: 7,
    completedTasks: 156,
    totalTasks: 180,
    productivity: 87,
    collaboration: 95,
    activity: 90
  }
];

const mockMembers: TeamMember[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@company.com",
    role: "Team Lead",
    joinedAt: "2024-01-15",
    status: 'online',
    lastActive: "2024-03-15T10:30:00Z"
  },
  {
    id: "2",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@company.com",
    role: "Developer",
    joinedAt: "2024-01-20",
    status: 'online',
    lastActive: "2024-03-15T09:45:00Z"
  },
  {
    id: "3",
    firstName: "Carol",
    lastName: "Davis",
    email: "carol@company.com",
    role: "Designer",
    joinedAt: "2024-02-01",
    status: 'away',
    lastActive: "2024-03-15T08:15:00Z"
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Wilson",
    email: "david@company.com",
    role: "Developer",
    joinedAt: "2024-02-10",
    status: 'offline',
    lastActive: "2024-03-14T17:30:00Z"
  }
];

export default function Teams() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTeam, setActiveTeam] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated data
  const displayTeams = mockTeams || [];
  const displayMembers = mockMembers || [];

  const mockProjects: Project[] = [
    {
      id: 1,
      name: "Smart Analytics Dashboard",
      description: "Real-time analytics platform with AI insights",
      status: 'active',
      progress: 75,
      dueDate: "2024-04-15",
      assignedMembers: ["1", "2"],
      priority: 'high'
    },
    {
      id: 2,
      name: "Mobile App Redesign",
      description: "Complete UI/UX overhaul for mobile application",
      status: 'active',
      progress: 45,
      dueDate: "2024-05-01",
      assignedMembers: ["3", "4"],
      priority: 'medium'
    },
    {
      id: 3,
      name: "API Integration Suite",
      description: "Comprehensive API management and integration tools",
      status: 'completed',
      progress: 100,
      dueDate: "2024-03-01",
      assignedMembers: ["1", "2", "4"],
      priority: 'high'
    }
  ];

  const mockMessages: Message[] = [
    {
      id: "1",
      senderId: "1",
      senderName: "Alice Johnson",
      content: "Great progress on the analytics dashboard! The new charts look amazing.",
      timestamp: "2024-03-15T10:30:00Z",
      type: 'text'
    },
    {
      id: "2",
      senderId: "2",
      senderName: "Bob Smith",
      content: "Thanks! I've also added the real-time data sync feature.",
      timestamp: "2024-03-15T10:32:00Z",
      type: 'text'
    },
    {
      id: "3",
      senderId: "3",
      senderName: "Carol Davis",
      content: "The color scheme perfectly matches our brand guidelines. 🎨",
      timestamp: "2024-03-15T10:35:00Z",
      type: 'text'
    }
  ];

  const mockFiles: FileItem[] = [
    {
      id: "1",
      name: "Project Specifications",
      type: 'folder',
      modified: "2024-03-15",
      owner: "Alice Johnson",
      shared: true
    },
    {
      id: "2",
      name: "Dashboard_Mockups_v3.fig",
      type: 'file',
      size: 15728640,
      modified: "2024-03-14",
      owner: "Carol Davis",
      shared: false
    },
    {
      id: "3",
      name: "API_Documentation.pdf",
      type: 'file',
      size: 2097152,
      modified: "2024-03-13",
      owner: "Bob Smith",
      shared: true
    }
  ];

  const selectedTeam = displayTeams.find(team => team.id === activeTeam);

  const handleCreateTeam = () => {
    toast({
      title: "Team Created",
      description: `${newTeamName} has been created successfully.`,
    });
    setShowCreateDialog(false);
    setNewTeamName("");
    setNewTeamDescription("");
  };

  const handleInviteMember = () => {
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteEmail}`,
    });
    setShowInviteDialog(false);
    setInviteEmail("");
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the team.",
      });
      setMessageInput("");
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!selectedTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Teams
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(Array.isArray(displayTeams) ? displayTeams : []).map((team) => (
            <Card key={team.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
                  <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                    {team.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{team.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {team.memberCount} members
                    </span>
                    <span className="flex items-center">
                      <Folder className="w-4 h-4 mr-1" />
                      {team.projects} projects
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Tasks Progress</span>
                      <span>{Math.round((team.completedTasks / team.totalTasks) * 100)}%</span>
                    </div>
                    <Progress value={(team.completedTasks / team.totalTasks) * 100} />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveTeam(team.id)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-gray-300">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <Plus className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">Create New Team</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Start collaborating with your team members
                  </p>
                </CardContent>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Team Name</label>
                    <Input
                      placeholder="Enter team name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Enter team description"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleCreateTeam} className="flex-1">
                      Create Team
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTeam(null)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Teams</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Crown className="w-8 h-8 mr-3 text-yellow-500" />
            {selectedTeam.name}
          </h1>
          <Badge variant={selectedTeam.status === 'active' ? 'default' : 'secondary'} className="text-sm">
            {selectedTeam.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowVideoCall(true)}>
            <Video className="w-4 h-4 mr-2" />
            Start Meeting
          </Button>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleInviteMember} className="flex-1">
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-gray-900">{selectedTeam.memberCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">{selectedTeam.projects}</p>
              </div>
              <Folder className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-3xl font-bold text-gray-900">{selectedTeam.productivity}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Done</p>
                <p className="text-3xl font-bold text-gray-900">{selectedTeam.completedTasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Laptop className="w-4 h-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Folder className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="messaging">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="files">
            <File className="w-4 h-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <Activity className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Members */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Team Members ({displayMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Array.isArray(displayMembers) ? displayMembers : []).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {member.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Share Document
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Team Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Alice Johnson", action: "completed task", item: "Dashboard Design Review", time: "2 hours ago", icon: CheckCircle, color: "text-green-600" },
                  { user: "Bob Smith", action: "uploaded file", item: "API_Documentation_v2.pdf", time: "4 hours ago", icon: Upload, color: "text-blue-600" },
                  { user: "Carol Davis", action: "created project", item: "Mobile App Redesign", time: "1 day ago", icon: Plus, color: "text-purple-600" },
                  { user: "David Wilson", action: "joined meeting", item: "Weekly Standup", time: "2 days ago", icon: Video, color: "text-orange-600" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-600"> {activity.action} </span>
                        <span className="font-medium">{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Workspace */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Laptop className="w-5 h-5 mr-2" />
                    Team Workspace
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Array.isArray(mockProjects) ? mockProjects : []).map((project) => (
                    <Card key={project.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <Badge variant={
                            project.priority === 'high' ? 'destructive' :
                            project.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {project.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />

                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Due: {new Date(project.dueDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {project.assignedMembers.length} members
                            </span>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workspace Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Workspace Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Rocket className="w-4 h-4 mr-2" />
                  Project Creator
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Goal Tracker
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Time Tracker
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Integrations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Folder className="w-5 h-5 mr-2" />
                  Team Projects ({mockProjects.length})
                </CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(mockProjects) ? mockProjects : []).map((project) => (
                  <Card key={project.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <Badge variant={
                              project.status === 'active' ? 'default' :
                              project.status === 'completed' ? 'secondary' : 'destructive'
                            }>
                              {project.status}
                            </Badge>
                            <Badge variant={
                              project.priority === 'high' ? 'destructive' :
                              project.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {project.priority} priority
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{project.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Progress</p>
                              <div className="mt-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{project.progress}% Complete</span>
                                </div>
                                <Progress value={project.progress} />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Due Date</p>
                              <p className="text-sm mt-1">{new Date(project.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Team Members</p>
                              <div className="flex -space-x-2 mt-1">
                                {(Array.isArray(project.assignedMembers) ? project.assignedMembers : []).map((memberId, index) => {
                                  const member = displayMembers.find(m => m.id === memberId);
                                  return member ? (
                                    <Avatar key={memberId} className="w-6 h-6 border-2 border-white">
                                      <AvatarFallback className="text-xs">
                                        {member.firstName[0]}{member.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Team Chat
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Voice Call
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 h-96 overflow-y-auto mb-4">
                  {(Array.isArray(mockMessages) ? mockMessages : []).map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {(Array.isArray(message.senderName.split(' ')) ? message.senderName.split(' ') : []).map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{message.senderName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Online Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2" />
                  Online ({displayMembers.filter(m => m.status === 'online').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Array.isArray(displayMembers.filter(member => member.status === 'online')) ? displayMembers.filter(member => member.status === 'online') : []).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <File className="w-5 h-5 mr-2" />
                  Team Files ({mockFiles.length})
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Array.isArray(mockFiles) ? mockFiles : []).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {file.type === 'folder' ? (
                        <Folder className="w-8 h-8 text-blue-600" />
                      ) : (
                        <File className="w-8 h-8 text-gray-600" />
                      )}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Modified: {file.modified}</span>
                          <span>Owner: {file.owner}</span>
                          {file.size && <span>Size: {formatFileSize(file.size)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.shared && <Globe className="w-4 h-4 text-green-600" />}
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Team Productivity</span>
                      <span className="text-sm text-gray-600">{selectedTeam.productivity}%</span>
                    </div>
                    <Progress value={selectedTeam.productivity} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Collaboration Score</span>
                      <span className="text-sm text-gray-600">{selectedTeam.collaboration}%</span>
                    </div>
                    <Progress value={selectedTeam.collaboration} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Activity Level</span>
                      <span className="text-sm text-gray-600">{selectedTeam.activity}%</span>
                    </div>
                    <Progress value={selectedTeam.activity} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Project Milestone", description: "Completed Dashboard Design Phase", date: "2 days ago", icon: Target },
                    { title: "Team Collaboration", description: "100% participation in weekly standup", date: "1 week ago", icon: Users },
                    { title: "Quality Delivery", description: "Zero bugs in last deployment", date: "1 week ago", icon: CheckCircle },
                    { title: "Innovation", description: "Implemented new AI feature", date: "2 weeks ago", icon: Sparkles }
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <achievement.icon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{achievement.title}</p>
                        <p className="text-sm text-green-700">{achievement.description}</p>
                        <p className="text-xs text-green-600 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Activity Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "10:30 AM", user: "Alice Johnson", action: "Started code review for Dashboard component", type: "code" },
                  { time: "9:45 AM", user: "Bob Smith", action: "Deployed version 2.1.0 to staging environment", type: "deploy" },
                  { time: "9:15 AM", user: "Carol Davis", action: "Updated design specifications for mobile app", type: "design" },
                  { time: "8:30 AM", user: "David Wilson", action: "Resolved 3 critical bugs in authentication module", type: "bug" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs text-gray-500 w-20 mt-1">{activity.time}</div>
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      activity.type === 'code' ? 'bg-blue-500' :
                      activity.type === 'deploy' ? 'bg-green-500' :
                      activity.type === 'design' ? 'bg-purple-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-600"> {activity.action}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">{selectedTeam.totalTasks}</p>
                      <p className="text-xs text-green-600 mt-1">↗ +12% from last month</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{Math.round((selectedTeam.completedTasks / selectedTeam.totalTasks) * 100)}%</p>
                      <p className="text-xs text-green-600 mt-1">↗ +5% from last month</p>
                    </div>
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                      <p className="text-3xl font-bold text-gray-900">2.3h</p>
                      <p className="text-xs text-red-600 mt-1">↗ +8% from last month</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Task Completion</span>
                        <span>Weekly Average: 18 tasks</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 h-20">
                        {(Array.isArray([65, 72, 68, 85, 90, 78, 82]) ? [65, 72, 68, 85, 90, 78, 82] : []).map((height, index) => (
                          <div key={index} className="bg-blue-200 rounded-sm flex items-end">
                            <div
                              className="w-full bg-blue-600 rounded-sm transition-all duration-300"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 text-center">
                        {(Array.isArray(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : []).map(day => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Code Reviews</span>
                        <span>Weekly Average: 12 reviews</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 h-16">
                        {(Array.isArray([45, 58, 52, 68, 75, 60, 65]) ? [45, 58, 52, 68, 75, 60, 65] : []).map((height, index) => (
                          <div key={index} className="bg-green-200 rounded-sm flex items-end">
                            <div
                              className="w-full bg-green-600 rounded-sm transition-all duration-300"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Bug Reports</span>
                        <span>Weekly Average: 3 bugs</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 h-12">
                        {(Array.isArray([25, 15, 30, 10, 5, 20, 12]) ? [25, 15, 30, 10, 5, 20, 12] : []).map((height, index) => (
                          <div key={index} className="bg-red-200 rounded-sm flex items-end">
                            <div
                              className="w-full bg-red-600 rounded-sm transition-all duration-300"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Member Contributions</h4>
                      <div className="space-y-3">
                        {(Array.isArray(displayMembers) ? displayMembers : []).map((member, index) => {
                          const contributions = [85, 72, 68, 91][index] || 75;
                          return (
                            <div key={member.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{member.firstName} {member.lastName}</span>
                                <span>{contributions}%</span>
                              </div>
                              <Progress value={contributions} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Activity Distribution</h4>
                      <div className="space-y-2">
                        {[
                          { activity: "Development", percentage: 45, color: "bg-blue-600" },
                          { activity: "Code Review", percentage: 25, color: "bg-green-600" },
                          { activity: "Testing", percentage: 15, color: "bg-yellow-600" },
                          { activity: "Documentation", percentage: 10, color: "bg-purple-600" },
                          { activity: "Meetings", percentage: 5, color: "bg-gray-600" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm flex-1">{item.activity}</span>
                            <span className="text-sm font-medium">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Call Modal */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[600px] relative overflow-hidden">
            {/* Video Call Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-red-600 w-3 h-3 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">Live • {selectedTeam.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">12:34</span>
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <Minimize className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main Video Area */}
            <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
                {/* Self Video */}
                <div className="bg-gray-700 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-white text-sm font-medium">You</span>
                  </div>
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Participant Video */}
                <div className="bg-gray-700 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-600 opacity-20" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-white text-sm font-medium">Alice Johnson</span>
                  </div>
                </div>
              </div>

              {/* Screen Share Indicator */}
              {isScreenSharing && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Laptop className="w-5 h-5" />
                    <span>You are sharing your screen</span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Call Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
                className={`rounded-full w-14 h-14 ${isMuted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`rounded-full w-14 h-14 ${isVideoOff ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`rounded-full w-14 h-14 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white'}`}
              >
                <Laptop className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white rounded-full w-14 h-14"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white rounded-full w-14 h-14"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={() => {
                  setShowVideoCall(false);
                  setIsMuted(false);
                  setIsVideoOff(false);
                  setIsScreenSharing(false);
                }}
                className="bg-red-600 hover:bg-red-700 rounded-full w-14 h-14"
              >
                <Phone className="w-5 h-5 rotate-[135deg]" />
              </Button>
            </div>

            {/* Chat Sidebar */}
            <div className="absolute right-4 top-16 bottom-20 w-80 bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Live Chat ({displayMembers.length} participants)
              </h4>
              <ScrollArea className="h-32 mb-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-blue-400 font-medium">Alice:</span>
                    <span className="text-gray-300 ml-1">Thanks for joining everyone!</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-400 font-medium">Bob:</span>
                    <span className="text-gray-300 ml-1">Can you share your screen?</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-purple-400 font-medium">You:</span>
                    <span className="text-gray-300 ml-1">Sure, one moment...</span>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex">
                <Input
                  placeholder="Type a message..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 ml-2">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}