import React, { useState, useEffect } from 'react';
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

  // Mock data - in real app, this would come from your API
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 2847,
    activeUsers: 1924,
    totalConversations: 15683,
    avgSessionTime: '8.5 min',
    userGrowth: 12.5,
    satisfactionRate: 94.2
  });

  // Recent users data
  const recentUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', joinedAt: '2025-08-04 14:30', status: 'active', lastActive: '2 min ago' },
    { id: 2, name: 'Michael Chen', email: 'm.chen@email.com', joinedAt: '2025-08-04 13:45', status: 'active', lastActive: '15 min ago' },
    { id: 3, name: 'Emma Williams', email: 'emma.w@email.com', joinedAt: '2025-08-04 12:20', status: 'inactive', lastActive: '2 hours ago' },
    { id: 4, name: 'David Rodriguez', email: 'd.rodriguez@email.com', joinedAt: '2025-08-04 11:15', status: 'active', lastActive: '5 min ago' },
    { id: 5, name: 'Lisa Thompson', email: 'lisa.t@email.com', joinedAt: '2025-08-04 10:45', status: 'active', lastActive: '1 min ago' }
  ];

  // Symptom trends data
  const symptomTrends = [
    { date: '2025-07-28', fever: 45, fatigue: 67, cough: 89, headache: 34, anxiety: 23 },
    { date: '2025-07-29', fever: 52, fatigue: 71, cough: 94, headache: 41, anxiety: 28 },
    { date: '2025-07-30', fever: 48, fatigue: 63, cough: 87, headache: 38, anxiety: 31 },
    { date: '2025-07-31', fever: 61, fatigue: 79, cough: 102, headache: 45, anxiety: 25 },
    { date: '2025-08-01', fever: 58, fatigue: 85, cough: 98, headache: 52, anxiety: 33 },
    { date: '2025-08-02', fever: 64, fatigue: 91, cough: 105, headache: 48, anxiety: 29 },
    { date: '2025-08-03', fever: 71, fatigue: 88, cough: 112, headache: 55, anxiety: 37 },
    { date: '2025-08-04', fever: 69, fatigue: 93, cough: 108, headache: 51, anxiety: 42 }
  ];

  // Patient sentiment data
  const sentimentData = [
    { name: 'Very Positive', value: 28, color: '#10B981' },
    { name: 'Positive', value: 42, color: '#34D399' },
    { name: 'Neutral', value: 23, color: '#F59E0B' },
    { name: 'Negative', value: 5, color: '#F87171' },
    { name: 'Very Negative', value: 2, color: '#EF4444' }
  ];

  // Communication effectiveness data
  const communicationData = [
    { metric: 'Understanding Rate', current: 94, previous: 91, trend: 'up' },
    { metric: 'Follow-through Rate', current: 87, previous: 89, trend: 'down' },
    { metric: 'Satisfaction Score', current: 4.6, previous: 4.4, trend: 'up' },
    { metric: 'Completion Rate', current: 92, previous: 88, trend: 'up' }
  ];

  // Diagnostic patterns
  const diagnosticPatterns = [
    { condition: 'Common Cold', frequency: 156, accuracy: 96 },
    { condition: 'Anxiety Disorder', frequency: 134, accuracy: 89 },
    { condition: 'Migraine', frequency: 98, accuracy: 92 },
    { condition: 'Gastritis', frequency: 87, accuracy: 88 },
    { condition: 'Insomnia', frequency: 76, accuracy: 94 },
    { condition: 'Hypertension', frequency: 65, accuracy: 91 }
  ];

  // User activity by hour
  const hourlyActivity = [
    { hour: '00', users: 12 }, { hour: '01', users: 8 }, { hour: '02', users: 5 },
    { hour: '03', users: 3 }, { hour: '04', users: 7 }, { hour: '05', users: 15 },
    { hour: '06', users: 28 }, { hour: '07', users: 45 }, { hour: '08', users: 67 },
    { hour: '09', users: 89 }, { hour: '10', users: 112 }, { hour: '11', users: 98 },
    { hour: '12', users: 134 }, { hour: '13', users: 145 }, { hour: '14', users: 156 },
    { hour: '15', users: 142 }, { hour: '16', users: 128 }, { hour: '17', users: 119 },
    { hour: '18', users: 98 }, { hour: '19', users: 76 }, { hour: '20', users: 65 },
    { hour: '21', users: 54 }, { hour: '22', users: 43 }, { hour: '23', users: 28 }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
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
              <h1 className="text-xl font-bold text-gray-900">AI Health Assistant</h1>
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
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {/* Key Metrics */}
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
                change={8.2}
                icon={Activity} 
                color="green" 
              />
              <StatCard 
                title="Total Conversations" 
                value={dashboardData.totalConversations.toLocaleString()} 
                change={15.7}
                icon={MessageSquare} 
                color="purple" 
              />
              <StatCard 
                title="Avg Session Time" 
                value={dashboardData.avgSessionTime} 
                change={-2.1}
                icon={Clock} 
                color="orange" 
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity by Hour */}
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

              {/* Patient Sentiment */}
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

            {/* Recent Users */}
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
            {/* Search and Filters */}
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

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="New Users Today" value="47" change={23.5} icon={UserPlus} color="green" />
              <StatCard title="Active Sessions" value="234" change={12.1} icon={Activity} color="blue" />
              <StatCard title="User Retention" value="78%" change={5.2} icon={TrendingUp} color="purple" />
            </div>

            {/* Detailed User Table */}
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
                        <td className="py-3 px-4 text-sm text-gray-600">{user.joinedAt.split(' ')[0]}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{Math.floor(Math.random() * 50) + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{Math.floor(Math.random() * 15) + 3} min</td>
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
            {/* Symptom Trends */}
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

            {/* Communication Effectiveness */}
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

            {/* Diagnostic Patterns */}
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
            {/* Key Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Brain className="w-6 h-6 mr-2" />
                  <h3 className="font-semibold">Mental Health Alert</h3>
                </div>
                <p className="text-sm opacity-90 mb-2">Increased anxiety-related conversations by 23% this week</p>
                <button className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30">
                  View Details
                </button>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <h3 className="font-semibold">Outbreak Detection</h3>
                </div>
                <p className="text-sm opacity-90 mb-2">Respiratory symptoms cluster detected in urban areas</p>
                <button className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30">
                  View Details
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Heart className="w-6 h-6 mr-2" />
                  <h3 className="font-semibold">Health Literacy</h3>
                </div>
                <p className="text-sm opacity-90 mb-2">92% patient understanding rate - above target</p>
                <button className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30">
                  View Details
                </button>
              </div>
            </div>

            {/* AI Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Model Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Response Quality Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Relevance</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                        </div>
                        <span className="text-sm font-medium">91%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Empathy Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Safety Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Safe Responses</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                        </div>
                        <span className="text-sm font-medium">99%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Referral Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Detection</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Preferences & Health Literacy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Preference Trends</h3>
                <div className="space-y-4">
                  {[
                    { treatment: 'Natural Remedies', percentage: 68, trend: 'up' },
                    { treatment: 'Prescription Medication', percentage: 45, trend: 'down' },
                    { treatment: 'Lifestyle Changes', percentage: 78, trend: 'up' },
                    { treatment: 'Telemedicine', percentage: 82, trend: 'up' },
                    { treatment: 'Traditional Medicine', percentage: 34, trend: 'stable' }
                  ].map((item, index) => (
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
                  <BarChart data={[
                    { group: '18-25', understanding: 78, engagement: 85 },
                    { group: '26-35', understanding: 82, engagement: 88 },
                    { group: '36-45', understanding: 75, engagement: 79 },
                    { group: '46-55', understanding: 68, engagement: 72 },
                    { group: '56-65', understanding: 62, engagement: 65 },
                    { group: '65+', understanding: 55, engagement: 58 }
                  ]}>
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

            {/* Workflow Optimization Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow & Operational Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">4.2 min</div>
                  <div className="text-sm font-medium text-gray-700">Avg Response Time</div>
                  <div className="text-xs text-gray-500 mt-1">↓ 15% from last month</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">92%</div>
                  <div className="text-sm font-medium text-gray-700">Session Completion</div>
                  <div className="text-xs text-gray-500 mt-1">↑ 8% from last month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">3.2%</div>
                  <div className="text-sm font-medium text-gray-700">Drop-off Rate</div>
                  <div className="text-xs text-gray-500 mt-1">↓ 22% from last month</div>
                </div>
              </div>
            </div>

            {/* Real-time Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Health Alerts</h3>
              <div className="space-y-3">
                {[
                  {
                    type: 'warning',
                    title: 'Unusual Symptom Pattern Detected',
                    description: 'Spike in respiratory symptoms in downtown area',
                    time: '2 minutes ago',
                    severity: 'medium'
                  },
                  {
                    type: 'info',
                    title: 'Mental Health Trend',
                    description: 'Increased stress-related conversations during evening hours',
                    time: '15 minutes ago',
                    severity: 'low'
                  },
                  {
                    type: 'success',
                    title: 'Model Performance',
                    description: 'AI accuracy rate improved to 94.2%',
                    time: '1 hour ago',
                    severity: 'low'
                  },
                  {
                    type: 'alert',
                    title: 'High-Risk Patient Identified',
                    description: 'Patient showing signs requiring immediate medical attention',
                    time: '2 hours ago',
                    severity: 'high'
                  }
                ].map((alert, index) => (
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
                      <div className="text-xs text-gray-500 mt-2">{alert.time}</div>
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