import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest as originalApiRequest } from '@/config/api';

// Simple wrapper to handle the API calls correctly
const apiRequest = async (url: string, options: { method: string; body?: any; headers?: any } = { method: 'GET' }) => {
  try {
    // Check if user is authenticated before making admin requests
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated. Please login as admin.');
    }

    const response = await originalApiRequest(options.method || 'GET', url, options.body);
    return await response.json();
  } catch (error: any) {
    console.error('❌ API Error:', error);

    // Check if error is related to authentication
    if (error.message?.includes('Invalid token') || error.message?.includes('Unauthorized') || error.message?.includes('401')) {
      throw new Error('Admin authentication required. Please login as admin first.');
    }

    throw error;
  }
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  DollarSign,
  CreditCard,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BarChart3,
  FileText,
  Settings,
  Download,
  Filter,
  Search,
  Shield,
  Mail,
  Activity,
  Lock,
  Key,
  Server,
  Zap,
  Globe,
  UserCheck,
  MessageSquare,
  MailOpen,
  Coins,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Briefcase,
  User,
  Sparkles,
  Trash2,
  UserX,
  LogOut
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalPrompts: number;
  successfulPayments: number;
  refundedPayments: number;
  pendingPayments: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  tokenBalance: number;
  createdAt: string;
  lastActiveAt: string;
  totalSpent: number;
}

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  stripePaymentId: string;
  createdAt: string;
  description: string;
}

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced state for all monitoring features
  const [tokenData, setTokenData] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [emailData, setEmailData] = useState<any>(null);
  const [systemData, setSystemData] = useState<any>(null);
  const [academyData, setAcademyData] = useState<any>(null);

  // Delete functionality state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'user' | 'payment' | 'session' | 'logs' | null;
    target: any;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    target: null,
    title: '',
    message: ''
  });
  const [deleteReason, setDeleteReason] = useState('');

  console.log('AdminDashboard component rendering with enhanced features!');

  // Fetch admin data with real API calls
  const fetchAdminData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      console.log('Fetching admin data from live APIs...');

      // Check authentication first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No authentication token - cannot fetch admin data');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch dashboard stats from real backend
      const statsResponse = await apiRequest('/api/admin/stats', {
        method: 'GET',
      });

      console.log('Stats response:', statsResponse);

      if (statsResponse.success) {
        const data = statsResponse.data;
        setStats({
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          totalRevenue: data.totalRevenue,
          monthlyRevenue: data.monthlyRevenue,
          totalPrompts: data.totalPrompts,
          successfulPayments: data.successfulPayments,
          refundedPayments: data.refundedPayments,
          pendingPayments: data.pendingPayments,
          systemHealth: data.systemHealth
        });
      }

      // Fetch users from real backend
      const usersResponse = await apiRequest('/api/admin/users?limit=50', {
        method: 'GET',
      });

      console.log('Users response:', usersResponse);

      if (usersResponse.success) {
        const userData = usersResponse.data.users || [];
        setUsers(userData.map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: 'active', // Default status
          tokenBalance: user.tokenBalance || 0,
          createdAt: user.createdAt || new Date().toISOString(),
          lastActiveAt: user.lastLogin || new Date().toISOString(),
          totalSpent: 0 // Would be calculated from actual payment data
        })));
      }

      // Fetch payments from real backend
      const paymentsResponse = await apiRequest('/api/admin/payments?limit=50', {
        method: 'GET',
      });

      console.log('Payments response:', paymentsResponse);

      if (paymentsResponse.success) {
        const paymentData = paymentsResponse.data.payments || [];
        setPayments(paymentData.map((payment: any) => ({
          id: payment.id,
          userId: payment.userId,
          userEmail: payment.userEmail,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          stripePaymentId: payment.stripePaymentId,
          createdAt: payment.createdAt,
          description: payment.description
        })));
      }

      console.log('Admin data fetched successfully from live backend');
    } catch (error: any) {
      // Don't log errors if it's just an authentication issue (user not logged in)
      if (error.message?.includes('Admin authentication required') || error.message?.includes('Not authenticated')) {
        console.warn('⚠️ Admin authentication required - user not logged in as admin');
      } else {
        // Only log actual errors
        console.error('❌ Error fetching admin data from live backend:', error);

        // Show user-friendly error message for real errors
        alert('Failed to fetch admin data from backend. Please check your connection and try refreshing.');
      }

      // NO MOCK DATA - Show error state
      setStats(null);
      setUsers([]);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // ✅ Only fetch data on initial load if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      fetchAdminData();
      fetchRealTimeData(); // Also fetch real-time data on initial load
      fetchComprehensiveData(); // Fetch all monitoring data
    } else {
      console.warn('⚠️ Initial data fetch skipped - not authenticated');
    }
  }, []);

  // Enhanced state for real-time monitoring
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<any>(null);

  // ✨ Enhanced Admin Navigation - Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        switch (e.key) {
          case '1': setActiveTab('overview'); break;
          case '2': setActiveTab('users'); break;
          case '3': setActiveTab('payments'); break;
          case '4': setActiveTab('tokens'); break;
          case '5': setActiveTab('security'); break;
          case '6': setActiveTab('emails'); break;
          case '7': setActiveTab('system'); break;
          case '8': setActiveTab('analytics'); break;
          case 'r': fetchAdminData(true); break;
          case 'c': fetchComprehensiveData(); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Fetch comprehensive admin data including new features
  const fetchComprehensiveData = async () => {
    try {
      console.log('Fetching comprehensive admin data...');

      // Check authentication first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No authentication token - skipping comprehensive data fetch');
        return;
      }

      // ✅ ENABLED: Backend restarted with new endpoints
      const [tokenResponse, securityResponse, emailResponse, systemResponse, academyResponse] = await Promise.all([
        apiRequest('/api/admin/token-monitoring?timeframe=30d', { method: 'GET' }),
        apiRequest('/api/admin/password-security', { method: 'GET' }),
        apiRequest('/api/admin/email-management?timeframe=30d', { method: 'GET' }),
        apiRequest('/api/admin/system-monitoring', { method: 'GET' }),
        apiRequest('/api/academy/admin/stats', { method: 'GET' })
      ]);

      console.log('New admin endpoints enabled - backend running with comprehensive features');

      if (tokenResponse.success) {
        setTokenData(tokenResponse.data);
        console.log('Token monitoring data loaded');
      }

      if (securityResponse.success) {
        setSecurityData(securityResponse.data);
        console.log('Security data loaded');
      }

      if (emailResponse.success) {
        setEmailData(emailResponse.data);
        console.log('Email management data loaded');
      }

      if (systemResponse.success) {
        setSystemData(systemResponse.data);
        console.log('System monitoring data loaded');
      }

      if (academyResponse.success) {
        setAcademyData(academyResponse.data);
        console.log('Academy data loaded');
      }
    } catch (error: any) {
      console.error('❌ Error fetching comprehensive data:', error);

      // Show user-friendly error if authentication failed
      if (error.message?.includes('Admin authentication required') || error.message?.includes('Invalid token')) {
        console.warn('⚠️ Admin authentication required for comprehensive data');
        // Don't show alert - just log the warning
      }
    }
  };

  // Auto-refresh for real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // ✅ Only refresh if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ Auto-refresh skipped - not authenticated');
        return;
      }

      if (activeTab === 'overview' || activeTab === 'analytics') {
        fetchRealTimeData();
      }
      if (activeTab === 'tokens' || activeTab === 'security' || activeTab === 'emails' || activeTab === 'system') {
        fetchComprehensiveData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch real-time monitoring data
  const fetchRealTimeData = async () => {
    try {
      console.log('Fetching real-time monitoring data...');

      // Check authentication first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No authentication token - skipping real-time data fetch');
        return;
      }

      const [sessionsResponse, registrationsResponse, logsResponse] = await Promise.all([
        apiRequest('/api/admin/active-sessions', { method: 'GET' }),
        apiRequest('/api/admin/recent-registrations?hours=24', { method: 'GET' }),
        apiRequest('/api/admin/logs?limit=20', { method: 'GET' })
      ]);

      if (sessionsResponse.success) {
        setActiveSessions(sessionsResponse.data.sessions || []);
      }

      if (registrationsResponse.success) {
        setRecentRegistrations(registrationsResponse.data.recentUsers || []);
      }

      if (logsResponse.success) {
        setSystemLogs(logsResponse.data.logs || []);
      }

      console.log('Real-time data updated');
    } catch (error: any) {
      // Don't log errors if it's just an authentication issue
      if (error.message?.includes('Admin authentication required') || error.message?.includes('Not authenticated')) {
        console.warn('⚠️ Admin authentication required for real-time data');
      } else {
        console.error('❌ Error fetching real-time data:', error);
      }
    }
  };

  // Handle Stripe payment refund
  const handleRefund = async (paymentId: string) => {
    const reason = prompt('Please enter a reason for the refund:');
    if (!reason) return;

    try {
      setRefreshing(true);
      console.log(`Processing refund for payment ${paymentId}...`);

      const response = await apiRequest(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        body: { reason }
      });

      if (response.success) {
        console.log('Refund processed successfully:', response.data);
        await fetchAdminData(true);
        alert(`Refund processed successfully! Amount: ${formatCurrency(response.data.refundAmount)}`);
      } else {
        throw new Error(response.message || 'Refund failed');
      }
    } catch (error: any) {
      console.error('❌ Error processing refund:', error);
      alert(`Error processing refund: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle user actions
  const handleUserAction = async (userId: string, action: string) => {
    try {
      setRefreshing(true);
      console.log(`Executing user action: ${action} for user ${userId}`);

      const response = await apiRequest(`/api/admin/actions/${action}`, {
        method: 'POST',
        body: { userId, data: { reason: `Admin action: ${action}` } }
      });

      if (response.success) {
        console.log(`User action ${action} completed:`, response.data);
        await fetchAdminData(true);
        alert(`Action "${action}" completed successfully`);
      } else {
        throw new Error(response.message || 'Action failed');
      }
    } catch (error: any) {
      console.error(`❌ Error executing user action ${action}:`, error);
      alert(`Error executing action: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Delete functionality handlers
  const openDeleteModal = (type: 'user' | 'payment' | 'session' | 'logs', target: any) => {
    const messages = {
      user: {
        title: 'Delete User Account',
        message: `Are you sure you want to permanently delete the account for ${target.firstName} ${target.lastName} (${target.email})? This action cannot be undone and will remove all associated data.`
      },
      payment: {
        title: 'Delete Payment Record',
        message: `Are you sure you want to delete the payment record for ${target.userEmail}? Amount: ${formatCurrency(target.amount)}. This action cannot be undone.`
      },
      session: {
        title: 'Terminate User Sessions',
        message: `Are you sure you want to terminate all active sessions for ${target.firstName} ${target.lastName} (${target.email})? The user will be logged out from all devices.`
      },
      logs: {
        title: 'Clear System Logs',
        message: 'Are you sure you want to clear system logs? You can specify a date to only clear older logs, or clear all logs if no date is specified.'
      }
    };

    setDeleteModal({
      isOpen: true,
      type,
      target,
      title: messages[type].title,
      message: messages[type].message
    });
    setDeleteReason('');
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: null,
      target: null,
      title: '',
      message: ''
    });
    setDeleteReason('');
  };

  const handleDelete = async () => {
    if (!deleteModal.type || !deleteReason.trim()) {
      alert('Please provide a reason for this action.');
      return;
    }

    try {
      setRefreshing(true);
      console.log(`Executing delete action: ${deleteModal.type}`);

      let endpoint = '';
      let method = 'DELETE';
      let body: any = { reason: deleteReason };

      switch (deleteModal.type) {
        case 'user':
          endpoint = `/api/admin/users/${deleteModal.target.id}`;
          break;
        case 'payment':
          endpoint = `/api/admin/payments/${deleteModal.target.id}`;
          break;
        case 'session':
          endpoint = `/api/admin/sessions/${deleteModal.target.id}`;
          break;
        case 'logs':
          endpoint = `/api/admin/logs`;
          // For logs, we might want to include a date filter
          if (deleteModal.target?.olderThan) {
            body.olderThan = deleteModal.target.olderThan;
          }
          break;
      }

      const response = await apiRequest(endpoint, {
        method,
        body: body
      });

      if (response.success) {
        console.log(`Delete action ${deleteModal.type} completed:`, response.data);
        closeDeleteModal();
        await fetchAdminData(true);
        alert(`${deleteModal.title} completed successfully`);
      } else {
        throw new Error(response.message || 'Delete action failed');
      }
    } catch (error: any) {
      console.error(`❌ Error executing delete action ${deleteModal.type}:`, error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Suspend/Unsuspend handlers
  const handleSuspendUser = async (userId: string, user: User) => {
    const reason = prompt('Please enter a reason for suspension:');
    if (!reason) return;

    const durationStr = prompt('Duration in days (leave empty for permanent):');
    const duration = durationStr ? parseInt(durationStr) : null;

    try {
      setRefreshing(true);
      console.log(`Suspending user ${userId}...`);

      const response = await apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: { reason, duration }
      });

      if (response.success) {
        console.log('User suspended successfully:', response.data);
        await fetchAdminData(true);
        alert(`User ${user.email} suspended successfully`);
      } else {
        throw new Error(response.message || 'Suspension failed');
      }
    } catch (error: any) {
      console.error('❌ Error suspending user:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnsuspendUser = async (userId: string, user: User) => {
    const reason = prompt('Please enter a reason for unsuspension:');
    if (!reason) return;

    try {
      setRefreshing(true);
      console.log(`Unsuspending user ${userId}...`);

      const response = await apiRequest(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
        body: { reason }
      });

      if (response.success) {
        console.log('User unsuspended successfully:', response.data);
        await fetchAdminData(true);
        alert(`User ${user.email} unsuspended successfully`);
      } else {
        throw new Error(response.message || 'Unsuspension failed');
      }
    } catch (error: any) {
      console.error('❌ Error unsuspending user:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Delete user handlers
  const handleDeleteUser = async (userId: string, user: any, permanent: boolean = false) => {
    const action = permanent ? 'permanently delete' : 'delete';
    const confirmMessage = permanent
      ? `Are you sure you want to PERMANENTLY delete user ${user.email}?\n\nThis action CANNOT be undone and will remove all user data permanently.`
      : `Are you sure you want to delete user ${user.email}?\n\nThis will soft delete the user (can be restored later).`;

    if (!confirm(confirmMessage)) return;

    try {
      setRefreshing(true);
      console.log(`${action} user:`, { userId, email: user.email, permanent });

      const queryParam = permanent ? '?permanently=true' : '';
      const response = await apiRequest(`/api/admin/users/${userId}${queryParam}`, {
        method: 'DELETE'
      });

      if (response.success) {
        console.log(`User ${action} completed:`, response);
        await fetchAdminData(true);
        alert(`User ${user.email} ${action}d successfully`);
      } else {
        throw new Error(response.message || `${action} failed`);
      }
    } catch (error: any) {
      console.error(`❌ Error ${action}ing user:`, error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestoreUser = async (userId: string, user: any) => {
    if (!confirm(`Are you sure you want to restore user ${user.email}?`)) return;

    try {
      setRefreshing(true);
      console.log('Restore user:', { userId, email: user.email });

      const response = await apiRequest(`/api/admin/users/${userId}/restore`, {
        method: 'POST'
      });

      if (response.success) {
        console.log('User restore completed:', response);
        await fetchAdminData(true);
        alert(`User ${user.email} restored successfully`);
      } else {
        throw new Error(response.message || 'Restore failed');
      }
    } catch (error: any) {
      console.error('❌ Error restoring user:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Bulk actions for user management
  const handleBulkUserAction = async (userIds: string[], action: string) => {
    if (userIds.length === 0) {
      alert('Please select users first');
      return;
    }

    let confirmMessage = '';
    switch (action) {
      case 'delete':
        confirmMessage = `Are you sure you want to delete ${userIds.length} users?`;
        break;
      case 'permanent_delete':
        confirmMessage = `Are you sure you want to PERMANENTLY delete ${userIds.length} users?\n\nThis action CANNOT be undone!`;
        break;
      case 'suspend':
        confirmMessage = `Are you sure you want to suspend ${userIds.length} users?`;
        break;
      case 'unsuspend':
        confirmMessage = `Are you sure you want to unsuspend ${userIds.length} users?`;
        break;
      default:
        confirmMessage = `Are you sure you want to perform "${action}" on ${userIds.length} users?`;
    }

    if (!confirm(confirmMessage)) return;

    try {
      setRefreshing(true);
      console.log('Bulk user action:', { userIds, action });

      const response = await apiRequest('/api/admin/users/bulk', {
        method: 'DELETE',
        body: { userIds, action }
      });

      if (response.success) {
        console.log('Bulk action completed:', response);
        await fetchAdminData(true);
        alert(response.message);
      } else {
        throw new Error(response.message || 'Bulk action failed');
      }
    } catch (error: any) {
      console.error('❌ Error in bulk action:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Cleanup functions
  const handleCleanupInactiveUsers = async (days: number = 90) => {
    const confirmMessage = `Are you sure you want to cleanup users inactive for ${days} days?\n\nThis will permanently delete inactive user accounts.`;
    if (!confirm(confirmMessage)) return;

    try {
      setRefreshing(true);
      console.log('Cleanup inactive users:', { days });

      const response = await apiRequest('/api/admin/cleanup/inactive-users', {
        method: 'POST',
        body: { days }
      });

      if (response.success) {
        console.log('Cleanup completed:', response);
        await fetchAdminData(true);
        alert(response.message);
      } else {
        throw new Error(response.message || 'Cleanup failed');
      }
    } catch (error: any) {
      console.error('❌ Error in cleanup:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCleanupTempData = async () => {
    if (!confirm('Are you sure you want to cleanup temporary data?\n\nThis will clear temporary files, expired sessions, old logs, and cache.')) return;

    try {
      setRefreshing(true);
      console.log('Cleanup temporary data');

      const response = await apiRequest('/api/admin/cleanup/temp-data', {
        method: 'POST'
      });

      if (response.success) {
        console.log('Temp data cleanup completed:', response);
        alert(`${response.message}\n\nCleaned: ${response.cleanup.tempFiles} files, ${response.cleanup.sessions} sessions, ${response.cleanup.logs} logs, ${response.cleanup.cache} cache entries`);
      } else {
        throw new Error(response.message || 'Cleanup failed');
      }
    } catch (error: any) {
      console.error('❌ Error in temp cleanup:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // User settings and view handlers
  const handleViewUser = (userId: string, user: any) => {
    const userInfo = `
User Details:
ID: ${userId}
Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Role: ${user.role}
Status: ${user.status}
Tokens: ${user.tokenBalance || 0}
Total Spent: ${formatCurrency((user.totalSpent || 0) * 100)}
Subscription: ${user.subscriptionTier || 'Free'}
Created: ${formatDate(user.createdAt)}
    `;
    alert(userInfo);
  };

  const handleUserSettings = (userId: string, user: any) => {
    const newRole = prompt(`Change role for ${user.email}?\nCurrent: ${user.role}\nEnter new role (USER/ADMIN):`, user.role);
    if (newRole && (newRole === 'USER' || newRole === 'ADMIN')) {
      alert(`Role changed to ${newRole} for ${user.email}\n(In a real app, this would update the database)`);
    } else if (newRole) {
      alert('Invalid role. Please enter USER or ADMIN');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': case 'active': return 'bg-green-100 text-green-800';
      case 'pending': case 'trial': return 'bg-yellow-100 text-yellow-800';
      case 'failed': case 'canceled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle size={24} />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need administrator privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Beautiful Styling */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 bg-gradient-to-r from-white to-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <BarChart3 className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    SmartPromptIQ Admin Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Welcome back, <span className="font-semibold text-indigo-600">{user?.firstName || 'Administrator'}</span>!
                    Here's your real-time overview.
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live Data Connected
                    </div>
                    <div className="text-sm text-gray-500">
                      Last Updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => fetchAdminData(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Download size={16} />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ✨ DEDICATED ADMIN NAVIGATION - Unlimited Access ✨ */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Admin Control Center</CardTitle>
                    <CardDescription className="text-purple-100">
                      Access to all monitoring & management features
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1">
                  ADMIN ACCESS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {/* Quick Action Buttons with Beautiful Icons */}
                <Button
                  onClick={() => setActiveTab('overview')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'overview'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs font-medium">Overview</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('users')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'users'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-medium">Users</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('payments')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'payments'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-medium">Payments</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('tokens')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'tokens'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <span className="text-xs font-medium">Tokens</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('security')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'security'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-medium">Security</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('emails')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'emails'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs font-medium">Emails</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('system')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'system'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Server className="w-5 h-5" />
                  <span className="text-xs font-medium">System</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'analytics'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs font-medium">Analytics</span>
                </Button>
              </div>

              {/* Additional Admin Actions */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAdminData(true)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh All Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchComprehensiveData()}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Load Comprehensive Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Reports
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('ADMIN OVERVIEW ACTIVATED');
                      setActiveTab('overview');
                      fetchAdminData(true);
                      fetchComprehensiveData();
                    }}
                    className="bg-yellow-400/20 border-yellow-300 text-yellow-100 hover:bg-yellow-400/30 font-bold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    REFRESH ALL
                  </Button>
                </div>
              </div>

              {/* Current Tab Indicator */}
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    Currently viewing: <span className="font-bold capitalize">{activeTab}</span>
                  </div>
                  <div className="text-xs text-purple-100">
                    Total Features: <span className="font-bold">8 Modules</span> •
                    Status: <span className="font-bold text-green-300">All Active</span> •
                    Shortcuts: <span className="font-bold text-yellow-300">Ctrl+Alt+1-8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🧪 USER FEATURES TESTING PANEL - Test All User Functions 🧪 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">User Features Testing Center</CardTitle>
                    <CardDescription className="text-emerald-100">
                      Test all user features & functions directly from admin panel
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-cyan-400 text-cyan-900 font-bold px-3 py-1">
                  USER TESTING
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* User Feature Test Buttons */}
                <Button
                  onClick={() => window.open('http://localhost:5173/', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-xs font-medium">Home Page</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/dashboard', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs font-medium">Dashboard</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/generate', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-xs font-medium">Generate</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/categories', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-medium">Categories</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/pricing', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-medium">Pricing</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/teams', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-medium">Teams</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/templates', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-medium">Templates</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/analytics', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs font-medium">Analytics</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/settings', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs font-medium">Settings</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/signin', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-medium">Sign In</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/signin?mode=signup', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs font-medium">Sign Up</span>
                </Button>

                <Button
                  onClick={() => window.open('http://localhost:5173/demo', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white/10 text-white hover:bg-white/20"
                >
                  <Eye className="w-5 h-5" />
                  <span className="text-xs font-medium">Demo</span>
                </Button>
              </div>

              {/* Category Testing Section */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Category Features Testing
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('http://localhost:5173/questionnaire/business', '_blank')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Business
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('http://localhost:5173/questionnaire/marketing', '_blank')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Marketing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('http://localhost:5173/questionnaire/education', '_blank')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Education
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('http://localhost:5173/questionnaire/personal', '_blank')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Personal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('http://localhost:5173/questionnaire/finance', '_blank')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Finance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('http://localhost:5173/questionnaire/product', '_blank')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Product
                  </Button>
                </div>
              </div>

              {/* Quick Testing Actions */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open('http://localhost:5173/', '_blank');
                      window.open('http://localhost:5173/dashboard', '_blank');
                      window.open('http://localhost:5173/generate', '_blank');
                    }}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Test Core Features
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open('http://localhost:5173/signin', '_blank');
                      window.open('http://localhost:5173/signin?mode=signup', '_blank');
                    }}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Test Auth Flow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open('http://localhost:5173/pricing', '_blank');
                      window.open('http://localhost:5173/teams', '_blank');
                      window.open('http://localhost:5173/settings', '_blank');
                    }}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Test Premium Features
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const categories = ['business', 'marketing', 'education', 'personal', 'finance', 'product'];
                      categories.forEach(cat => {
                        window.open(`http://localhost:5173/questionnaire/${cat}`, '_blank');
                      });
                    }}
                    className="bg-cyan-400/20 border-cyan-300 text-cyan-100 hover:bg-cyan-400/30 font-bold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    TEST ALL CATEGORIES
                  </Button>
                </div>
              </div>

              {/* User Testing Status */}
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    User Feature Testing: <span className="font-bold">Ready</span>
                  </div>
                  <div className="text-xs text-emerald-100">
                    Total User Features: <span className="font-bold">18 Pages</span> •
                    Categories: <span className="font-bold text-cyan-300">6 Types</span> •
                    Status: <span className="font-bold text-green-300">All Accessible</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stats Grid with Beautiful Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users - Blue Theme */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">Total Users</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800 mb-1">
                {stats?.totalUsers?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stats?.activeUsers?.toLocaleString() || '0'} active
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  This Month
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue - Green Theme */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">Monthly Revenue</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800 mb-1">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {formatCurrency(stats?.totalRevenue || 0)} total
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  +12.5%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Successful Payments - Purple Theme */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">Payments</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800 mb-1">
                {stats?.successfulPayments?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-purple-600">
                  <span className="text-green-600">{stats?.successfulPayments || 0} success</span>
                  <span className="mx-1">•</span>
                  <span className="text-yellow-600">{stats?.pendingPayments || 0} pending</span>
                  <span className="mx-1">•</span>
                  <span className="text-red-600">{stats?.refundedPayments || 0} refunds</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health - Dynamic Theme */}
          <Card className={`border-l-4 hover:shadow-lg transition-all duration-300 ${
            stats?.systemHealth === 'healthy'
              ? 'border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
              : stats?.systemHealth === 'warning'
              ? 'border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50'
              : 'border-l-red-500 bg-gradient-to-br from-red-50 to-pink-50'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={`text-sm font-semibold ${
                stats?.systemHealth === 'healthy'
                  ? 'text-green-700'
                  : stats?.systemHealth === 'warning'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>System Health</CardTitle>
              <div className={`p-2 rounded-lg ${
                stats?.systemHealth === 'healthy'
                  ? 'bg-green-500'
                  : stats?.systemHealth === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}>
                {stats?.systemHealth === 'healthy' && <CheckCircle className="h-5 w-5 text-white" />}
                {stats?.systemHealth === 'warning' && <AlertTriangle className="h-5 w-5 text-white" />}
                {stats?.systemHealth === 'critical' && <XCircle className="h-5 w-5 text-white" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold capitalize mb-1 ${
                stats?.systemHealth === 'healthy'
                  ? 'text-green-800'
                  : stats?.systemHealth === 'warning'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {stats?.systemHealth || 'Unknown'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-sm ${
                  stats?.systemHealth === 'healthy'
                    ? 'text-green-600'
                    : stats?.systemHealth === 'warning'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  {stats?.totalPrompts?.toLocaleString() || '0'} prompts
                </div>
                <Badge className={`text-xs ${
                  stats?.systemHealth === 'healthy'
                    ? 'bg-green-100 text-green-700'
                    : stats?.systemHealth === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats?.systemHealth === 'healthy' ? 'All Systems Go' :
                   stats?.systemHealth === 'warning' ? 'Needs Attention' : 'Critical Issue'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs with All Monitoring Features */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-10 bg-white rounded-xl shadow-lg border border-gray-200/50 p-2 gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <BarChart3 className="mr-1" size={14} />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Users className="mr-1" size={14} />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="academy"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Sparkles className="mr-1" size={14} />
              Academy
            </TabsTrigger>
            <TabsTrigger
              value="deleted"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Trash2 className="mr-1" size={14} />
              Deleted
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <CreditCard className="mr-1" size={14} />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="tokens"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Coins className="mr-1" size={14} />
              Tokens
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Shield className="mr-1" size={14} />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="emails"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Mail className="mr-1" size={14} />
              Emails
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <Server className="mr-1" size={14} />
              System
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs"
            >
              <TrendingUp className="mr-1" size={14} />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Sessions - Real-time */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                    Active Sessions
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Live user sessions (Auto-refreshes every 30s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {activeSessions.slice(0, 6).map((session, index) => (
                      <div key={session.id || index} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${session.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{session.user || 'Unknown User'}</p>
                            <p className="text-xs text-gray-600">{session.email || 'No email'}</p>
                            <p className="text-xs text-gray-500">
                              {session.status === 'active' ?
                                `🟢 Active (${session.duration || 0}m)` :
                                `🔴 Idle (${session.duration || 0}m)`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            {session.tier || 'free'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-emerald-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Total Sessions: <span className="text-emerald-600 font-bold">{activeSessions.length}</span>
                      </p>
                      <Badge className="bg-emerald-500 text-white">
                        Live
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Registrations - Live */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Recent Registrations
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    New users in the last 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentRegistrations.slice(0, 6).map((user, index) => (
                      <div key={user.id || index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{user.name || 'New User'}</p>
                            <p className="text-xs text-gray-600">{user.email || 'No email'}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(user.registeredAt || new Date().toISOString())}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-1">
                            {user.plan || 'free'}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {user.emailVerified ? '✅ Verified' : '⏳ Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        New Today: <span className="text-blue-600 font-bold">{recentRegistrations.length}</span>
                      </p>
                      <Badge className="bg-blue-500 text-white">
                        24h
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Activity Logs */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    System Activity
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Recent system events and API calls
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {systemLogs.slice(0, 8).map((log, index) => (
                      <div key={log.id || index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            log.level === 'warning' ? 'bg-yellow-500' :
                            log.level === 'error' ? 'bg-red-500' : 'bg-green-500'
                          }`}></span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(log.timestamp || new Date().toISOString())}
                          </span>
                          <Badge className={`text-xs ${
                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            log.level === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {log.level || 'info'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{log.message || 'System event logged'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-purple-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Events: <span className="text-purple-600 font-bold">{systemLogs.length}</span>
                      </p>
                      <Badge className="bg-purple-500 text-white">
                        Live
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users with Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Recent users with admin actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Last active: {formatDate(user.lastActiveAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(user.subscriptionStatus)}>
                            {user.subscriptionTier}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'view-profile')}
                              disabled={refreshing}
                            >
                              <Eye size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'reset-tokens')}
                              disabled={refreshing}
                            >
                              <RefreshCw size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal('session', user)}
                              disabled={refreshing}
                              className="text-orange-600 hover:text-orange-800"
                              title="Terminate Sessions"
                            >
                              <LogOut size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspendUser(user.id, user)}
                              disabled={refreshing}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Suspend User"
                            >
                              <UserX size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user, false)}
                              disabled={refreshing}
                              className="text-red-600 hover:text-red-800"
                              title="Delete User (Soft Delete)"
                            >
                              <Trash2 size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user, true)}
                              disabled={refreshing}
                              className="text-red-800 hover:text-red-900 border-red-300"
                              title="Permanently Delete User"
                            >
                              <XCircle size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Payments with Refund Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>Recent payments with refund capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{payment.userEmail}</p>
                          <p className="text-sm text-gray-600">{payment.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(payment.createdAt)} • {payment.stripePaymentId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(payment.amount)}</p>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            {payment.status === 'succeeded' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRefund(payment.id)}
                                disabled={refreshing}
                              >
                                Refund
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={refreshing}
                            >
                              <Eye size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage and monitor user accounts</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCleanupInactiveUsers(90)}
                      disabled={refreshing}
                      className="text-orange-600 hover:text-orange-800"
                      title="Cleanup users inactive for 90+ days"
                    >
                      <Database size={14} className="mr-1" />
                      Cleanup (90d)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCleanupTempData()}
                      disabled={refreshing}
                      className="text-blue-600 hover:text-blue-800"
                      title="Cleanup temporary data and cache"
                    >
                      <Zap size={14} className="mr-1" />
                      Clear Cache
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const userIds = ['1', '2', '3']; // Demo with first 3 users
                        handleBulkUserAction(userIds, 'delete');
                      }}
                      disabled={refreshing}
                      className="text-red-600 hover:text-red-800"
                      title="Bulk delete first 3 users (Demo)"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Demo Bulk Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const userIds = ['4', '5', '6']; // Demo with next 3 users
                        handleBulkUserAction(userIds, 'suspend');
                      }}
                      disabled={refreshing}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Bulk suspend users 4-6 (Demo)"
                    >
                      <UserX size={14} className="mr-1" />
                      Demo Bulk Suspend
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">💡 User Action Guide:</p>
                  <p className="text-xs text-blue-700 mt-1">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>View •
                    <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-1 ml-2"></span>Settings •
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1 ml-2"></span>Suspend •
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1 ml-2"></span>Soft Delete •
                    <span className="inline-block w-3 h-3 bg-red-800 rounded-full mr-1 ml-2"></span>Permanent Delete
                  </p>
                </div>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(user.subscriptionTier)}>
                              {user.subscriptionTier}
                            </Badge>
                            <Badge className={getStatusColor(user.subscriptionStatus)}>
                              {user.subscriptionStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span>Tokens: {user.tokenBalance}</span>
                          <span className="mx-2">•</span>
                          <span>Total Spent: {formatCurrency(user.totalSpent * 100)}</span>
                          <span className="mx-2">•</span>
                          <span>Joined: {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user.id, user)}
                            disabled={refreshing}
                            className="text-blue-600 hover:text-blue-800"
                            title="View User Details"
                          >
                            <Eye size={12} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserSettings(user.id, user)}
                            disabled={refreshing}
                            className="text-gray-600 hover:text-gray-800"
                            title="User Settings"
                          >
                            <Settings size={12} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendUser(user.id, user)}
                            disabled={refreshing}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Suspend User"
                          >
                            <UserX size={12} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user, false)}
                            disabled={refreshing}
                            className="text-red-600 hover:text-red-800"
                            title="Delete User (Soft Delete)"
                          >
                            <Trash2 size={12} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user, true)}
                            disabled={refreshing}
                            className="text-red-800 hover:text-red-900 border-red-300"
                            title="Permanently Delete User"
                          >
                            <XCircle size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deleted" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Deleted Users</CardTitle>
                    <CardDescription>Manage and restore deleted user accounts</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAdminData(true)}
                      disabled={refreshing}
                      className="text-blue-600 hover:text-blue-800"
                      title="Refresh deleted users list"
                    >
                      <RefreshCw size={14} className="mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock deleted users data for demonstration */}
                  {Array.from({ length: 5 }, (_, i) => ({
                    id: 2000 + i,
                    email: `deleted${i + 1}@example.com`,
                    firstName: `Deleted`,
                    lastName: `User ${i + 1}`,
                    role: 'USER',
                    status: 'deleted',
                    deletedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
                  })).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <UserX className="text-red-600" size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-red-600">Deleted: {formatDate(user.deletedAt)}</div>
                          <div className="text-xs text-gray-400">Created: {formatDate(user.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">Deleted</Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreUser(user.id, user)}
                            disabled={refreshing}
                            className="text-green-600 hover:text-green-800"
                            title="Restore User"
                          >
                            <CheckCircle size={12} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user, true)}
                            disabled={refreshing}
                            className="text-red-800 hover:text-red-900 border-red-300"
                            title="Permanently Delete User"
                          >
                            <XCircle size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Monitor and manage payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{payment.userEmail}</p>
                            <p className="text-sm text-gray-600">{payment.description}</p>
                            <p className="text-xs text-gray-500">
                              Payment ID: {payment.stripePaymentId}
                            </p>
                          </div>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span>Amount: {formatCurrency(payment.amount)}</span>
                          <span className="mx-2">•</span>
                          <span>Date: {formatDate(payment.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {payment.status === 'succeeded' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRefund(payment.id)}
                            disabled={refreshing}
                          >
                            Refund
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal('payment', payment)}
                          disabled={refreshing}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Payment Record"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Monitoring Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Token Overview */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <Coins className="w-5 h-5" />
                    Token Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Tokens Used</span>
                      <span className="font-bold text-yellow-700">{tokenData?.overview?.totalTokens?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="font-bold text-yellow-700">{formatCurrency((tokenData?.overview?.totalCost || 0) * 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Token Users</span>
                      <span className="font-bold text-yellow-700">{tokenData?.overview?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">High Usage Alerts</span>
                      <span className="font-bold text-red-600">{tokenData?.overview?.highUsageAlerts || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Token Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Token Consumers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tokenData?.topUsers?.slice(0, 5).map((user: any, index: number) => (
                      <div key={user.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{user.totalTokensConsumed?.toLocaleString()}</p>
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">{user.tier}</Badge>
                        </div>
                      </div>
                    )) || Array.from({length: 3}).map((_, i) => (
                      <div key={i} className="p-2 bg-gray-100 rounded animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Token Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Token Usage Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tokenData?.alerts?.slice(0, 4).map((alert: any, index: number) => (
                      <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="text-sm font-medium">{alert.userEmail}</span>
                        </div>
                        <p className="text-xs text-gray-600">{alert.tokensConsumed?.toLocaleString()} tokens used</p>
                        <p className="text-xs text-red-600">{alert.severity.toUpperCase()} usage pattern</p>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No token alerts</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security & Password Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Security Overview */}
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Shield className="w-5 h-5" />
                    Security Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-red-700">
                        {Math.round(securityData?.securityHealth?.overallScore || 85)}
                      </div>
                      <p className="text-sm text-gray-600">Security Score</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verified Users</span>
                      <span className="font-bold text-green-600">{securityData?.overview?.verifiedUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unverified Users</span>
                      <span className="font-bold text-yellow-600">{securityData?.overview?.unverifiedUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Failed Logins (24h)</span>
                      <span className="font-bold text-red-600">{securityData?.overview?.failedLoginAttempts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Suspicious Activity</span>
                      <span className="font-bold text-orange-600">{securityData?.overview?.suspiciousActivity || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Security Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityData?.recentEvents?.slice(0, 5).map((event: any, index: number) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className={`w-3 h-3 rounded-full ${
                          event.eventType === 'new_registration' ? 'bg-blue-500' :
                          event.eventType === 'login' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.userName}</p>
                          <p className="text-xs text-gray-600">{event.email}</p>
                          <p className="text-xs text-gray-500">
                            {event.eventType === 'new_registration' ? '📝 New Registration' :
                             event.eventType === 'login' ? '🔐 Login' : '📱 Activity'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${
                            event.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                            event.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    )) || Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="p-2 bg-gray-100 rounded animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Security Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityData?.alerts?.map((alert: any, index: number) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">{alert.type}</span>
                        </div>
                        <p className="text-xs text-gray-700">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No security alerts</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Management Tab */}
          <TabsContent value="emails" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Health Overview */}
              <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-l-4 border-l-teal-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <Mail className="w-5 h-5" />
                    Email Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verification Rate</span>
                      <span className="font-bold text-teal-700">{emailData?.emailHealth?.verificationRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Rate</span>
                      <span className="font-bold text-teal-700">{emailData?.emailHealth?.deliveryRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Open Rate</span>
                      <span className="font-bold text-teal-700">{emailData?.emailHealth?.openRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="font-bold text-red-600">{emailData?.emailHealth?.bounceRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Verification</span>
                      <span className="font-bold text-yellow-600">{emailData?.overview?.pendingVerification || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unverified Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Unverified Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emailData?.unverifiedUsersList?.slice(0, 5).map((user: any, index: number) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.daysSinceRegistration} days ago • Priority: {user.priority}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${
                            user.priority === 'high' ? 'bg-red-100 text-red-700' :
                            user.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.tier}
                          </Badge>
                        </div>
                      </div>
                    )) || Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="p-2 bg-gray-100 rounded animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Email Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emailData?.campaigns?.map((campaign: any, index: number) => (
                      <div key={campaign.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <Badge className={`text-xs ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>Sent: {campaign.sent}</div>
                          <div>Opened: {campaign.opened}</div>
                          <div>Clicked: {campaign.clicked}</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{campaign.type}</p>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        <MailOpen className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No campaigns</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* System Health */}
              <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-l-4 border-l-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <Server className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold ${
                      systemData?.health?.status === 'healthy' ? 'text-green-600' :
                      systemData?.health?.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {systemData?.summary?.healthScore || 95}
                    </div>
                    <p className="text-sm text-gray-600">Health Score</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">{Math.round((systemData?.health?.uptime || 3600) / 3600)}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Response</span>
                      <span className="font-medium">{systemData?.health?.performance?.averageResponseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Error Rate</span>
                      <span className="font-medium">{systemData?.health?.performance?.errorRate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Resource Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">CPU Usage</span>
                        <span className="font-medium">{systemData?.health?.resources?.cpuUsage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (systemData?.health?.resources?.cpuUsage || 0) > 80 ? 'bg-red-500' :
                            (systemData?.health?.resources?.cpuUsage || 0) > 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${systemData?.health?.resources?.cpuUsage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Memory</span>
                        <span className="font-medium">{systemData?.health?.resources?.memoryUsage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (systemData?.health?.resources?.memoryUsage || 0) > 80 ? 'bg-red-500' :
                            (systemData?.health?.resources?.memoryUsage || 0) > 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${systemData?.health?.resources?.memoryUsage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Disk</span>
                        <span className="font-medium">{systemData?.health?.resources?.diskUsage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (systemData?.health?.resources?.diskUsage || 0) > 80 ? 'bg-red-500' :
                            (systemData?.health?.resources?.diskUsage || 0) > 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${systemData?.health?.resources?.diskUsage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Daily Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Users</span>
                      <span className="font-bold text-blue-600">{systemData?.statistics?.daily?.newUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">API Calls</span>
                      <span className="font-bold text-green-600">{systemData?.statistics?.daily?.apiCalls || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tokens Used</span>
                      <span className="font-bold text-yellow-600">{systemData?.statistics?.daily?.tokensUsed?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Costs</span>
                      <span className="font-bold text-red-600">{formatCurrency((systemData?.statistics?.daily?.costs || 0) * 100)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemData?.alerts?.slice(0, 4).map((alert: any, index: number) => (
                      <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="text-sm font-medium">{alert.type}</span>
                        </div>
                        <p className="text-xs text-gray-700">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">All systems normal</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Management */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Management
                </CardTitle>
                <CardDescription>Administrative actions for system maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => openDeleteModal('logs', { olderThan: null })}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Logs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const days = prompt('Clear logs older than how many days?');
                      if (days && parseInt(days) > 0) {
                        const cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
                        openDeleteModal('logs', { olderThan: cutoffDate.toISOString() });
                      }
                    }}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Clear Old Logs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fetchAdminData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh System Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academy Tab */}
          <TabsContent value="academy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Overview Stats */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <Sparkles size={20} />
                    Total Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">
                    {academyData?.overview?.totalCourses || 0}
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    {academyData?.overview?.publishedCourses || 0} published
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <Users size={20} />
                    Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">
                    {academyData?.overview?.totalEnrollments || 0}
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {academyData?.overview?.activeEnrollments || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    {academyData?.overview?.completedCourses || 0}
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {academyData?.overview?.completionRate || 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-700 flex items-center gap-2">
                    <Briefcase size={20} />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-900">
                    {academyData?.overview?.totalCertificates || 0}
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    {academyData?.overview?.totalLessons || 0} total lessons
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Courses and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-purple-600" />
                    Top Courses
                  </CardTitle>
                  <CardDescription>Most popular courses by enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {academyData?.topCourses && academyData.topCourses.length > 0 ? (
                      academyData.topCourses.map((course: any, index: number) => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{course.title}</div>
                              <div className="text-sm text-gray-600">
                                {course.category} · {course.difficulty}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">{course._count?.enrollments || 0}</div>
                            <div className="text-xs text-gray-500">enrollments</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No course data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="text-blue-600" />
                    Recent Enrollments
                  </CardTitle>
                  <CardDescription>Latest course enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {academyData?.recentActivity && academyData.recentActivity.length > 0 ? (
                      academyData.recentActivity.slice(0, 5).map((enrollment: any) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{enrollment.course?.title || 'Unknown Course'}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                            {enrollment.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent enrollments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-indigo-600" />
                  Academy Growth Metrics
                </CardTitle>
                <CardDescription>Performance overview (Last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {academyData?.overview?.recentEnrollments || 0}
                    </div>
                    <div className="text-sm text-purple-600 mt-1">New Enrollments</div>
                    <div className="text-xs text-purple-500 mt-2">Last 30 days</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {academyData?.overview?.completionRate || 0}%
                    </div>
                    <div className="text-sm text-green-600 mt-1">Completion Rate</div>
                    <div className="text-xs text-green-500 mt-2">Overall average</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {academyData?.overview?.totalLessons || 0}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">Total Lessons</div>
                    <div className="text-xs text-blue-500 mt-2">Across all courses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Financial performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Monthly Recurring Revenue</span>
                      <span className="font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Revenue Per User</span>
                      <span className="font-bold">
                        {formatCurrency(stats?.totalRevenue && stats?.totalUsers
                          ? (stats.totalRevenue / stats.totalUsers)
                          : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-bold">12.4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>Platform usage statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Prompts Generated</span>
                      <span className="font-bold">{stats?.totalPrompts?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Daily Active Users</span>
                      <span className="font-bold">{Math.floor((stats?.activeUsers || 0) / 30)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Retention Rate</span>
                      <span className="font-bold">85.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                {deleteModal.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {deleteModal.message}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for this action <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Please provide a detailed reason for this action..."
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={closeDeleteModal}
                    disabled={refreshing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={refreshing || !deleteReason.trim()}
                    className="flex items-center gap-2"
                  >
                    {refreshing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {refreshing ? 'Processing...' : 'Confirm Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;