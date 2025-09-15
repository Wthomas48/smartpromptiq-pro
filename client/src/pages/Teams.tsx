import { useState } from "react";
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
import { Users, Plus, Settings, Crown, Shield, User, Eye, Share2, UserPlus, BarChart3, Target, TrendingUp, Calendar, Clock, MessageSquare, FileText, Activity, Zap, ExternalLink, Rocket, Sparkles } from "lucide-react";

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
}

export default function Teams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'workspace', label: 'Team Workspace', icon: '🏢' },
    { id: 'dashboard', label: 'Team Dashboard', icon: '🚀' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  // Fetch user's teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Demo teams data when no real teams exist
  const mockTeams: Team[] = [
    { id: 1, name: "Design Team", description: "UI/UX design and creative projects", ownerId: "user1", memberCount: 5, role: "owner" },
    { id: 2, name: "Development Team", description: "Full-stack development and engineering", ownerId: "user2", memberCount: 8, role: "admin" },
    { id: 3, name: "Marketing Team", description: "Digital marketing and growth", ownerId: "user3", memberCount: 4, role: "member" }
  ];

  // Use real teams or show demo teams
  const displayTeams = teams.length > 0 ? teams : mockTeams;

  // Fetch team members for selected team
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/teams", selectedTeam, "members"],
    enabled: !!selectedTeam,
  });

  // Demo team members when no real members exist
  const mockTeamMembers: TeamMember[] = [
    { id: "1", firstName: "Alice", lastName: "Johnson", email: "alice@company.com", role: "owner", joinedAt: "2024-01-15", activityScore: 95 },
    { id: "2", firstName: "Bob", lastName: "Smith", email: "bob@company.com", role: "admin", joinedAt: "2024-01-20", activityScore: 88 },
    { id: "3", firstName: "Carol", lastName: "Davis", email: "carol@company.com", role: "member", joinedAt: "2024-01-25", activityScore: 92 },
    { id: "4", firstName: "David", lastName: "Wilson", email: "david@company.com", role: "member", joinedAt: "2024-02-01", activityScore: 79 }
  ];

  // Use real members or show demo members when team is selected
  const displayMembers = (teamMembers.length > 0 || teams.length > 0) ? teamMembers : (selectedTeam ? mockTeamMembers : []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Sparkles className="mr-3 text-yellow-400 animate-pulse" size={32} />
              Teams
              <Badge className="ml-3 bg-green-500/20 text-green-300 border-green-500/30">
                {displayTeams.length} Active
              </Badge>
            </h1>
            <p className="text-purple-200">Manage your team collaboration and projects</p>
          </div>
          <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
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
                <Button type="submit" disabled={createTeamMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                  {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-6 bg-white/10 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all text-sm ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2" />
                    Welcome to Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Collaborate effectively with your team members, manage projects, and track progress.</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Teams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{teams.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Active Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {teams.reduce((total, team) => total + team.memberCount, 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {teams.find(team => team.role === 'owner') ? 'Team Owner' : 
                       teams.find(team => team.role === 'admin') ? 'Team Admin' : 'Team Member'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Teams List Overview */}
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Your Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayTeams.map((team) => (
                      <div
                        key={team.id}
                        onClick={() => {
                          setSelectedTeam(team.id);
                          setActiveTab('workspace');
                        }}
                        className="p-4 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-all border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{team.name}</h4>
                          <Badge className={`${roleColors[team.role as keyof typeof roleColors]} text-gray-900`} variant="secondary">
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
                        <p className="text-xs">Create a team to start collaborating</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Teams List */}
                <div className="lg:col-span-1">
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Users size={20} className="mr-2" />
                        Your Teams
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {displayTeams.map((team) => (
                        <div
                          key={team.id}
                          onClick={() => setSelectedTeam(team.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTeam === team.id
                              ? "border-purple-300 bg-purple-500/20"
                              : "border-white/20 hover:border-white/40 bg-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{team.name}</h4>
                            <Badge className={`${roleColors[team.role as keyof typeof roleColors]} text-gray-900`} variant="secondary">
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
                          <p className="text-xs">Create a team to collaborate</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Team Details */}
                <div className="lg:col-span-2">
                  {selectedTeam ? (
                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">Team Members</CardTitle>
                          <div className="flex space-x-2">
                            <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                  <UserPlus size={16} className="mr-2" />
                                  Invite
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
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                              <Settings size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {teamMembers.map((member) => {
                            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                            return (
                              <div key={member.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-purple-600 text-white">
                                      {member.firstName?.[0]}{member.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-white">
                                      {member.firstName} {member.lastName}
                                    </div>
                                    <div className="text-sm text-white/70">{member.email}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`${roleColors[member.role as keyof typeof roleColors]} text-gray-900`} variant="secondary">
                                    <RoleIcon size={12} className="mr-1" />
                                    {member.role}
                                  </Badge>
                                  <div className="text-xs text-white/60">
                                    {new Date(member.joinedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {teamMembers.length === 0 && (
                            <div className="text-center py-8 text-white/60">
                              <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                              <p>No team members yet</p>
                              <p className="text-xs">Invite members to start collaborating</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardContent className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <Users size={48} className="mx-auto mb-4 text-white/40" />
                          <h3 className="text-lg font-medium text-white mb-2">Select a Team</h3>
                          <p className="text-white/70">Choose a team to view members and collaboration tools</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && selectedTeam && (
            <div className="space-y-6">
              {/* Enhanced Navigation to Full Dashboard */}
              <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <Rocket className="text-white animate-bounce" size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center">
                          <Sparkles className="mr-2 animate-spin" size={20} />
                          Enhanced Team Dashboard
                        </h3>
                        <p className="text-white/80 mt-1">
                          Experience the full-featured team collaboration dashboard with analytics, file sharing, and AI integrations
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-white/70">
                          <span>• 7 Advanced Tabs</span>
                          <span>• Real-time Analytics</span>
                          <span>• File Sharing</span>
                          <span>• AI Integration</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all hover:scale-105"
                      onClick={() => setLocation('/team-dashboard')}
                    >
                      <ExternalLink size={20} className="mr-2" />
                      Launch Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Dashboard Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="text-blue-300" size={24} />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-white">12</div>
                        <div className="text-sm text-white/70">Active Projects</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="text-green-300" size={24} />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-white">87%</div>
                        <div className="text-sm text-white/70">Completion Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Users className="text-purple-300" size={24} />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
                        <div className="text-sm text-white/70">Team Members</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Zap className="text-orange-300" size={24} />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-white">92%</div>
                        <div className="text-sm text-white/70">Team Activity</div>
                      </div>
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
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <FileText size={14} className="text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">New project "Website Redesign" created</p>
                          <p className="text-xs text-white/60">by Alice Johnson • 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <UserPlus size={14} className="text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">Bob Smith joined the team</p>
                          <p className="text-xs text-white/60">by Team Admin • 4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <MessageSquare size={14} className="text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">3 new comments on Marketing Campaign</p>
                          <p className="text-xs text-white/60">by Various • 6 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Target size={14} className="text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">Task "UI Design" completed</p>
                          <p className="text-xs text-white/60">by Carol Davis • 8 hours ago</p>
                        </div>
                      </div>
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
                    <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white" variant="outline">
                      <Plus className="mr-2" size={16} />
                      Create New Project
                    </Button>
                    <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white" variant="outline" onClick={() => setShowInviteUser(true)}>
                      <UserPlus className="mr-2" size={16} />
                      Invite Team Member
                    </Button>
                    <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white" variant="outline">
                      <MessageSquare className="mr-2" size={16} />
                      Start Discussion
                    </Button>
                    <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white" variant="outline">
                      <Calendar className="mr-2" size={16} />
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Team Progress Overview */}
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <BarChart3 className="mr-2" size={20} />
                    Team Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Website Redesign</h4>
                        <Badge variant="default" className="bg-green-600 text-white">Active</Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-3">Complete redesign of company website with modern UI/UX</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Progress</span>
                        <span className="text-sm font-medium text-white">75%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Due: Dec 15, 2024
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          5 members assigned
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Marketing Campaign</h4>
                        <Badge variant="secondary" className="bg-yellow-600 text-white">In Review</Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-3">Q4 marketing campaign for product launch</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Progress</span>
                        <span className="text-sm font-medium text-white">45%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Due: Nov 30, 2024
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          3 members assigned
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <BarChart3 className="mr-2" />
                    Team Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {teams.reduce((total, team) => total + team.memberCount, 0)}
                      </div>
                      <div className="text-sm text-white/70">Total Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">94%</div>
                      <div className="text-sm text-white/70">Team Activity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{teams.length}</div>
                      <div className="text-sm text-white/70">Active Teams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">12</div>
                      <div className="text-sm text-white/70">Projects</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Team Performance</h4>
                    {displayTeams.map((team) => (
                      <div key={team.id} className="p-3 bg-white/10 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{team.name}</span>
                          <span className="text-sm text-white/70">{team.memberCount} members</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

