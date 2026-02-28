import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../api/api";

const NotificationsPage = ({ sidebarCollapsed = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data for notifications (in real app, this would come from API)
  const mockNotifications = [
    {
      id: 1,
      title: "Task Due Soon",
      message: "Follow up with TechCorp Inc is due in 45 minutes",
      type: "task",
      priority: "high",
      taskId: 101,
      dueTime: "2024-05-24T14:30:00",
      isRead: false,
      createdAt: "2024-05-24T13:45:00"
    },
    {
      id: 2,
      title: "Inventory Alert",
      message: "Ball Bearings stock is low (12 units remaining)",
      type: "inventory",
      priority: "medium",
      itemId: 1,
      isRead: false,
      createdAt: "2024-05-24T12:20:00"
    },
    {
      id: 3,
      title: "Meeting Reminder",
      message: "Client meeting with Global Logistics in 30 minutes",
      type: "meeting",
      priority: "high",
      meetingId: 45,
      dueTime: "2024-05-24T14:00:00",
      isRead: true,
      createdAt: "2024-05-24T13:30:00"
    },
    {
      id: 4,
      title: "Invoice Overdue",
      message: "Invoice INV-2024-045 is 3 days overdue",
      type: "invoice",
      priority: "medium",
      invoiceId: 2024045,
      isRead: false,
      createdAt: "2024-05-24T11:15:00"
    },
    {
      id: 5,
      title: "Task Completed",
      message: "Sarah Johnson completed 'Prepare Q2 Report'",
      type: "task_completed",
      priority: "low",
      taskId: 98,
      isRead: true,
      createdAt: "2024-05-24T10:45:00"
    },
    {
      id: 6,
      title: "Task Due Soon",
      message: "Send proposal to MediHealth Systems is due in 15 minutes",
      type: "task",
      priority: "high",
      taskId: 102,
      dueTime: "2024-05-24T14:15:00",
      isRead: false,
      createdAt: "2024-05-24T14:00:00"
    },
    {
      id: 7,
      title: "New Lead Added",
      message: "Michael Chen added a new lead: EduTech Solutions",
      type: "lead",
      priority: "low",
      leadId: 256,
      isRead: true,
      createdAt: "2024-05-24T09:30:00"
    },
    {
      id: 8,
      title: "Task Due Soon",
      message: "Call back potential client is due in 25 minutes",
      type: "task",
      priority: "high",
      taskId: 103,
      dueTime: "2024-05-24T14:25:00",
      isRead: false,
      createdAt: "2024-05-24T14:00:00"
    }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // In real app: const response = await api.get('/notifications/');
      // For now using mock data
      setNotifications(mockNotifications);
      
      // Calculate unread count
      const unread = mockNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // In real app: await api.patch(`/notifications/${notificationId}/read/`);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In real app: await api.post('/notifications/mark-all-read/');
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // In real app: await api.delete(`/notifications/${notificationId}/`);
      
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue2 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'task': return 'fas fa-tasks';
      case 'task_completed': return 'fas fa-check-circle';
      case 'inventory': return 'fas fa-boxes';
      case 'meeting': return 'fas fa-calendar-alt';
      case 'invoice': return 'fas fa-file-invoice';
      case 'lead': return 'fas fa-user-plus';
      default: return 'fas fa-bell';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, 'MMM d');
  };

  const getDueTime = (dueTime) => {
    if (!dueTime) return null;
    const due = new Date(dueTime);
    const now = new Date();
    const diffMs = due - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins <= 0) return 'Overdue';
    if (diffMins <= 60) return `Due in ${diffMins} minutes`;
    return `Due at ${format(due, 'h:mm a')}`;
  };

  // Filter tasks due in the next hour
  const tasksDueSoon = notifications.filter(notif => 
    notif.type === 'task' && 
    notif.dueTime && 
    new Date(notif.dueTime) > new Date() && 
    (new Date(notif.dueTime) - new Date()) <= 60 * 60 * 1000 // Within 1 hour
  );

  const leftMargin = sidebarCollapsed ? 'ml-[60px]' : 'ml-[140px]';

  return (
    <div className={`${leftMargin} mr-14 mt-20 transition-all duration-300 min-h-screen bg-gray-50`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Stay updated with your tasks and alerts</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-blue2 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Notifications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{unreadCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <i className="fas fa-bell text-blue2 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Due Soon</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{tasksDueSoon.length}</h3>
                <p className="text-xs text-gray-500 mt-1">Within next hour</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <i className="fas fa-clock text-red-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <i className="fas fa-history text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Notifications List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Notifications</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue2 mb-3"></div>
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-bell-slash text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    const dueTime = getDueTime(notification.dueTime);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            notification.isRead 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-gradient-to-br from-blue1 to-blue2 text-white'
                          }`}>
                            <i className={`${getTypeIcon(notification.type)} text-sm`}></i>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                {dueTime && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    dueTime === 'Overdue' 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {dueTime}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority} priority
                              </span>
                              {!notification.isRead && (
                                <span className="text-xs text-blue2 font-medium">New</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                                title="Mark as read"
                              >
                                <i className="fas fa-check text-xs"></i>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                              title="Delete"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Tasks Due Soon Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Tasks Due Soon</h2>
                  <span className="text-xs text-gray-500">Next hour</span>
                </div>
              </div>
              
              <div className="p-4">
                {tasksDueSoon.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-check text-green-600 text-lg"></i>
                    </div>
                    <p className="text-gray-600">No tasks due in the next hour</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasksDueSoon.map(task => {
                      const dueInMins = Math.floor((new Date(task.dueTime) - new Date()) / 60000);
                      
                      return (
                        <div
                          key={task.id}
                          className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-clock text-xs"></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
                                <span className="text-xs font-bold text-red-600">
                                  {dueInMins}m
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{task.message}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-white border border-red-200 text-red-600 rounded">
                                  Urgent
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">High Priority</span>
                      <span className="font-medium text-gray-900">
                        {notifications.filter(n => n.priority === 'high').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Medium Priority</span>
                      <span className="font-medium text-gray-900">
                        {notifications.filter(n => n.priority === 'medium').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Low Priority</span>
                      <span className="font-medium text-gray-900">
                        {notifications.filter(n => n.priority === 'low').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;