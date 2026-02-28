import React, { useState, useEffect } from "react";
import api from "../../api/api";

const TaskDashboard = ({ refreshKey, sidebarCollapsed = false }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOverdue, setShowOverdue] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks/dashboard/');
      if (response.data.success) {
        setDashboardData(response.data);
      } else {
        setError(response.data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching task dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  // Calculate left margin based on sidebar state
  const leftMargin = sidebarCollapsed ? 'ml-[60px]' : 'ml-[140px]';

  if (loading) {
    return (
      <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue1/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-tasks absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-8">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshDashboard}
              className="px-4 py-2 bg-blue2 text-white rounded-lg hover:bg-blue1 transition-colors"
            >
              <i className="fas fa-redo mr-2"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-8">
            <i className="fas fa-exclamation-circle text-yellow-500 text-3xl mb-3"></i>
            <p className="text-gray-600">No dashboard data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, users_tasks, upcoming_tasks, recent_completed, updated_at } = dashboardData;

  // Calculate completion percentage
  const completionPercentage = stats.total > 0 ? 
    Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
      <div className="space-y-6">
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue2 flex items-center justify-center">
                <i className="fas fa-tasks text-lg"></i>
              </div>
              {stats.overdue > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-600">
                  {stats.overdue} overdue
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue1 to-blue2 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className={`p-5 rounded-xl border transition-colors ${
            stats.overdue > 0 
              ? 'bg-red-50 border-red-200 hover:border-red-300' 
              : 'bg-white border-gray-200 hover:border-blue2/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stats.overdue > 0 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-50 text-green-600'
              }`}>
                <i className={`fas ${stats.overdue > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'} text-lg`}></i>
              </div>
              <button
                onClick={() => setShowOverdue(!showOverdue)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                {showOverdue ? 'Hide' : 'View'}
              </button>
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              stats.overdue > 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {stats.overdue}
            </div>
            <div className="text-sm text-gray-600">Overdue Tasks</div>
            {stats.overdue > 0 && (
              <div className="mt-2 text-xs text-red-600">
                <i className="fas fa-clock mr-1"></i>
                Requires immediate attention
              </div>
            )}
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <i className="fas fa-spinner text-lg"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.in_progress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="mt-2 text-xs text-gray-500">
              <i className="fas fa-user-clock mr-1"></i>
              Active work in progress
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue2 flex items-center justify-center">
                <i className="fas fa-calendar-alt text-lg"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{upcoming_tasks}</div>
            <div className="text-sm text-gray-600">Due in 7 Days</div>
            <div className="mt-2 text-xs text-gray-500">
              <i className="fas fa-hourglass-half mr-1"></i>
              Approaching deadlines
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-flag text-blue2"></i>
            Priority Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* High Priority */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-700">High Priority</span>
                <span className="text-lg font-bold text-red-600">{stats.high_priority}</span>
              </div>
              <div className="text-xs text-red-600">
                <i className="fas fa-exclamation-circle mr-1"></i>
                Critical tasks requiring immediate attention
              </div>
            </div>

            {/* Medium Priority */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-yellow-700">Medium Priority</span>
                <span className="text-lg font-bold text-yellow-600">{stats.medium_priority}</span>
              </div>
              <div className="text-xs text-yellow-600">
                <i className="fas fa-clock mr-1"></i>
                Important tasks with some flexibility
              </div>
            </div>

            {/* Low Priority */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-700">Low Priority</span>
                <span className="text-lg font-bold text-green-600">{stats.low_priority}</span>
              </div>
              <div className="text-xs text-green-600">
                <i className="fas fa-check-circle mr-1"></i>
                Tasks that can be completed later
              </div>
            </div>
          </div>
        </div>

        {/* User Task Distribution */}
        {Object.keys(users_tasks).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <i className="fas fa-users text-blue2"></i>
                Task Distribution by User
              </h3>
              <div className="text-xs text-gray-500">
                Updated: {new Date(updated_at).toLocaleTimeString()}
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries(users_tasks).map(([username, userStats]) => {
                const userCompletion = userStats.total > 0 ? 
                  Math.round((userStats.completed / userStats.total) * 100) : 0;
                
                return (
                  <div key={username} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-sm font-semibold flex items-center justify-center">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{username}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{userStats.total} tasks</div>
                        <div className="text-xs text-gray-500">
                          {userStats.completed} completed • {userStats.overdue} overdue
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion Rate</span>
                        <span>{userCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            userCompletion >= 80 ? 'bg-green-500' :
                            userCompletion >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${userCompletion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl border border-blue-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-bolt text-blue2"></i>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshDashboard}
              className="px-4 py-2 bg-white border border-blue2 text-blue2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-redo"></i>
              Refresh Dashboard
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-arrow-up"></i>
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;