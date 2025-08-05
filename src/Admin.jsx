import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Heart, 
  Brain, 
  AlertTriangle,
  Clock,
  MessageSquare,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  UserPlus,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for API data
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalConversations: 0,
    avgSessionTime: '0 min',
    userGrowth: 0,
    satisfactionRate: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [symptomTrends, setSymptomTrends] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [communicationData, setCommunicationData] = useState([]);
  const [diagnosticPatterns, setDiagnosticPatterns] = useState([]);
  const [hourlyActivity, setHourlyActivity] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [treatmentPreferences, setTreatmentPreferences] = useState([]);
  const [healthLiteracy, setHealthLiteracy] = useState([]);
  const [workflowMetrics, setWorkflowMetrics] = useState([]);
  const [aiPerformance, setAiPerformance] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Colors for sentiment pie chart
  const sentimentColors = {
    'Very Positive': '#10B981',
    'Positive': '#34D399',
    'Neutral': '#F59E0B',
    'Negative': '#F87171',
    'Very Negative': '#EF4444'
  };

  // Fetch helper with error handling
  const fetchWithAuth = useCallback(async (url) => {
    const token = localStorage.getItem('adminToken'); // Assumes token stored after sign-in
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 401) throw new Error('Unauthorized: Please sign in again');
    if (response.status === 403) throw new Error('Admin access required');
    if (response.status === 400) throw new Error('Invalid request parameters');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  }, []);

  // Fetch all data for the active tab and time range
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview') {
        // Fetch user activity and sentiment
        const [activity, convs] = await Promise.all([
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/user_activity?time_range=${timeRange}`),
          fetchWithAuth('https://backend-b5jw.onrender.com/api/admin/analytics/conversations?page=1&per_page=10')
        ]);
        const conversationIds = convs.conversations.map(c => c.id).join(',');
        const sentiment = conversationIds ? await fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/sentiment?conversation_ids=${conversationIds}`) : [];
        setHourlyActivity(activity);
        setConversations(convs.conversations);
        setSentimentData(Object.entries(sentiment).map(([name, value]) => ({
          name,
          value,
          color: sentimentColors[name] || '#888888'
        })));
        // Fetch recent users (simulated from conversations)
        setRecentUsers(convs.conversations.slice(0, 5).map((conv, i) => ({
          id: conv.user_id,
          name: `User ${conv.user_id}`,
          email: `user${conv.user_id}@example.com`,
          joinedAt: conv.created_at,
          status: 'active',
          lastActive: conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString() : 'N/A'
        })));
      } else if (activeTab === 'users') {
        // Fetch user activity and conversations
        const [activity, convs] = await Promise.all([
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/user_activity?time_range=${timeRange}`),
          fetchWithAuth('https://backend-b5jw.onrender.com/api/admin/analytics/conversations?page=1&per_page=10')
        ]);
        setHourlyActivity(activity);
        setRecentUsers(convs.conversations.slice(0, 5).map((conv, i) => ({
          id: conv.user_id,
          name: `User ${conv.user_id}`,
          email: `user${conv.user_id}@example.com`,
          joinedAt: conv.created_at.split('T')[0],
          status: 'active',
          lastActive: conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString() : 'N/A',
          totalSessions: Math.floor(Math.random() * 50) + 1,
          avgSessionTime: `${Math.floor(Math.random() * 15) + 3} min`
        })));
      } else if (activeTab === 'analytics') {
        // Fetch symptom trends, communication metrics, diagnostic patterns
        const [trends, comm, diagnostics] = await Promise.all([
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/symptom_trends?time_range=${timeRange}`),
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/communication_metrics?time_range=${timeRange}`),
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/diagnostic_patterns?time_range=${timeRange}`)
        ]);
        setSymptomTrends(trends);
        setCommunicationData(comm);
        setDiagnosticPatterns(diagnostics);
      } else if (activeTab === 'insights') {
        // Fetch health alerts, treatment preferences, health literacy, workflow, AI performance
        const [alerts, prefs, literacy, workflow, ai] = await Promise.all([
          fetchWithAuth('https://backend-b5jw.onrender.com/api/admin/analytics/health_alerts'),
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/treatment_preferences?time_range=${timeRange}`),
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/health_literacy?time_range=${timeRange}`),
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/workflow_metrics?time_range=${timeRange}`),
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/ai_performance?time_range=${timeRange}`)
        ]);
        setHealthAlerts(alerts);
        setTreatmentPreferences(prefs);
        setHealthLiteracy(literacy);
        setWorkflowMetrics(workflow);
        setAiPerformance(ai);
      }

      // Fetch dashboard stats for overview
      if (activeTab === 'overview') {
        const [activity, convs] = await Promise.all([
          fetchWithAuth(`https://backend-b5jw.onrender.com/api/admin/analytics/user_activity?time_range=${timeRange}`),
          fetchWithAuth('https://backend-b5jw.onrender.com/api/admin/analytics/conversations?page=1&per_page=10')
        ]);
        setDashboardData({
          totalUsers: convs.total,
          activeUsers: activity.reduce((sum, h) => sum + (h.users || 0), 0),
          totalConversations: convs.total,
          avgSessionTime: 'N/A', // Requires session tracking endpoint
          userGrowth: 0, // Requires historical user data endpoint
          satisfactionRate: 0 // Requires user feedback endpoint
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, timeRange, fetchWithAuth]);

  // Initial fetch and timeRange/activeTab change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, activeTab, timeRange]);

  // Polling for health alerts in Insights tab
  useEffect(() => {
    if (activeTab !== 'insights') return;
    const interval = setInterval(async () => {
      try {
        const alerts = await fetchWithAuth('https://backend-b5jw.onrender.com/api/admin/analytics/health_alerts');
        setHealthAlerts(alerts);
      } catch (err) {
        console.error('Error polling health alerts:', err);
      }
    }, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [activeTab, fetchWithAuth]);

  // Handle refresh button
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle download (CSV export example)
  const handleDownload = () => {
    const data = activeTab === 'overview' ? hourlyActivity :
                 activeTab === 'users' ? recentUsers :
                 activeTab === 'analytics' ? symptomTrends :
                 healthAlerts;
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_data_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Convert data to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">  𝐻𝑒𝒶𝓁𝐼𝒜 </h1>
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
        {isLoading && <div className="text-center text-gray-600">Loading...</div>}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
            <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="users" label="Users" isActive={activeTab === 'users'} onClick={setActiveTab} />
            <TabButton id="analytics" label="Analytics" isActive={activeTab === 'analytics'} onClick={setActiveTab} />
            <TabButton id="insights" label="AI Insights" isActive={activeTab === 'insights'} onClick={setActiveTab} />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                change={0} // Requires historical data
                icon={Activity} 
                color="green" 
              />
              <StatCard 
                title="Total Conversations" 
                value={dashboardData.totalConversations.toLocaleString()} 
                change={0} // Requires historical data
                icon={MessageSquare} 
                color="purple" 
              />
              <StatCard 
                title="Avg Session Time" 
                value={dashboardData.avgSessionTime} 
                change={0} // Requires session tracking
                icon={Clock} 
                color="orange" 
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily User Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Sentiment Analysis</h3>
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
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
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
                        <td className="py-3 px-4 text-sm text-gray-600">{user.joinedAt}</td>
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
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
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
              <StatCard title="New Users Today" value={0} change={0} icon={UserPlus} color="green" />
              <StatCard title="Active Sessions" value={dashboardData.activeUsers} change={0} icon={Activity} color="blue" />
              <StatCard title="User Retention" value="N/A" change={0} icon={TrendingUp} color="purple" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Registration Date</th>
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
                        <td className="py-3 px-4 text-sm text-gray-600">{user.joinedAt}</td>
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
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Trends & Disease Surveillance</h3>
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
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Effectiveness</h3>
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
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Diagnostic Patterns</h3>
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
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Model Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Response Quality Metrics</h4>
                  <div className="space-y-3">
                    {aiPerformance.quality && Object.entries(aiPerformance.quality).map(([key, value], index) => (
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
                    {aiPerformance.safety && Object.entries(aiPerformance.safety).map(([key, value], index) => (
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
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Preference Trends</h3>
                <div className="space-y-4">
                  {treatmentPreferences.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.treatment}</span>
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
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Literacy by Demographics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={healthLiteracy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="understanding" fill="#3B82F6" name="Understanding Rate" />
                    <Bar dataKey="engagement" fill="#10B981" name="Engagement Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow & Operational Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workflowMetrics.map((metric, index) => (
                  <div key={index} className={`text-center p-4 rounded-lg ${
                    index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-green-50' : 'bg-purple-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-purple-600'
                    } mb-2`}>{metric.value}</div>
                    <div className="text-sm font-medium text-gray-700">{metric.metric}</div>
                    <div className="text-xs text-gray-500 mt-1">{metric.change}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Health Alerts</h3>
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
                      <div className="text-xs text-gray-500 mt-2">{new Date(alert.time).toLocaleString()}</div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;