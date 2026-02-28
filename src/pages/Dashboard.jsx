import React from "react";

const Dashboard = ({ sidebarCollapsed = false }) => {
  // Hardcoded demo data
  const stats = {
    revenue: 1285000,
    leads: 156,
    customers: 89,
    tasks: 42,
    inventoryValue: 245000,
    invoices: 67
  };

  const recentLeads = [
    { id: 1, name: "TechCorp Inc", status: "qualified", value: 85000, probability: "75%", days: 2 },
    { id: 2, name: "Global Logistics", status: "contacted", value: 65000, probability: "60%", days: 1 },
    { id: 3, name: "MediHealth Systems", status: "new", value: 120000, probability: "40%", days: 0 },
    { id: 4, name: "EduTech Solutions", status: "proposal", value: 45000, probability: "80%", days: 3 },
    { id: 5, name: "RetailPlus Group", status: "qualified", value: 95000, probability: "70%", days: 1 }
  ];

  const recentTasks = [
    { id: 1, title: "Follow up with TechCorp", priority: "high", dueDate: "2024-05-24", assignedTo: "Sarah Johnson", status: "in_progress" },
    { id: 2, title: "Prepare Q2 Report", priority: "medium", dueDate: "2024-05-25", assignedTo: "Michael Chen", status: "todo" },
    { id: 3, title: "Client Meeting", priority: "high", dueDate: "2024-05-24", assignedTo: "You", status: "todo" },
    { id: 4, title: "Update Inventory", priority: "low", dueDate: "2024-05-26", assignedTo: "David Wilson", status: "completed" },
    { id: 5, title: "Review Budget", priority: "medium", dueDate: "2024-05-27", assignedTo: "Emma Garcia", status: "in_progress" }
  ];

  const lowStockItems = [
    { id: 1, name: "Ball Bearings", current: 12, minimum: 20, status: "critical" },
    { id: 2, name: "Circuit Breakers", current: 18, minimum: 25, status: "critical" },
    { id: 3, name: "Safety Helmets", current: 28, minimum: 30, status: "warning" },
    { id: 4, name: "Steel Sheets", current: 22, minimum: 25, status: "warning" },
    { id: 5, name: "Drill Machine", current: 2, minimum: 5, status: "critical" }
  ];

  const upcomingTasks = [
    { id: 1, title: "Team Meeting", time: "10:00 AM", duration: "1 hour", type: "meeting" },
    { id: 2, title: "Client Call - TechCorp", time: "2:30 PM", duration: "30 mins", type: "call" },
    { id: 3, title: "Project Review", time: "4:00 PM", duration: "45 mins", type: "review" }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const StatCard = ({ title, value, icon, color, subtext, link, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {title.includes('Revenue') || title.includes('Value') ? formatCurrency(value) : value}
            </h3>
            {trend && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trend.startsWith('+') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
      {link && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a href={link} className="text-sm text-blue2 hover:text-blue1 font-medium flex items-center gap-1">
            View Details
            <i className="fas fa-arrow-right text-xs"></i>
          </a>
        </div>
      )}
    </div>
  );

  const leftMargin = sidebarCollapsed ? 'ml-[60px]' : 'ml-[140px]';

  return (
    <div className={`${leftMargin} mr-14 mt-20 transition-all duration-300 min-h-screen bg-gray-50`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm shadow-sm">
                  Last 30 Days
                </div>
              </div>
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue1 to-blue2 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.revenue}
            icon="fas fa-money-bill-wave"
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtext="Last 30 days"
            trend="+18%"
            link="/reports/revenue"
          />

          <StatCard
            title="Active Leads"
            value={stats.leads}
            icon="fas fa-users"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtext="In pipeline"
            trend="+22%"
            link="/leads"
          />

          <StatCard
            title="Total Customers"
            value={stats.customers}
            icon="fas fa-user-check"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtext="Active accounts"
            trend="+12%"
            link="/customers"
          />

          <StatCard
            title="Pending Tasks"
            value={stats.tasks}
            icon="fas fa-tasks"
            color="bg-gradient-to-br from-amber-500 to-amber-600"
            subtext="Require attention"
            trend="+8%"
            link="/tasks"
          />

          <StatCard
            title="Inventory Value"
            value={stats.inventoryValue}
            icon="fas fa-boxes"
            color="bg-gradient-to-br from-cyan-500 to-cyan-600"
            subtext="Current stock value"
            trend="+5%"
            link="/inventory"
          />

          <StatCard
            title="Pending Invoices"
            value={stats.invoices}
            icon="fas fa-file-invoice"
            color="bg-gradient-to-br from-red-500 to-red-600"
            subtext="Awaiting payment"
            trend="-3%"
            link="/invoices"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                  <p className="text-sm text-gray-600">Newest opportunities in pipeline</p>
                </div>
                <a href="/leads" className="text-sm text-blue2 hover:text-blue1 font-medium">
                  View All →
                </a>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentLeads.map(lead => (
                  <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                          <i className="fas fa-user text-blue2 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lead.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                              lead.status === 'contacted' ? 'bg-blue-100 text-blue2' :
                              lead.status === 'proposal' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {lead.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(lead.value)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{lead.probability}</div>
                        <div className="text-xs text-gray-500">Probability</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                  <p className="text-sm text-gray-600">Latest activities and assignments</p>
                </div>
                <a href="/tasks" className="text-sm text-blue2 hover:text-blue1 font-medium">
                  View All →
                </a>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentTasks.map(task => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue2'
                        }`}>
                          <i className={`fas ${
                            task.status === 'completed' ? 'fa-check-circle' :
                            task.status === 'in_progress' ? 'fa-spinner fa-spin' :
                            'fa-tasks'
                          } text-sm`}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {task.assignedTo}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue2' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'in_progress' ? 'In Progress' : 
                         task.status === 'completed' ? 'Completed' : 'To Do'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Low Stock Alert */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
                    <p className="text-sm text-gray-600">Items need reordering</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {lowStockItems.length} items
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.status === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <i className={`fas ${
                            item.status === 'critical' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'
                          } text-xs`}></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <div className="text-xs text-gray-500">
                            Current: {item.current} • Min: {item.minimum}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xs font-bold ${
                          item.status === 'critical' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {item.current <= item.minimum ? 'Reorder Now' : 'Low Stock'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <a href="/inventory" className="block mt-4 text-center w-full px-4 py-2.5 text-sm font-medium text-blue2 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                  Manage Inventory
                </a>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>
                <p className="text-sm text-gray-600">Today's agenda</p>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        task.type === 'meeting' ? 'bg-blue-100 text-blue2' :
                        task.type === 'call' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <i className={`fas ${
                          task.type === 'meeting' ? 'fa-users' :
                          task.type === 'call' ? 'fa-phone' :
                          'fa-chart-line'
                        } text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            <i className="fas fa-clock mr-1"></i>
                            {task.time}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{task.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <button className="text-sm text-gray-600 hover:text-blue2 flex items-center justify-center gap-1 mx-auto">
                      <i className="fas fa-calendar-plus"></i>
                      Add Event
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-bolt text-blue2"></i>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <a href="/leads/add" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue2 text-white flex items-center justify-center">
                    <i className="fas fa-plus text-sm"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Add New Lead</span>
                </a>
                
                <a href="/tasks/add" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue2 text-white flex items-center justify-center">
                    <i className="fas fa-tasks text-sm"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Create Task</span>
                </a>
                
                <a href="/inventory/add" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue2 text-white flex items-center justify-center">
                    <i className="fas fa-box text-sm"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Add Inventory Item</span>
                </a>
                
                <a href="/reports" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue2 text-white flex items-center justify-center">
                    <i className="fas fa-chart-pie text-sm"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Reports</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <i className="fas fa-trend-up"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                Revenue up 18% this month
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                Lead conversion at 24%
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                92% task completion rate
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                15 new customers this month
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Attention Needed</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-amber-500 text-xs"></i>
                5 items need reordering
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-amber-500 text-xs"></i>
                7 overdue invoices
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-amber-500 text-xs"></i>
                3 urgent tasks pending
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-amber-500 text-xs"></i>
                2 meetings scheduled today
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue2 flex items-center justify-center">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-rocket text-blue2 text-xs"></i>
                Follow up on qualified leads
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-chart-pie text-blue2 text-xs"></i>
                Review monthly reports
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-truck text-blue2 text-xs"></i>
                Place inventory orders
              </li>
              <li className="text-sm text-gray-700 flex items-center gap-2">
                <i className="fas fa-users text-blue2 text-xs"></i>
                Schedule team meeting
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;