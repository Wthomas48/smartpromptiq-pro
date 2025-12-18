import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest as originalApiRequest } from '@/config/api';
import CostDashboard from '@/components/CostDashboard';

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
  LogOut,
  Rocket,
  Play,
  Store,
  ExternalLink,
  Link,
  Mic,
  Music,
  Palette,
  Boxes,
  Video,
  AudioWaveform
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

  // ElevenLabs API stats - will be fetched from real API
  const [elevenLabsStats, setElevenLabsStats] = useState<any>(null);

  // New features data state
  const [voiceData, setVoiceData] = useState<any>({
    totalGenerations: 0,
    activeUsers: 0,
    topVoice: 'Loading...',
    avgDuration: '0 seconds',
    generationsToday: 0,
    openAIUsage: 0,
    elevenLabsUsage: 0,
    languages: 0,
    // ElevenLabs specific
    charactersUsed: 0,
    charactersLimit: 0,
    usagePercent: 0,
    tier: 'free',
    resetDate: null,
    modelsAvailable: 0
  });
  const [musicData, setMusicData] = useState<any>({
    totalTracks: 1256,
    activeUsers: 156,
    topGenre: 'Electronic/EDM',
    avgDuration: '2:30',
    tracksToday: 78,
    jinglesCreated: 534,
    backgroundTracks: 722
  });
  const [designData, setDesignData] = useState<any>({
    totalDesigns: 5672,
    activeUsers: 312,
    topProvider: 'DALL-E 3',
    printIntegrations: 156,
    designsToday: 234,
    impossiblePrintOrders: 89,
    otherPODOrders: 67
  });
  const [builderIQData, setBuilderIQData] = useState<any>({
    totalBlueprints: 892,
    activeUsers: 178,
    topCategory: 'SaaS Apps',
    blueprintsToday: 45,
    templatesUsed: 2341,
    avgBuildTime: '12 minutes'
  });
  const [introOutroData, setIntroOutroData] = useState<any>({
    totalCreated: 1567,
    activeUsers: 145,
    topStyle: 'Professional',
    avgDuration: '8 seconds',
    createdToday: 67,
    withMusic: 1234,
    withVoiceover: 890
  });

  const [promptHubData, setPromptHubData] = useState<any>({
    playground: {
      totalTests: 1247,
      activeUsers: 89,
      mostUsedModel: 'GPT-4',
      avgResponseTime: '2.3s',
      testsToday: 156
    },
    deploymentHub: {
      totalDeployments: 892,
      topPlatform: 'Vercel',
      affiliateClicks: 3421,
      affiliateRevenue: 1890.50,
      deploymentsToday: 45
    },
    marketplace: {
      totalViews: 15670,
      uniqueVisitors: 4320,
      affiliateClicks: 8945,
      affiliateRevenue: 4567.80,
      topBuilder: 'Bolt.new',
      partnersWithAffiliate: 8,
      totalPartners: 15
    }
  });

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
          case '9': setActiveTab('costs'); break;
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

  // Fetch ElevenLabs admin stats from new API endpoint
  const fetchElevenLabsStats = async () => {
    try {
      console.log('🎙️ Fetching ElevenLabs admin stats...');

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No authentication token - skipping ElevenLabs stats fetch');
        return;
      }

      const response = await apiRequest('/api/elevenlabs/admin/stats', { method: 'GET' });

      if (response.success) {
        const stats = response.stats;
        setElevenLabsStats(stats);

        // Update voiceData with real ElevenLabs stats
        setVoiceData((prev: any) => ({
          ...prev,
          elevenLabsUsage: stats.usage?.charactersUsed || 0,
          charactersUsed: stats.usage?.charactersUsed || 0,
          charactersLimit: stats.usage?.charactersLimit || 0,
          usagePercent: stats.usage?.usagePercent || 0,
          generationsToday: stats.today?.generationCount || 0,
          tier: stats.subscription?.tier || 'free',
          resetDate: stats.usage?.resetDate || null,
          modelsAvailable: stats.availableModels || 0,
          topVoice: stats.breakdown?.byVoice?.[0]?.voice || 'Rachel',
          totalGenerations: stats.recentGenerations || 0,
        }));

        console.log('✅ ElevenLabs stats loaded:', stats);
      }
    } catch (error: any) {
      console.error('❌ Error fetching ElevenLabs stats:', error);
      // Don't block the UI - just show default data
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
      if (activeTab === 'voice') {
        fetchElevenLabsStats();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch ElevenLabs stats when voice tab is activated
  useEffect(() => {
    if (activeTab === 'voice') {
      fetchElevenLabsStats();
    }
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
    const action = permanent ? 'permanently delete' : 'soft delete';
    const confirmMessage = permanent
      ? `Are you sure you want to PERMANENTLY delete user ${user.email}?\n\nThis action CANNOT be undone and will remove all user data permanently.`
      : `Are you sure you want to soft delete user ${user.email}?\n\nThis can be restored later from the Deleted Users tab.`;

    if (!window.confirm(confirmMessage)) return;

    const reason = prompt('Please provide a reason for deletion:', 'Admin cleanup');
    if (!reason) {
      alert('Deletion reason is required');
      return;
    }

    try {
      setRefreshing(true);
      console.log(`${action} user:`, { userId, email: user.email, permanent, reason });

      if (permanent) {
        // Use permanent delete endpoint
        const response = await apiRequest(`/api/admin/users/${userId}/permanent`, {
          method: 'DELETE',
          body: {
            confirm: 'PERMANENT_DELETE',
            reason
          }
        });

        if (response.success) {
          console.log(`User permanently deleted:`, response);
          await fetchAdminData(true);
          alert(`User ${user.email} permanently deleted`);
        } else {
          throw new Error(response.message || 'Permanent delete failed');
        }
      } else {
        // Use bulk delete for soft delete (single user)
        const response = await apiRequest('/api/admin/users/bulk-delete', {
          method: 'POST',
          body: {
            userIds: [userId],
            reason,
            permanent: false
          }
        });

        if (response.success) {
          console.log(`User soft deleted:`, response);
          await fetchAdminData(true);
          alert(`User ${user.email} soft deleted (can be restored)`);
        } else {
          throw new Error(response.message || 'Soft delete failed');
        }
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
    const permanentChoice = window.confirm(
      `Cleanup users inactive for ${days}+ days.\n\n` +
      `Click OK for PERMANENT delete (cannot be undone)\n` +
      `Click Cancel for soft delete (can be restored)`
    );

    const finalConfirm = window.confirm(
      `Are you sure you want to ${permanentChoice ? 'PERMANENTLY ' : ''}delete inactive users?\n\n` +
      `This will find all FREE tier users inactive for ${days}+ days.`
    );
    if (!finalConfirm) return;

    try {
      setRefreshing(true);
      console.log('Cleanup inactive users:', { days, permanent: permanentChoice });

      const response = await apiRequest('/api/admin/cleanup/inactive-users', {
        method: 'POST',
        body: {
          daysInactive: days,
          confirm: 'DELETE_INACTIVE_USERS',
          permanent: permanentChoice
        }
      });

      if (response.success) {
        console.log('Cleanup completed:', response);
        await fetchAdminData(true);
        const deletedCount = response.data?.deletedCount || 0;
        alert(`${response.message}\n\nDeleted ${deletedCount} inactive users.`);
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

  // Cleanup demo/test users
  const handleCleanupDemoUsers = async () => {
    const permanentChoice = window.confirm(
      `Cleanup demo/test users.\n\n` +
      `This will delete users with emails containing 'demo', 'test', or 'example'.\n\n` +
      `Click OK for PERMANENT delete (cannot be undone)\n` +
      `Click Cancel for soft delete (can be restored)`
    );

    const finalConfirm = window.confirm(
      `Are you sure you want to ${permanentChoice ? 'PERMANENTLY ' : ''}delete all demo users?`
    );
    if (!finalConfirm) return;

    try {
      setRefreshing(true);
      console.log('Cleanup demo users:', { permanent: permanentChoice });

      const response = await apiRequest('/api/admin/cleanup/demo-users', {
        method: 'POST',
        body: {
          confirm: 'DELETE_DEMO_USERS',
          permanent: permanentChoice
        }
      });

      if (response.success) {
        console.log('Demo cleanup completed:', response);
        await fetchAdminData(true);
        const deletedCount = response.data?.deletedCount || 0;
        const deletedUsers = response.data?.deletedUsers || [];
        alert(`${response.message}\n\nDeleted ${deletedCount} demo users:\n${deletedUsers.map((u: any) => u.email).join('\n')}`);
      } else {
        throw new Error(response.message || 'Cleanup failed');
      }
    } catch (error: any) {
      console.error('❌ Error in demo cleanup:', error);
      alert(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Purge soft-deleted users permanently
  const handlePurgeDeletedUsers = async (daysOld: number = 30) => {
    const finalConfirm = window.confirm(
      `PERMANENTLY purge all soft-deleted users older than ${daysOld} days?\n\n` +
      `⚠️ This action CANNOT be undone!`
    );
    if (!finalConfirm) return;

    try {
      setRefreshing(true);
      console.log('Purge deleted users:', { daysOld });

      const response = await apiRequest('/api/admin/cleanup/purge-deleted', {
        method: 'POST',
        body: {
          daysOld,
          confirm: 'PURGE_DELETED_USERS'
        }
      });

      if (response.success) {
        console.log('Purge completed:', response);
        await fetchAdminData(true);
        const purgedCount = response.data?.purgedCount || 0;
        alert(`${response.message}\n\nPermanently removed ${purgedCount} deleted users.`);
      } else {
        throw new Error(response.message || 'Purge failed');
      }
    } catch (error: any) {
      console.error('❌ Error in purge:', error);
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
        alert(`${response.message}\n\nCleaned: ${response.cleanup?.tempFiles || 0} files, ${response.cleanup?.sessions || 0} sessions, ${response.cleanup?.logs || 0} logs, ${response.cleanup?.cache || 0} cache entries`);
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

  // Impersonate user - allows admin to see the app as a specific user would
  const handleImpersonateUser = async (userId: string, user: any) => {
    const confirm = window.confirm(
      `Are you sure you want to impersonate ${user.email}?\n\n` +
      `This will generate a temporary read-only token that lets you see the app as this user would.\n\n` +
      `Note: The impersonation token expires in 30 minutes.`
    );

    if (!confirm) return;

    try {
      const result = await apiRequest(`/api/admin/impersonate/${userId}`, { method: 'POST' });

      if (result.success) {
        // Store original admin token so we can switch back
        const originalToken = localStorage.getItem('token');
        localStorage.setItem('adminToken', originalToken || '');

        // Set the impersonation token
        localStorage.setItem('token', result.data.impersonationToken);
        localStorage.setItem('isImpersonating', 'true');

        // Calculate expiry (30 minutes from now)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        localStorage.setItem('impersonatedUser', JSON.stringify({
          id: result.data.targetUser.id,
          email: result.data.targetUser.email,
          name: result.data.targetUser.name,
          tier: result.data.targetUser.tier,
          expiresAt: expiresAt
        }));

        alert(
          `Now impersonating: ${result.data.targetUser.email}\n\n` +
          `Tier: ${result.data.targetUser.tier}\n` +
          `Expires in: ${result.data.expiresIn}\n\n` +
          `Restrictions:\n` +
          `${result.data.restrictions.map((r: string) => '• ' + r).join('\n')}\n\n` +
          `You can now browse the app as this user would see it.\n` +
          `To end impersonation, click "Exit Impersonation" in the header or go to /admin.`
        );

        // Redirect to dashboard to see the user's view
        window.location.href = '/dashboard';
      } else {
        throw new Error(result.message || 'Failed to impersonate user');
      }
    } catch (error: any) {
      alert(`Failed to impersonate user: ${error.message}`);
    }
  };

  // End impersonation and restore admin session
  const handleEndImpersonation = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonatedUser');
      alert('Impersonation ended. You are now logged in as admin.');
      window.location.href = '/admin';
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

  // Check if we're currently impersonating someone
  const isImpersonating = localStorage.getItem('isImpersonating') === 'true';
  const impersonatedUserStr = localStorage.getItem('impersonatedUser');
  const impersonatedUser = impersonatedUserStr ? JSON.parse(impersonatedUserStr) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Impersonation Banner - Shows when admin is viewing as another user */}
      {isImpersonating && impersonatedUser && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5" />
              <span className="font-medium">
                Impersonating: <strong>{impersonatedUser.name || impersonatedUser.email}</strong>
                {impersonatedUser.tier && (
                  <Badge className="ml-2 bg-white/20 text-white">{impersonatedUser.tier}</Badge>
                )}
              </span>
              <span className="text-sm text-purple-200">
                (Expires: {new Date(impersonatedUser.expiresAt).toLocaleTimeString()})
              </span>
            </div>
            <Button
              onClick={handleEndImpersonation}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Exit Impersonation
            </Button>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${isImpersonating ? 'mt-14' : ''}`}>
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
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-3">
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

                <Button
                  onClick={() => setActiveTab('costs')}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    activeTab === 'costs'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span className="text-xs font-medium">Costs</span>
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
                    Total Features: <span className="font-bold">9 Modules</span> •
                    Status: <span className="font-bold text-green-300">All Active</span> •
                    Shortcuts: <span className="font-bold text-yellow-300">Ctrl+Alt+1-9</span>
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
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700 p-2 gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <BarChart3 className="mr-1" size={14} />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Users className="mr-1" size={14} />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="academy"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Sparkles className="mr-1" size={14} />
                Academy
              </TabsTrigger>
              <TabsTrigger
                value="voice"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Mic className="mr-1" size={14} />
                Voice
              </TabsTrigger>
              <TabsTrigger
                value="music"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Music className="mr-1" size={14} />
                Music
              </TabsTrigger>
              <TabsTrigger
                value="design"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Palette className="mr-1" size={14} />
                Design
              </TabsTrigger>
              <TabsTrigger
                value="builderiq"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Boxes className="mr-1" size={14} />
                BuilderIQ
              </TabsTrigger>
              <TabsTrigger
                value="introoutro"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Video className="mr-1" size={14} />
                Intro/Outro
              </TabsTrigger>
              <TabsTrigger
                value="deleted"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Trash2 className="mr-1" size={14} />
                Deleted
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <CreditCard className="mr-1" size={14} />
                Payments
              </TabsTrigger>
              <TabsTrigger
                value="tokens"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Coins className="mr-1" size={14} />
                Tokens
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Shield className="mr-1" size={14} />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="emails"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Mail className="mr-1" size={14} />
                Emails
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Server className="mr-1" size={14} />
                System
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <TrendingUp className="mr-1" size={14} />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="prompthub"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <Rocket className="mr-1" size={14} />
                Prompt Hub
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300 text-xs whitespace-nowrap"
              >
                <DollarSign className="mr-1" size={14} />
                Costs
            </TabsTrigger>
            </TabsList>
          </div>

          {/* Voice Generation Tab */}
          <TabsContent value="voice" className="space-y-6">
            {/* ElevenLabs Subscription Overview */}
            {elevenLabsStats && (
              <Card className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AudioWaveform className="w-6 h-6 text-pink-500" />
                    ElevenLabs API Status
                    <Badge className={`ml-2 ${elevenLabsStats.subscription?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {elevenLabsStats.subscription?.tier || 'Free'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Real-time API usage from your ElevenLabs account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Usage Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Characters Used</span>
                        <span className="font-medium">
                          {(voiceData.charactersUsed || 0).toLocaleString()} / {(voiceData.charactersLimit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            voiceData.usagePercent > 90 ? 'bg-red-500' :
                            voiceData.usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(voiceData.usagePercent || 0, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{voiceData.usagePercent || 0}% used</span>
                        <span>Resets: {voiceData.resetDate ? new Date(voiceData.resetDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Cost Estimation */}
                    {elevenLabsStats.costs && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{elevenLabsStats.costs.estimatedMonthlyCost}</p>
                          <p className="text-xs text-gray-500">Est. Monthly Cost</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{elevenLabsStats.costs.budgetRemaining}</p>
                          <p className="text-xs text-gray-500">Budget Remaining</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{elevenLabsStats.usage?.daysUntilReset || 0}</p>
                          <p className="text-xs text-gray-500">Days Until Reset</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="w-5 h-5 text-cyan-600" />
                    Recent Generations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">{voiceData.totalGenerations.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+{voiceData.generationsToday} today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Models Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{voiceData.modelsAvailable || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">TTS models</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Characters Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{(voiceData.charactersUsed || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">of {(voiceData.charactersLimit || 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AudioWaveform className="w-5 h-5 text-pink-600" />
                    Top Voice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-700 dark:text-pink-400">{voiceData.topVoice}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Most used voice</p>
                </CardContent>
              </Card>
            </div>

            {/* Voice Usage Breakdown */}
            {elevenLabsStats?.breakdown?.byVoice && elevenLabsStats.breakdown.byVoice.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Voice Usage Breakdown
                  </CardTitle>
                  <CardDescription>Character usage by voice (recent generations)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {elevenLabsStats.breakdown.byVoice.map((voice: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium truncate">{voice.voice}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                            style={{
                              width: `${Math.min((voice.characters / (voiceData.charactersUsed || 1)) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <span className="w-20 text-sm text-right">{voice.characters.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Model Usage */}
            {elevenLabsStats?.breakdown?.byModel && elevenLabsStats.breakdown.byModel.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    Model Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {elevenLabsStats.breakdown.byModel.map((model: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1">
                        {model.model}: {model.generations} generations
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Available */}
            {elevenLabsStats?.features && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Available Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge className={elevenLabsStats.features.instantVoiceCloning ? 'bg-green-500' : 'bg-gray-400'}>
                      {elevenLabsStats.features.instantVoiceCloning ? '✓' : '✗'} Voice Cloning
                    </Badge>
                    <Badge className={elevenLabsStats.features.professionalVoiceCloning ? 'bg-green-500' : 'bg-gray-400'}>
                      {elevenLabsStats.features.professionalVoiceCloning ? '✓' : '✗'} Pro Voice Cloning
                    </Badge>
                    <Badge className={elevenLabsStats.features.speakerBoost ? 'bg-green-500' : 'bg-gray-400'}>
                      {elevenLabsStats.features.speakerBoost ? '✓' : '✗'} Speaker Boost
                    </Badge>
                    <Badge className="bg-blue-500">
                      Text to Speech ✓
                    </Badge>
                    <Badge className="bg-blue-500">
                      Sound Effects ✓
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button onClick={fetchElevenLabsStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh ElevenLabs Stats
              </Button>
            </div>
          </TabsContent>

          {/* Music Generation Tab */}
          <TabsContent value="music" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-pink-50 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Music className="w-5 h-5 text-pink-600" />
                    Total Tracks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-pink-700 dark:text-pink-400">{musicData.totalTracks.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+{musicData.tracksToday} today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-600" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">{musicData.activeUsers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top genre: {musicData.topGenre}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    Jingles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{musicData.jinglesCreated}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">created</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="w-5 h-5 text-teal-600" />
                    Background Tracks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">{musicData.backgroundTracks}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg: {musicData.avgDuration}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Design Studio Tab */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-200 dark:border-violet-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-violet-600" />
                    Total Designs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">{designData.totalDesigns.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+{designData.designsToday} today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{designData.activeUsers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top: {designData.topProvider}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-600" />
                    Impossible Print
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{designData.impossiblePrintOrders}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">orders sent</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-600" />
                    Other POD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{designData.otherPODOrders}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">integrations: {designData.printIntegrations}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BuilderIQ Tab */}
          <TabsContent value="builderiq" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-teal-600" />
                    Total Blueprints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">{builderIQData.totalBlueprints.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+{builderIQData.blueprintsToday} today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{builderIQData.activeUsers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top: {builderIQData.topCategory}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900/20 dark:to-teal-900/20 border-cyan-200 dark:border-cyan-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    Templates Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">{builderIQData.templatesUsed.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">total uses</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Avg Build Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{builderIQData.avgBuildTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">per blueprint</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intro/Outro Tab */}
          <TabsContent value="introoutro" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="w-5 h-5 text-rose-600" />
                    Total Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-rose-700 dark:text-rose-400">{introOutroData.totalCreated.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+{introOutroData.createdToday} today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-50 to-fuchsia-100 dark:from-pink-900/20 dark:to-fuchsia-900/20 border-pink-200 dark:border-pink-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-600" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-pink-700 dark:text-pink-400">{introOutroData.activeUsers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top: {introOutroData.topStyle}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-600" />
                    With Music
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{introOutroData.withMusic.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">creations</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="w-5 h-5 text-cyan-600" />
                    With Voiceover
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">{introOutroData.withVoiceover.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg: {introOutroData.avgDuration}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                      onClick={() => handleCleanupDemoUsers()}
                      disabled={refreshing}
                      className="text-pink-600 hover:text-pink-800 border-pink-300"
                      title="Delete all demo/test users (emails with demo, test, example)"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Cleanup Demo Users
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCleanupInactiveUsers(90)}
                      disabled={refreshing}
                      className="text-orange-600 hover:text-orange-800"
                      title="Cleanup users inactive for 90+ days"
                    >
                      <Database size={14} className="mr-1" />
                      Cleanup Inactive (90d)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePurgeDeletedUsers(30)}
                      disabled={refreshing}
                      className="text-red-700 hover:text-red-900 border-red-300"
                      title="Permanently purge soft-deleted users older than 30 days"
                    >
                      <XCircle size={14} className="mr-1" />
                      Purge Deleted (30d)
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">💡 User Action Guide:</p>
                  <p className="text-xs text-blue-700 mt-1">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>View •
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1 ml-2"></span>Impersonate •
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
                            onClick={() => handleImpersonateUser(user.id, user)}
                            disabled={refreshing}
                            className="text-purple-600 hover:text-purple-800 border-purple-300"
                            title="Impersonate User - View app as this user"
                          >
                            <UserCheck size={12} />
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

          {/* Prompt Hub Tab - NEW! */}
          <TabsContent value="prompthub" className="space-y-6">
            {/* Prompt Hub Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total Affiliate Revenue</p>
                      <p className="text-3xl font-bold">${(promptHubData.deploymentHub.affiliateRevenue + promptHubData.marketplace.affiliateRevenue).toFixed(2)}</p>
                      <p className="text-orange-200 text-xs mt-1">Combined from all sources</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Playground Tests</p>
                      <p className="text-3xl font-bold">{promptHubData.playground.totalTests.toLocaleString()}</p>
                      <p className="text-blue-200 text-xs mt-1">+{promptHubData.playground.testsToday} today</p>
                    </div>
                    <Play className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Deployments</p>
                      <p className="text-3xl font-bold">{promptHubData.deploymentHub.totalDeployments.toLocaleString()}</p>
                      <p className="text-purple-200 text-xs mt-1">+{promptHubData.deploymentHub.deploymentsToday} today</p>
                    </div>
                    <Rocket className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Affiliate Clicks</p>
                      <p className="text-3xl font-bold">{(promptHubData.deploymentHub.affiliateClicks + promptHubData.marketplace.affiliateClicks).toLocaleString()}</p>
                      <p className="text-green-200 text-xs mt-1">Across all platforms</p>
                    </div>
                    <Link className="w-12 h-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Three Feature Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prompt Playground Card */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    Prompt Playground
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    AI model testing environment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-600">{promptHubData.playground.totalTests}</p>
                      <p className="text-xs text-blue-500">Total Tests</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-indigo-600">{promptHubData.playground.activeUsers}</p>
                      <p className="text-xs text-indigo-500">Active Users</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Most Used Model</span>
                      <Badge className="bg-blue-500">{promptHubData.playground.mostUsedModel}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="font-semibold">{promptHubData.playground.avgResponseTime}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => window.open('/playground', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Playground
                  </Button>
                </CardContent>
              </Card>

              {/* Deployment Hub Card */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    Deployment Hub
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Platform deployment tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-purple-600">{promptHubData.deploymentHub.totalDeployments}</p>
                      <p className="text-xs text-purple-500">Deployments</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">${promptHubData.deploymentHub.affiliateRevenue.toFixed(0)}</p>
                      <p className="text-xs text-green-500">Revenue</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Top Platform</span>
                      <Badge className="bg-purple-500">{promptHubData.deploymentHub.topPlatform}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Affiliate Clicks</span>
                      <span className="font-semibold">{promptHubData.deploymentHub.affiliateClicks.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    onClick={() => window.open('/deployment-hub', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Deployment Hub
                  </Button>
                </CardContent>
              </Card>

              {/* Marketplace Card */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    Builder Marketplace
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Platform directory & affiliates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-orange-600">{promptHubData.marketplace.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-orange-500">Total Views</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">${promptHubData.marketplace.affiliateRevenue.toFixed(0)}</p>
                      <p className="text-xs text-green-500">Revenue</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Top Builder</span>
                      <Badge className="bg-orange-500">{promptHubData.marketplace.topBuilder}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Partner Programs</span>
                      <span className="font-semibold">{promptHubData.marketplace.partnersWithAffiliate}/{promptHubData.marketplace.totalPartners}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => window.open('/app-builders', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Marketplace
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Affiliate Partners Table */}
            <Card className="bg-white shadow-xl border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Verified Affiliate Partners
                </CardTitle>
                <CardDescription>
                  Platforms with active affiliate programs generating revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white">
                    <p className="text-green-100 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold">$12,894</p>
                    <p className="text-green-200 text-xs mt-1">+23% this month</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl text-white">
                    <p className="text-blue-100 text-sm">Total Clicks</p>
                    <p className="text-3xl font-bold">8,945</p>
                    <p className="text-blue-200 text-xs mt-1">From all platforms</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl text-white">
                    <p className="text-purple-100 text-sm">Conversions</p>
                    <p className="text-3xl font-bold">234</p>
                    <p className="text-purple-200 text-xs mt-1">2.6% conversion rate</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl text-white">
                    <p className="text-orange-100 text-sm">Active Programs</p>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-orange-200 text-xs mt-1">3 pending approval</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Platform</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commission Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Clicks</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Conversions</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'DigitalOcean', logo: '🌊', commission: '$200/referral', type: 'One-time', clicks: 892, conversions: 12, revenue: 2400, status: 'active', url: 'https://www.digitalocean.com/partners/referral-program', affiliateUrl: 'https://m.do.co/c/YOUR_REF_CODE' },
                        { name: 'Vercel', logo: '▲', commission: '20% recurring', type: 'Recurring', clicks: 1456, conversions: 45, revenue: 1890, status: 'active', url: 'https://vercel.com/partners', affiliateUrl: 'https://vercel.com/?ref=smartpromptiq' },
                        { name: 'Supabase', logo: '⚡', commission: '20% recurring', type: 'Recurring', clicks: 1123, conversions: 34, revenue: 1567, status: 'active', url: 'https://supabase.com/partners', affiliateUrl: 'https://supabase.com/?ref=smartpromptiq' },
                        { name: 'Replit', logo: '🔄', commission: '40% rev share', type: 'Rev Share', clicks: 765, conversions: 28, revenue: 987, status: 'active', url: 'https://replit.com/site/affiliates', affiliateUrl: 'https://replit.com/refer/wthomas19542' },
                        { name: 'Shopify', logo: '🛒', commission: '$150/sale', type: 'One-time', clicks: 678, conversions: 18, revenue: 2700, status: 'active', url: 'https://www.shopify.com/affiliates', affiliateUrl: 'https://shopify.com/?ref=smartpromptiq' },
                        { name: 'Webflow', logo: '🎨', commission: '50% first year', type: 'First Year', clicks: 543, conversions: 22, revenue: 1980, status: 'active', url: 'https://webflow.com/affiliates', affiliateUrl: 'https://webflow.com/?ref=smartpromptiq' },
                        { name: 'Hostinger', logo: '🏠', commission: 'Up to 60%', type: 'Tiered', clicks: 432, conversions: 15, revenue: 675, status: 'active', url: 'https://www.hostinger.com/affiliates', affiliateUrl: 'https://hostinger.com/?ref=smartpromptiq' },
                        { name: 'Cloudways', logo: '☁️', commission: '$125/sale', type: 'One-time', clicks: 234, conversions: 8, revenue: 1000, status: 'active', url: 'https://www.cloudways.com/en/affiliate-program.php', affiliateUrl: 'https://cloudways.com/?ref=smartpromptiq' },
                        { name: 'Railway', logo: '🚂', commission: '$5 credits', type: 'Credits', clicks: 456, conversions: 23, revenue: 115, status: 'active', url: 'https://railway.app/referrals', affiliateUrl: 'https://railway.app/?ref=smartpromptiq' },
                        { name: 'Render', logo: '🖼️', commission: 'Credits', type: 'Credits', clicks: 321, conversions: 12, revenue: 85, status: 'active', url: 'https://render.com/referrals', affiliateUrl: 'https://render.com/?ref=smartpromptiq' },
                        { name: 'Netlify', logo: '🌐', commission: 'Pending', type: 'N/A', clicks: 567, conversions: 0, revenue: 0, status: 'pending', url: 'https://www.netlify.com/partners/', affiliateUrl: '' },
                        { name: 'PlanetScale', logo: '🪐', commission: 'Pending', type: 'N/A', clicks: 234, conversions: 0, revenue: 0, status: 'pending', url: 'https://planetscale.com/partners', affiliateUrl: '' },
                        { name: 'Base44', logo: '🔷', commission: '20% for 6mo', type: 'Recurring', clicks: 345, conversions: 14, revenue: 840, status: 'active', url: 'https://base44.com/affiliates', affiliateUrl: 'https://base44.com/?ref=smartpromptiq' },
                        { name: 'Bubble', logo: '🫧', commission: '35% recurring', type: 'Recurring', clicks: 892, conversions: 31, revenue: 2170, status: 'active', url: 'https://bubble.io/affiliates', affiliateUrl: 'https://bubble.io/?ref=smartpromptiq' },
                        { name: 'Adalo', logo: '📱', commission: '20% for 12mo', type: 'Recurring', clicks: 523, conversions: 19, revenue: 1140, status: 'active', url: 'https://help.adalo.com/resources/adalo-affiliate-program', affiliateUrl: 'https://adalo.com/?ref=smartpromptiq' },
                        { name: 'Softr', logo: '🧩', commission: '25% for 12mo', type: 'Recurring', clicks: 412, conversions: 16, revenue: 960, status: 'active', url: 'https://www.softr.io/affiliate', affiliateUrl: 'https://softr.io/?ref=smartpromptiq' },
                        { name: 'Glide', logo: '✨', commission: '20% for 12mo', type: 'Recurring', clicks: 378, conversions: 12, revenue: 720, status: 'active', url: 'https://www.glideapps.com/affiliates', affiliateUrl: 'https://glideapps.com/?ref=smartpromptiq' },
                        { name: 'FlutterFlow', logo: '🦋', commission: 'Partner only', type: 'Partner', clicks: 456, conversions: 0, revenue: 0, status: 'pending', url: 'https://www.flutterflow.io/partner', affiliateUrl: '' },
                        { name: 'Bravo Studio', logo: '🎬', commission: 'Partner only', type: 'Partner', clicks: 234, conversions: 0, revenue: 0, status: 'pending', url: 'https://www.bravostudio.app/solutions-partners', affiliateUrl: '' },
                        { name: 'Wized', logo: '🔧', commission: 'TBD', type: 'N/A', clicks: 167, conversions: 0, revenue: 0, status: 'pending', url: 'https://wized.com', affiliateUrl: '' },
                        { name: 'Bolt.new', logo: '⚡', commission: 'None yet', type: 'N/A', clicks: 1234, conversions: 0, revenue: 0, status: 'no_program', url: 'https://bolt.new', affiliateUrl: '' },
                        { name: 'Lovable', logo: '💜', commission: 'None yet', type: 'N/A', clicks: 876, conversions: 0, revenue: 0, status: 'no_program', url: 'https://lovable.dev', affiliateUrl: '' },
                        { name: 'v0.dev', logo: '🔮', commission: 'None yet', type: 'N/A', clicks: 654, conversions: 0, revenue: 0, status: 'no_program', url: 'https://v0.dev', affiliateUrl: '' },
                      ].map((partner, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{partner.logo}</span>
                              <div>
                                <span className="font-medium block">{partner.name}</span>
                                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                                  View Program →
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${
                              partner.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                              partner.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {partner.commission}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                              partner.type === 'Recurring' ? 'bg-purple-100 text-purple-700' :
                              partner.type === 'Rev Share' ? 'bg-blue-100 text-blue-700' :
                              partner.type === 'One-time' ? 'bg-green-100 text-green-700' :
                              partner.type === 'Tiered' ? 'bg-orange-100 text-orange-700' :
                              partner.type === 'First Year' ? 'bg-pink-100 text-pink-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {partner.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{partner.clicks.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">{partner.conversions}</td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${partner.revenue > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              ${partner.revenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              partner.status === 'active' ? 'bg-green-500 text-white' :
                              partner.status === 'pending' ? 'bg-yellow-500 text-white' :
                              'bg-gray-400 text-white'
                            }>
                              {partner.status === 'no_program' ? 'No Program' : partner.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {partner.affiliateUrl ? (
                              <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                                navigator.clipboard.writeText(partner.affiliateUrl);
                              }}>
                                Copy Link
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800">Active Programs Revenue</p>
                        <p className="text-sm text-green-600">17 active partners</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">$18,724</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-purple-800">Recurring Revenue</p>
                        <p className="text-sm text-purple-600">Monthly passive income</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">$4,890/mo</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-orange-800">Potential Revenue</p>
                        <p className="text-sm text-orange-600">From pending + no program clicks</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">$8,500+</p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Revenue Optimization Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Bubble at 35% recurring</strong> is the highest commission - prioritize this platform!</li>
                    <li>• <strong>No-code builders</strong> (Base44, Adalo, Softr, Glide) all have 20-25% recurring - great passive income</li>
                    <li>• <strong>FlutterFlow & Bravo Studio</strong> have partner programs only - apply as an agency partner</li>
                    <li>• <strong>Bolt.new</strong> has 1,234 clicks but no affiliate program - contact them about partnership!</li>
                    <li>• <strong>Shopify at $150/sale</strong> is high value - good conversion rate at 2.7%</li>
                    <li>• <strong>Wized</strong> doesn't have a public program yet - reach out directly for partnership</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Management Dashboard */}
          <TabsContent value="costs" className="space-y-6">
            <CostDashboard />
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