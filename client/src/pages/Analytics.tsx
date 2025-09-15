import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
  ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Target, Zap, Award,
  Calendar, Clock, Filter, Download, RefreshCw, ChevronDown,
  Activity, Brain, MessageSquare, Star, Lightbulb, CheckCircle,
  ArrowUp, ArrowDown, Eye, Heart, Share2, Bookmark, Settings,
  UserPlus, Globe, Shield, Crown, Trophy, Flame, Rocket,
  Bell, Search, MoreVertical, Filter as FilterIcon,
  AlertCircle, ChevronRight, PieChart as PieIcon, BarChart3
} from 'lucide-react';
import BackButton from '@/components/BackButton';

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, insights
  const [filterBy, setFilterBy] = useState('all');
  const [showNotifications, setShowNotifications] = useState(true);

  // Enhanced team data with comprehensive metrics
  const teams = [
    { id: 'all', name: 'All Teams', members: 24 },
    { id: 'marketing', name: 'Marketing Team', members: 6 },
    { id: 'development', name: 'Development Team', members: 8 },
    { id: 'design', name: 'Design Team', members: 5 },
    { id: 'product', name: 'Product Team', members: 5 }
  ];

  const performanceData = [
    { name: 'Mon', prompts: 45, quality: 92, engagement: 78, efficiency: 85, collaboration: 88, innovation: 76 },
    { name: 'Tue', prompts: 52, quality: 89, engagement: 82, efficiency: 90, collaboration: 85, innovation: 79 },
    { name: 'Wed', prompts: 38, quality: 94, engagement: 85, efficiency: 88, collaboration: 92, innovation: 88 },
    { name: 'Thu', prompts: 67, quality: 87, engagement: 79, efficiency: 92, collaboration: 87, innovation: 81 },
    { name: 'Fri', prompts: 71, quality: 91, engagement: 88, efficiency: 94, collaboration: 90, innovation: 85 },
    { name: 'Sat', prompts: 29, quality: 96, engagement: 92, efficiency: 78, collaboration: 85, innovation: 90 },
    { name: 'Sun', prompts: 34, quality: 93, engagement: 86, efficiency: 82, collaboration: 88, innovation: 87 }
  ];

  const categoryData = [
    { name: 'Marketing', value: 35, color: '#8B5CF6' },
    { name: 'Development', value: 28, color: '#06B6D4' },
    { name: 'Education', value: 22, color: '#10B981' },
    { name: 'Finance', value: 15, color: '#F59E0B' }
  ];

  const teamMembersData = [
    { 
      name: 'Alice Johnson', prompts: 156, quality: 94, avatar: '👩‍💻', 
      role: 'Lead Designer', trend: '+12%', team: 'design', status: 'online',
      efficiency: 92, collaboration: 89, innovation: 95, lastActive: '2 min ago',
      achievements: ['Top Performer', 'Innovation Leader'], level: 'Expert'
    },
    { 
      name: 'Bob Smith', prompts: 142, quality: 91, avatar: '👨‍💼', 
      role: 'Product Manager', trend: '+8%', team: 'product', status: 'online',
      efficiency: 88, collaboration: 95, innovation: 82, lastActive: '5 min ago',
      achievements: ['Team Leader', 'Mentor'], level: 'Senior'
    },
    { 
      name: 'Carol Davis', prompts: 128, quality: 96, avatar: '👩‍🎨', 
      role: 'Creative Director', trend: '+15%', team: 'design', status: 'away',
      efficiency: 95, collaboration: 88, innovation: 98, lastActive: '1 hour ago',
      achievements: ['Quality Champion', 'Creative Genius'], level: 'Expert'
    },
    { 
      name: 'David Wilson', prompts: 134, quality: 88, avatar: '👨‍💻', 
      role: 'Full Stack Developer', trend: '+5%', team: 'development', status: 'online',
      efficiency: 90, collaboration: 85, innovation: 78, lastActive: 'Just now',
      achievements: ['Code Quality', 'Fast Delivery'], level: 'Senior'
    },
    {
      name: 'Emma Chen', prompts: 189, quality: 97, avatar: '👩‍🚀',
      role: 'Marketing Strategist', trend: '+18%', team: 'marketing', status: 'online',
      efficiency: 96, collaboration: 92, innovation: 94, lastActive: '3 min ago',
      achievements: ['Top Performer', 'Strategy Expert'], level: 'Expert'
    },
    {
      name: 'Frank Rodriguez', prompts: 167, quality: 89, avatar: '👨‍🎯',
      role: 'UX Researcher', trend: '+9%', team: 'design', status: 'busy',
      efficiency: 87, collaboration: 94, innovation: 86, lastActive: '15 min ago',
      achievements: ['Research Pro', 'User Advocate'], level: 'Senior'
    }
  ];

  const realtimeMetrics = [
    { icon: Brain, label: 'AI Requests', value: '2,847', change: '+23%', trend: 'up', description: 'Total AI model requests today' },
    { icon: MessageSquare, label: 'Prompts Generated', value: '1,249', change: '+18%', trend: 'up', description: 'Successful prompt generations' },
    { icon: Star, label: 'Quality Score', value: '92.4%', change: '+2.1%', trend: 'up', description: 'Average output quality rating' },
    { icon: Zap, label: 'Response Time', value: '1.2s', change: '-15%', trend: 'up', description: 'Average API response time' },
    { icon: Users, label: 'Active Members', value: '18', change: '+3', trend: 'up', description: 'Currently online team members' },
    { icon: Trophy, label: 'Team Score', value: '2,394', change: '+156', trend: 'up', description: 'Collaborative achievement points' },
    { icon: Target, label: 'Goals Met', value: '89%', change: '+7%', trend: 'up', description: 'Weekly objectives completed' },
    { icon: Rocket, label: 'Innovation Index', value: '8.7/10', change: '+0.3', trend: 'up', description: 'Creative solution effectiveness' }
  ];

  const activityData = [
    { time: '00:00', activity: 12 },
    { time: '04:00', activity: 8 },
    { time: '08:00', activity: 34 },
    { time: '12:00', activity: 67 },
    { time: '16:00', activity: 89 },
    { time: '20:00', activity: 45 }
  ];

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAnimationKey(prev => prev + 1);
    }, 1500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ icon: Icon, label, value, change, trend }) => (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${
          trend === 'up' ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-rose-500/20'
        }`}>
          <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
          {value}
        </h3>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  );

  const TeamMemberCard = ({ member }) => (
    <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{member.avatar}</div>
        <div className="flex-1">
          <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">
            {member.name}
          </h4>
          <p className="text-slate-400 text-xs">{member.role}</p>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">{member.prompts}</div>
          <div className="text-green-400 text-xs">{member.trend}</div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-slate-400 text-xs">Quality Score</span>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${member.quality}%` }}
            />
          </div>
          <span className="text-white text-xs font-medium">{member.quality}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <BackButton />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-2">
              Team Analytics Dashboard
            </h1>
            <p className="text-slate-400">Real-time insights into your team's AI-powered productivity</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button className="bg-slate-800 text-white border border-slate-700 px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" key={`metrics-${animationKey}`}>
          {realtimeMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Trend */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Team Performance Trend</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-slate-400 text-sm">Prompts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-slate-400 text-sm">Quality</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="promptsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="prompts" 
                  stroke="#6366F1" 
                  fillOpacity={1} 
                  fill="url(#promptsGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="quality" 
                  stroke="#8B5CF6" 
                  fillOpacity={1} 
                  fill="url(#qualityGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Members Performance */}
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Team Performance</h3>
              <button className="text-slate-400 hover:text-white transition-colors">
                <Eye className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {teamMembersData.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6">Daily Activity Pattern</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }} 
                />
                <Bar dataKey="activity" radius={[4, 4, 0, 0]}>
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 20}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 py-2 px-3 rounded-lg text-sm hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Insights</span>
              </button>
              <button className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 py-2 px-3 rounded-lg text-sm hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 flex items-center justify-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 py-2 px-3 rounded-lg text-sm hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 flex items-center justify-center space-x-2">
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;