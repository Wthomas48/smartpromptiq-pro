import { useState } from 'react';
import { Users, Plus, Mail, Crown, Shield } from 'lucide-react';

export default function Teams() {
  const [team] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', avatar: 'AJ' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', avatar: 'BS' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', avatar: 'CD' }
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Crown className="text-yellow-600" size={16} />;
      case 'Editor': return <Shield className="text-blue-600" size={16} />;
      default: return <Users className="text-slate-600" size={16} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-cyan-600" size={32} />
        <h2 className="text-3xl font-bold text-slate-900">Team Collaboration</h2>
      </div>

      {/* Add Member Button */}
      <div className="mb-6">
        <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2">
          <Plus size={20} />
          Invite Team Member
        </button>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
        </div>
        
        <div className="divide-y divide-slate-200">
          {team.map((member) => (
            <div key={member.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{member.name}</h4>
                  <p className="text-slate-600 text-sm flex items-center gap-1">
                    <Mail size={14} />
                    {member.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getRoleIcon(member.role)}
                <span className="text-sm font-medium text-slate-700">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Prompts Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Shared Prompts</h3>
        <div className="text-slate-600">
          <p>Collaborate on prompts with your team members. Share templates, get feedback, and maintain consistency across your organization.</p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900">Marketing Templates</h4>
              <p className="text-sm text-slate-600 mt-1">12 shared prompts</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900">Development Guides</h4>
              <p className="text-sm text-slate-600 mt-1">8 shared prompts</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900">Content Creation</h4>
              <p className="text-sm text-slate-600 mt-1">15 shared prompts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
