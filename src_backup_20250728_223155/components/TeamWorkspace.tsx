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
import { Users, Plus, Settings, Crown, Shield, User, Eye, Share2, UserPlus } from "lucide-react";

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
}

export default function TeamWorkspace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);

  // Fetch user's teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch team members for selected team
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/teams", selectedTeam, "members"],
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Workspaces</h2>
          <p className="text-slate-600">Collaborate on prompts with your team</p>
        </div>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus size={16} className="mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              <Button type="submit" disabled={createTeamMutation.isPending} className="w-full">
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users size={20} className="mr-2" />
                Your Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTeam === team.id
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{team.name}</h4>
                    <Badge className={roleColors[team.role as keyof typeof roleColors]} variant="secondary">
                      {team.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{team.description}</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Users size={12} className="mr-1" />
                    {team.memberCount} members
                  </div>
                </div>
              ))}
              {teams.length === 0 && (
                <div className="text-center py-8 text-slate-500">
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <div className="flex space-x-2">
                    <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserPlus size={16} className="mr-2" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
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
                          <Button type="submit" disabled={inviteUserMutation.isPending} className="w-full">
                            {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
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
                      <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-slate-600">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={roleColors[member.role as keyof typeof roleColors]} variant="secondary">
                            <RoleIcon size={12} className="mr-1" />
                            {member.role}
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Users size={48} className="mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Team</h3>
                  <p className="text-slate-600">Choose a team to view members and collaboration tools</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}