import { TrendingUp, BarChart3, Users, Clock } from 'lucide-react';

export default function Analytics() {
  const stats = [
    { label: 'Total Prompts Generated', value: '1,234', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Active Users', value: '89', icon: Users, color: 'text-green-600' },
    { label: 'Avg. Response Time', value: '2.3s', icon: Clock, color: 'text-orange-600' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-purple-600' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-rose-600" size={32} />
        <h2 className="text-3xl font-bold text-slate-900">Usage Analytics</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={stat.color} size={24} />
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
            </div>
            <p className="text-slate-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Prompt Generation Trends</h3>
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
          <p className="text-slate-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  );
}
