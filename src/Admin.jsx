import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    satisfactionRate: 0,
    newUsersToday: 0,
    userRetention: 0
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

  // Colors for charts
  const sentimentColors = {
    'Very Positive': '#10B981',
    'Positive': '#34D399',
    'Neutral': '#F59E0B',
    'Negative': '#F87171',
    'Very Negative': '#EF4444'
  };

  const symptomColors = {
    fever: '#EF4444',
    fatigue: '#F59E0B',
    cough: '#3B82F6',
    headache: '#8B5CF6',
    anxiety: '#10B981',
    pain: '#EC4899',
    nausea: '#6B7280',
    shortness_of_breath: '#14B8A6',
    other: '#D1D5DB'
  };

  // Base URL for API requests
  const BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-b5jw.onrender.com';

  // Fetch helper with error handling
  const fetchWithAuth = useCallback(async (endpoint) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      throw new Error('No authentication token found');
    }
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error for ${url}: Status ${response.status}, Response: ${text.substring(0, 100)}`);
      if (response.status === 401) {
        setError('Unauthorized: Please sign in again');
        setTimeout(() => navigate('/login'), 2000);
        throw new Error('Unauthorized');
      }
      if (response.status === 403) {
        setError('Admin access required');
        throw new Error('Admin access required');
      }
      if (response.status === 400) {
        throw new Error('Invalid request parameters');
      }
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  }, [navigate]);

  // Fetch all data for the active tab and time range
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview' || activeTab === 'users') {
        const [activity, convs, users, metrics] = await Promise.all([
          fetchWithAuth(`/api/admin/analytics/user_activity?time_range=${timeRange}`),
          fetchWithAuth('/api/admin/analytics/conversations?page=1&per_page=10'),
          fetchWithAuth('/api/admin/users?page=1&per_page=10'),
          fetchWithAuth(`/api/admin/analytics/user_metrics?time_range=${timeRange}`)
        ]);
        const conversationIds = convs.conversations.map(c => c.id).join(',');
        const sentiment = conversationIds ? await fetchWithAuth(`/api/admin/analytics/sentiment?conversation_ids=${conversationIds}`) : [];
        setHourlyActivity(activity);
        setConversations(convs.conversations);
        setSentimentData(sentiment.map(entry => ({
          name: entry.name,
          value: entry.value,
          color: sentimentColors[entry.name] || '#888888'
        })));
        setRecentUsers(users.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          joinedAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
          status: user.status,
          lastActive: user.last_active ? new Date(user.last_active).toLocaleString() : 'N/A',
          totalSessions: user.total_sessions || 0,
          avgSessionTime: user.avg_session_time ? `${Math.round(user.avg_session_time)} min` : 'N/A'
        })));
        setDashboardData({
          totalUsers: users.total,
          activeUsers: activity.reduce((sum, h) => sum + (h.users || 0), 0),
          totalConversations: convs.total,
          avgSessionTime: users.users.length ? `${Math.round(users.users.reduce((sum, u) => sum + (u.avg_session_time || 0), 0) / users.users.length)} min` : '0 min',
          userGrowth: metrics.user_growth || 0,
          satisfactionRate: sentiment.find(s => s.name === 'Positive')?.value || 0,
          newUsersToday: metrics.new_users_today || 0,
          userRetention: metrics.user_retention || 0
        });
      } else if (activeTab === 'analytics') {
        const [trends, comm, diagnostics] = await Promise.all([
          fetchWithAuth(`/api/admin/analytics/symptom_trends?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/communication_metrics?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/diagnostic_patterns?time_range=${timeRange}`)
        ]);
        setSymptomTrends(trends);
        setCommunicationData(comm);
        setDiagnosticPatterns(diagnostics);
      } else if (activeTab === 'insights') {
        const [alerts, prefs, literacy, workflow, ai] = await Promise.all([
          fetchWithAuth('/api/admin/analytics/health_alerts'),
          fetchWithAuth(`/api/admin/analytics/treatment_preferences?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/health_literacy?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/workflow_metrics?time_range=${timeRange}`),
          fetchWithAuth(`/api/admin/analytics/ai_performance?time_range=${timeRange}`)
        ]);
        setHealthAlerts(alerts);
        setTreatmentPreferences(prefs);
        setHealthLiteracy(literacy);
        setWorkflowMetrics(workflow);
        setAiPerformance(ai);
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
  }, [fetchDashboardData]);

  // Polling for health alerts in Insights tab
  useEffect(() => {
    if (activeTab !== 'insights') return;
    const interval = setInterval(async () => {
      try {
        const alerts = await fetchWithAuth('/api/admin/analytics/health_alerts');
        setHealthAlerts(alerts);
      } catch (err) {
        console.error('Error polling health alerts:', err);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeTab, fetchWithAuth]);

  // Handle refresh button
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle download (CSV export)
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

  // Memoized symptom keys for dynamic chart rendering
  const symptomKeys = useMemo(() => {
    if (!symptomTrends.length) return [];
    return Object.keys(symptomTrends[0]).filter(key => key !== 'date');
  }, [symptomTrends]);

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
        <div className="mb-8">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
            <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="users" label="Users" isActive={activeTab === 'users'} onClick={setActiveTab} />
            <TabButton id="analytics" label="Analytics" isActive={activeTab === 'analytics'} onClick={setActiveTab} />
            <TabButton id="insights" label="AI Insights" isActive={activeTab === 'insights'} onClick={setActiveTab} />
          </div>
        </div>

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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily User Activity</h3>
                {hourlyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={hourlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500">No activity data available</div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Sentiment Analysis</h3>
                {sentimentData.length > 0 ? (
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
                ) : (
                  <div className="text-center text-gray-500">No sentiment data available</div>
                )}
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
              <StatCard 
                title="New Users Today" 
                value={dashboardData.newUsersToday.toLocaleString()} 
                change={0} 
                icon={UserPlus} 
                color="green" 
              />
              <StatCard 
                title="Active Sessions" 
                value={dashboardData.activeUsers.toLocaleString()} 
                change={0} 
                icon={Activity} 
                color="blue" 
              />
              <StatCard 
                title="User Retention" 
                value={`${dashboardData.userRetention}%`} 
                change={0} 
                icon={TrendingUp} 
                color="purple" 
              />
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Trends & Disease Surveillance</h3>
              {symptomTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={symptomTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {symptomKeys.map((key) => (
                      <Line 
                        key={key} 
                        type="monotone" 
                        dataKey={key} 
                        stroke={symptomColors[key] || '#888888'} 
                        strokeWidth={2} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500">No symptom data available</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Effectiveness</h3>
              {communicationData.length > 0 ? (
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
              ) : (
                <div className="text-center text-gray-500">No communication data available</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Diagnostic Patterns</h3>
              {diagnosticPatterns.length > 0 ? (
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
                            <div className={`w-4 h-4 flex items-center justify-center ${
                              pattern.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {pattern.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500">No diagnostic data available</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthAlerts.length > 0 ? healthAlerts.slice(0, 3).map((alert, index) => (
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
              )) : (
                <div className="text-center text-gray-500 col-span-3">No health alerts available</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Model Performance</h3>
              {aiPerformance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Response Quality Metrics</h4>
                    <div className="space-y-3">
                      {aiPerformance.filter(m => m.metric.includes('Quality')).map((metric, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{metric.metric}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metric.value}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{metric.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Safety Metrics</h4>
                    <div className="space-y-3">
                      {aiPerformance.filter(m => m.metric.includes('Safety')).map((metric, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{metric.metric}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metric.value}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{metric.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">No AI performance data available</div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Preference Trends</h3>
                {treatmentPreferences.length > 0 ? (
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
                ) : (
                  <div className="text-center text-gray-500">No treatment preference data available</div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Literacy by Demographics</h3>
                {healthLiteracy.length > 0 ? (
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
                ) : (
                  <div className="text-center text-gray-500">No health literacy data available</div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow & Operational Insights</h3>
              {workflowMetrics.length > 0 ? (
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
              ) : (
                <div className="text-center text-gray-500">No workflow metrics available</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Health Alerts</h3>
              {healthAlerts.length > 0 ? (
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
              ) : (
                <div className="text-center text-gray-500">No health alerts available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
