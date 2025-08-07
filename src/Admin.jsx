import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, TrendingUp, Heart, Brain, AlertTriangle,
  Clock, MessageSquare, BarChart3, Calendar, Filter, Search,
  Download, RefreshCw, Eye, UserPlus, ChevronDown, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // State for API data with default values
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalConversations: 0,
    avgSessionTime: '0 min',
    userGrowth: 0,
    satisfactionRate: 0,
    newUsersToday: 0,
    activeSessions: 0,
    userRetention: '0%'
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [symptomTrends, setSymptomTrends] = useState([]);
  const [sentimentData, setSentimentData] = useState([
    { name: 'Positive', value: 70, color: '#34D399' },
    { name: 'Neutral', value: 20, color: '#F59E0B' },
    { name: 'Negative', value: 10, color: '#F87171' }
  ]);
  
  const [communicationData, setCommunicationData] = useState([]);
  const [diagnosticPatterns, setDiagnosticPatterns] = useState([]);
  const [hourlyActivity, setHourlyActivity] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [treatmentPreferences, setTreatmentPreferences] = useState([]);
  const [healthLiteracy, setHealthLiteracy] = useState([]);
  const [workflowMetrics, setWorkflowMetrics] = useState([]);
  const [aiPerformance, setAiPerformance] = useState({
    quality: {
      'Accuracy Rate': 85,
      'Relevance Score': 92,
      'Response Quality': 88
    },
    safety: {
      'Safety Score': 95,
      'Compliance Rate': 98,
      'Risk Flag Rate': 2
    }
  });
  const [conversations, setConversations] = useState([]);

  const BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-b5jw.onrender.com';

  const fetchWithAuth = useCallback(async (endpoint) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      throw new Error('No authentication token found');
    }

    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status === 401) {
          setError('Unauthorized: Please sign in again');
          setTimeout(() => navigate('/login'), 2000);
        }
        throw new Error(text || 'Request failed');
      }
      return response.json();
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      throw err;
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Overview and Users tab data
      if (activeTab === 'overview' || activeTab === 'users') {
        const [activity, convs, usersData] = await Promise.all([
          fetchWithAuth(`/api/admin/analytics/user_activity?time_range=${timeRange}`),
          fetchWithAuth('/api/admin/analytics/conversations?page=1&per_page=10'),
          fetchWithAuth('/api/admin/users?page=1&per_page=10')
        ]);

        setHourlyActivity(activity?.map(item => ({
          hour: item.hour?.toString().padStart(2, '0') + ':00',
          users: item.users || 0
        })) || []);

        setConversations(convs?.conversations || []);
        
        // Handle sentiment data
        let sentimentResult = [];
        if (convs?.conversations?.length > 0) {
          try {
            const conversationIds = convs.conversations.map(c => c.id).join(',');
            sentimentResult = await fetchWithAuth(
              `/api/admin/analytics/sentiment?conversation_ids=${conversationIds}`
            );
          } catch (e) {
            console.error('Failed to fetch sentiment:', e);
          }
        }
        
        setSentimentData(
          sentimentResult?.map(entry => ({
            name: entry.name,
            value: entry.value,
            color: {
              'Very Positive': '#10B981',
              'Positive': '#34D399',
              'Neutral': '#F59E0B',
              'Negative': '#F87171',
              'Very Negative': '#EF4444'
            }[entry.name] || '#888888'
          })) || []
        );

        // Handle users data
        const users = usersData?.users || [];
        setRecentUsers(users.map(user => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email || 'No email',
          status: user.status || 'active',
          lastActive: user.last_active ? new Date(user.last_active).toLocaleString() : 'N/A',
          totalSessions: user.total_sessions || 0,
          avgSessionTime: user.avg_session_time ? `${Math.round(user.avg_session_time)} min` : '0 min'
        })));

        if (activeTab === 'overview') {
          const totalActiveUsers = activity?.reduce((sum, h) => sum + (h.users || 0), 0) || 0;
          const avgSentiment = sentimentResult?.find(s => s.name === 'Positive')?.value || 0;
          
          setDashboardData({
            totalUsers: usersData?.total || 0,
            activeUsers: totalActiveUsers,
            totalConversations: convs?.total || 0,
            avgSessionTime: users.length ? 
              `${Math.round(users.reduce((sum, u) => sum + (u.avg_session_time || 0), 0) / users.length)} min` : '0 min',
            userGrowth: users.length > 0 ? Math.round((users.length / (usersData?.total || 1)) * 100) : 0,
            satisfactionRate: avgSentiment,
            newUsersToday: users.filter(u => {
              if (!u.last_active) return false;
              const lastActive = new Date(u.last_active);
              const today = new Date();
              return lastActive.toDateString() === today.toDateString();
            }).length,
            activeSessions: totalActiveUsers,
            userRetention: users.length > 0 ? 
              `${Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}%` : '0%'
          });
        }
      }
      
      // Analytics tab data
      else if (activeTab === 'analytics') {
        const [trends, comm, diagnostics] = await Promise.all([
          fetchWithAuth(`/api/admin/analytics/symptom_trends?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/communication_metrics?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/diagnostic_patterns?time_range=${timeRange}`)
        ]);
        
        setSymptomTrends(trends || []);
        setCommunicationData(comm || []);
        setDiagnosticPatterns(diagnostics || []);
      }
      
      // Insights tab data
      else if (activeTab === 'insights') {
        const [alerts, prefs, literacy, workflow, ai] = await Promise.all([
          fetchWithAuth('/api/admin/analytics/health_alerts'),
          fetchWithAuth(`/api/admin/analytics/treatment_preferences?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/health_literacy?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/workflow_metrics?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/ai_performance?time_range=${timeRange}`)
        ]);
        
        setHealthAlerts(alerts || []);
        setTreatmentPreferences(prefs || []);
        setHealthLiteracy(literacy || []);
        setWorkflowMetrics(workflow || []);
        
        // Transform aiPerformance data
        const aiData = { quality: {}, safety: {} };
        if (Array.isArray(ai)) {
          ai.forEach(item => {
            const category = item.metric?.includes('Accuracy') || 
                           item.metric?.includes('Relevance') ? 'quality' : 'safety';
            aiData[category][item.metric] = item.value;
          });
        }
        setAiPerformance(aiData);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [activeTab, timeRange, fetchWithAuth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Polling for health alerts
  useEffect(() => {
    if (activeTab !== 'insights') return;
    const interval = setInterval(async () => {
      try {
        const alerts = await fetchWithAuth('/api/admin/analytics/health_alerts');
        setHealthAlerts(alerts || []);
      } catch (err) {
        console.error('Error polling health alerts:', err);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeTab, fetchWithAuth]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleDownload = () => {
    const data = activeTab === 'overview' ? hourlyActivity :
                 activeTab === 'users' ? recentUsers :
                 activeTab === 'analytics' ? symptomTrends :
                 healthAlerts;
    
    if (!data || data.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_data_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        `"${val !== null && val !== undefined ? val.toString().replace(/"/g, '""') : ''}"`
      ).join(',')
    ).join('\n');
    return `${headers}\n${rows}`;
  };

  // UI Components
  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const UserTable = ({ users }) => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-3 px-4">
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </td>
            <td className="py-3 px-4">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600">{user.lastActive}</td>
            <td className="py-3 px-4">
              <button className="text-blue-600 hover:text-blue-700">
                <Eye className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const EmptyState = ({ message }) => (
    <div className="text-center py-8">
      <p className="text-gray-600">{message}</p>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
        <div className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
      </div>
      <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
    </div>
  );

  const OverviewTab = ({ dashboardData, hourlyActivity, sentimentData, recentUsers }) => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={dashboardData.totalUsers.toLocaleString()} 
          change={dashboardData.userGrowth}
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="Active Users" 
          value={dashboardData.activeUsers.toLocaleString()} 
          change={0}
          icon={Activity} 
          color="green" 
        />
        <StatCard 
          title="Total Conversations" 
          value={dashboardData.totalConversations.toLocaleString()} 
          change={0}
          icon={MessageSquare} 
          color="purple" 
        />
        <StatCard 
          title="Avg Session Time" 
          value={dashboardData.avgSessionTime} 
          change={0}
          icon={Clock} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily User Activity">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient Sentiment Analysis">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          {recentUsers.length === 0 ? (
            <EmptyState message="No recent users found" />
          ) : (
            <UserTable users={recentUsers} />
          )}
        </div>
      </div>
    </div>
  );

  const UsersTab = ({ dashboardData, recentUsers, searchTerm, setSearchTerm }) => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="New Users Today" value={dashboardData.newUsersToday} change={0} icon={UserPlus} color="green" />
        <StatCard title="Active Sessions" value={dashboardData.activeSessions} change={0} icon={Activity} color="blue" />
        <StatCard title="User Retention" value={dashboardData.userRetention} change={0} icon={TrendingUp} color="purple" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
        <div className="overflow-x-auto">
          {recentUsers.length === 0 ? (
            <EmptyState message="No users found" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total Sessions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Session Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.totalSessions}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.avgSessionTime}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  const AnalyticsTab = ({ symptomTrends, communicationData, diagnosticPatterns }) => (
    <div className="space-y-6">
      <ChartCard title="Symptom Trends & Disease Surveillance">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={symptomTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="fever" stroke="#EF4444" strokeWidth={2} />
            <Line type="monotone" dataKey="fatigue" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="cough" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="headache" stroke="#8B5CF6" strokeWidth={2} />
            <Line type="monotone" dataKey="anxiety" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Communication Effectiveness">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {communicationData.map((metric, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.metric}</span>
                <div className={`flex items-center text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metric.metric.includes('Score') ? metric.current : `${metric.current}%`}
              </div>
              <div className="text-xs text-gray-500">
                vs {metric.metric.includes('Score') ? metric.previous : `${metric.previous}%`} last period
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
      <ChartCard title="AI Diagnostic Patterns">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Condition</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Frequency</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Accuracy Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {diagnosticPatterns.map((pattern, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{pattern.condition}</td>
                  <td className="py-3 px-4 text-gray-600">{pattern.frequency}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${pattern.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{pattern.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );

  const InsightsTab = ({ healthAlerts, aiPerformance, treatmentPreferences, healthLiteracy, workflowMetrics }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthAlerts.slice(0, 3).map((alert, index) => (
          <div key={index} className={`bg-gradient-to-r ${
            alert.severity === 'high' ? 'from-red-500 to-red-600' :
            alert.severity === 'medium' ? 'from-orange-500 to-orange-600' :
            'from-blue-500 to-blue-600'
          } rounded-xl p-6 text-white`}>
            <div className="flex items-center mb-4">
              {alert.severity === 'high' ? <AlertTriangle className="w-6 h-6 mr-2" /> :
               alert.severity === 'medium' ? <Brain className="w-6 h-6 mr-2" /> :
               <Heart className="w-6 h-6 mr-2" />}
              <h3 className="font-semibold">{alert.title}</h3>
            </div>
            <p className="text-sm opacity-90 mb-2">{alert.description}</p>
            <button className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30">
              View Details
            </button>
          </div>
        ))}
      </div>
      <ChartCard title="AI Model Performance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Response Quality Metrics</h4>
            <div className="space-y-3">
              {Object.entries(aiPerformance.quality).map(([key, value], index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{key}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Safety Metrics</h4>
            <div className="space-y-3">
              {Object.entries(aiPerformance.safety).map(([key, value], index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{key}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ChartCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Treatment Preference Trends">
          <div className="space-y-4">
            {treatmentPreferences.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.treatment_type}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.percentage}%</span>
                  <div className={`w-4 h-4 flex items-center justify-center ${
                    item.trend === 'up' ? 'text-green-500' : 
                    item.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {item.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : 
                     item.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : 
                     <div className="w-3 h-0.5 bg-gray-400 rounded"></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Health Literacy by Demographics">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthLiteracy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#3B82F6" name="Percentage" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title="Workflow & Operational Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowMetrics.map((metric, index) => (
            <div key={index} className={`text-center p-4 rounded-lg ${
              index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-green-50' : 'bg-purple-50'
            }`}>
              <div className={`text-2xl font-bold ${
                index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-purple-600'
              } mb-2`}>{metric.value}</div>
              <div className="text-sm font-medium text-gray-700">{metric.metric}</div>
            </div>
          ))}
        </div>
      </ChartCard>
      <ChartCard title="Real-time Health Alerts">
        <div className="space-y-3">
          {healthAlerts.map((alert, index) => (
            <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${
              alert.severity === 'high' ? 'bg-red-50 border-red-200' :
              alert.severity === 'medium' ? 'bg-orange-50 border-orange-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className={`p-1 rounded-full ${
                alert.severity === 'high' ? 'bg-red-100' :
                alert.severity === 'medium' ? 'bg-orange-100' :
                'bg-blue-100'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${
                  alert.severity === 'high' ? 'text-red-600' :
                  alert.severity === 'medium' ? 'text-orange-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{alert.title}</div>
                <div className="text-sm text-gray-600 mt-1">{alert.description}</div>
                <div className="text-xs text-gray-500 mt-2">{new Date(alert.created_at).toLocaleString()}</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">HealIA</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                </select>
              </div>
              <button onClick={handleRefresh} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={handleDownload} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {initialLoad && isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
                Error: {error}
              </div>
            )}

            <div className="mb-8">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
                <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
                <TabButton id="users" label="Users" isActive={activeTab === 'users'} onClick={setActiveTab} />
                <TabButton id="analytics" label="Analytics" isActive={activeTab === 'analytics'} onClick={setActiveTab} />
                <TabButton id="insights" label="AI Insights" isActive={activeTab === 'insights'} onClick={setActiveTab} />
              </div>
            </div>

            {isLoading && !initialLoad ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                <p className="mt-2 text-gray-600">Loading data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab 
                    dashboardData={dashboardData}
                    hourlyActivity={hourlyActivity}
                    sentimentData={sentimentData}
                    recentUsers={recentUsers}
                  />
                )}

                {activeTab === 'users' && (
                  <UsersTab
                    dashboardData={dashboardData}
                    recentUsers={recentUsers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    symptomTrends={symptomTrends}
                    communicationData={communicationData}
                    diagnosticPatterns={diagnosticPatterns}
                  />
                )}

                {activeTab === 'insights' && (
                  <InsightsTab
                    healthAlerts={healthAlerts}
                    aiPerformance={aiPerformance}
                    treatmentPreferences={treatmentPreferences}
                    healthLiteracy={healthLiteracy}
                    workflowMetrics={workflowMetrics}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
