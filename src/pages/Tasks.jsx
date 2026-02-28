import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import TasksTable from "../components/tasks/TasksTable";
import TaskAddModal from "../components/tasks/TaskAddModal";
import TaskDashboard from "../components/tasks/TaskDashboard"; // Create this component
import api from "../api/api";

/* =======================
   DEMO FALLBACK DATA
======================= */



/* =======================
   MAIN COMPONENT
======================= */

const Tasks = ({ sidebarCollapsed = false }) => {
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "table"

  /* =======================
     FETCH DATA - FIXED VERSION
  ======================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch tasks
      const tasksRes = await api.get("/tasks/");
      console.log("Tasks response:", tasksRes.data);
      setTasks(tasksRes.data?.tasks || []);

      // Fetch leads
      const leadsRes = await api.get("leads/list/");
      console.log("Leads response:", leadsRes.data);
      setLeads(leadsRes.data?.leads || []);

      // Fetch users
      const usersRes = await api.get("/users/");
      console.log("Users response:", usersRes.data);
      setUsers(usersRes.data?.users || usersRes.data || []);

    } catch (err) {
      console.error("Failed to fetch data. Using demo data.", err);

      // 🔁 FALLBACK TO DEMO DATA
      setTasks(demoTasks);
      setLeads(demoLeads);
      setUsers(demoUsers);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskCreate = async () => {
    await fetchData();
  };

  /* =======================
     TASK STATS - FIXED VERSION
  ======================= */

  const taskStats = [
    {
      label: "To Do",
      value: Array.isArray(tasks) ? tasks.filter(
        t => t.status === "todo" || t.status === "open"
      ).length : 0,
      color: "bg-blue-400"
    },
    {
      label: "In Progress",
      value: Array.isArray(tasks) ? tasks.filter(
        t => t.status === "in_progress"
      ).length : 0,
      color: "bg-yellow-400"
    },
    {
      label: "Completed",
      value: Array.isArray(tasks) ? tasks.filter(
        t => t.status === "completed" || t.status === "done"
      ).length : 0,
      color: "bg-green-400"
    },
    {
      label: "Overdue",
      value: Array.isArray(tasks) ? tasks.filter(t => {
        if (t.status === "completed" || t.status === "done") return false;
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length : 0,
      color: "bg-red-400"
    }
  ];

  /* =======================
     TASK DASHBOARD STATS - For the dashboard view
  ======================= */

  const getDashboardData = () => {
    if (!Array.isArray(tasks)) return null;

    const stats = {
      total: tasks.length,
      overdue: taskStats[3].value,
      completed: taskStats[2].value,
      in_progress: taskStats[1].value,
      todo: taskStats[0].value,
      blocked: tasks.filter(t => t.status === "blocked").length,
      high_priority: tasks.filter(t => t.priority === "high").length,
      medium_priority: tasks.filter(t => t.priority === "medium").length,
      low_priority: tasks.filter(t => t.priority === "low").length,
    };

    // Calculate user distribution
    const users_tasks = {};
    tasks.forEach(task => {
      if (task.assigned_to) {
        const username = typeof task.assigned_to === 'object' 
          ? task.assigned_to.username 
          : task.assigned_to;
        
        if (!users_tasks[username]) {
          users_tasks[username] = { total: 0, overdue: 0, completed: 0 };
        }
        
        users_tasks[username].total++;
        
        // Check if overdue
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate < today && task.status !== 'done' && task.status !== 'completed') {
            users_tasks[username].overdue++;
          }
        }
        
        // Check if completed
        if (task.status === 'done' || task.status === 'completed') {
          users_tasks[username].completed++;
        }
      }
    });

    // Calculate upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming_tasks = tasks.filter(task => {
      if (!task.due_date) return false;
      if (task.status === 'done' || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= nextWeek;
    }).length;

    // Recent completed tasks (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent_completed = tasks.filter(task => {
      if (task.status !== 'done' && task.status !== 'completed') return false;
      if (!task.completed_date) return false;
      const completedDate = new Date(task.completed_date);
      return completedDate >= weekAgo;
    }).length;

    return {
      stats,
      users_tasks,
      upcoming_tasks,
      recent_completed,
      updated_at: new Date().toISOString()
    };
  };

  const dashboardData = getDashboardData();

  /* =======================
     RENDER
  ======================= */

  const leftMargin = sidebarCollapsed ? 'ml-[60px]' : 'ml-[140px]';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Tasks"
        description="Manage all your tasks and track progress"
        icon="fas fa-tasks"
        buttonText="Add Task"
        onButtonClick={() => setAddModalOpen(true)}
        stats={taskStats}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div >
        {/* Tab Navigation */}

        <br></br>
        <div className="">
        
          <div className= {`${leftMargin} mr-14 mt-4  `}>
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "dashboard"
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "table"
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-table mr-2"></i>
                Table View
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {/* Dashboard View */}
            {activeTab === "dashboard" && dashboardData && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                <TaskDashboard 
                  dashboardData={dashboardData} 
                  refreshKey={tasks.length} 
                  onRefresh={fetchData}
                />
              </div>
            )}

            {/* Table View */}
            {activeTab === "table" && (
              <div className=" rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col  ">
                  <TasksTable
                    tasks={tasks}
                    leads={leads}
                    users={users}
                    loading={loading}
                    sidebarCollapsed={sidebarCollapsed}
                    refetchTasks={fetchData}
                    className="flex-1"
                    containerClassName="h-full flex flex-col"
                    tableContainerClassName=""
                    tableWrapperClassName="min-w-full"
                    tableClassName="w-full divide-y divide-gray-200"
                  />

                  <br></br>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleTaskCreate}
        leads={leads}
        users={users}
      />
    </div>
  );
};

export default Tasks;