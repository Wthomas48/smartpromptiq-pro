import React, { useState, useEffect } from 'react';
import { apiRequest as originalApiRequest } from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  GraduationCap,
  Users,
  Trophy,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Activity,
  RefreshCw,
} from 'lucide-react';

// Simple wrapper to handle the API calls correctly
const apiRequest = async (url: string, options: { method: string; body?: any; headers?: any } = { method: 'GET' }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated. Please login as admin.');
    }

    const response = await originalApiRequest(options.method || 'GET', url, options.body);
    return await response.json();
  } catch (error: any) {
    console.error('❌ API Error:', error);
    if (error.message?.includes('Invalid token') || error.message?.includes('Unauthorized') || error.message?.includes('401')) {
      throw new Error('Admin authentication required. Please login as admin first.');
    }
    throw error;
  }
};

interface AcademyStats {
  overview: {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedCourses: number;
    totalCertificates: number;
    totalLessons: number;
    completionRate: number;
    recentEnrollments: number;
  };
  recentActivity: any[];
  topCourses: any[];
}

const AdminDashboardAcademy: React.FC = () => {
  const [academyStats, setAcademyStats] = useState<AcademyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAcademyStats();
  }, []);

  const fetchAcademyStats = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      console.log('Fetching SmartPromptIQ Academy statistics...');

      const response = await apiRequest('/api/academy/admin/stats', {
        method: 'GET',
      });

      console.log('Academy stats response:', response);

      if (response.success) {
        setAcademyStats(response.data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching academy stats:', error);
      if (!error.message?.includes('Admin authentication required')) {
        alert('Failed to fetch academy statistics. Please check your connection.');
      }
      setAcademyStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAcademyStats(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading Academy Statistics...</p>
        </div>
      </div>
    );
  }

  if (!academyStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Academy Stats</CardTitle>
            <CardDescription>Unable to fetch academy statistics. Please ensure you're logged in as admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overview, recentActivity, topCourses } = academyStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            SmartPromptIQ Academy
          </h2>
          <p className="text-gray-600 mt-1">Course operations and enrollment monitoring</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {overview.publishedCourses} published
            </p>
          </CardContent>
        </Card>

        {/* Total Enrollments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              {overview.activeEnrollments} active
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {overview.completedCourses} completed
            </p>
          </CardContent>
        </Card>

        {/* Certificates Issued */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Trophy className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              {overview.totalLessons} total lessons
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Enrollments</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.recentEnrollments}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Activity className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Award className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Top Performing Courses
          </CardTitle>
          <CardDescription>Most popular courses by enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          {topCourses && topCourses.length > 0 ? (
            <div className="space-y-4">
              {topCourses.map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {course.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{course.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {course.enrollmentCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">enrollments</div>
                    {course.averageRating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs font-medium">{course.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No course data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Enrollment Activity
          </CardTitle>
          <CardDescription>Latest course enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {enrollment.course?.title || 'Course'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {enrollment.enrollmentType} enrollment
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                      {enrollment.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Operations Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-900">API Status</p>
                <p className="text-xs text-green-700">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-900">Database</p>
                <p className="text-xs text-green-700">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-900">Email Service</p>
                <p className="text-xs text-green-700">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardAcademy;
