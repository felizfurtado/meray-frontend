import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import TasksTable from "../components/tasks/TasksTable";
import TaskAddModal from "../components/tasks/TaskAddModal";
import api from "../api/api";

const Tasks = ({ sidebarCollapsed = false }) => {

  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  /* =======================
     FETCH DATA
  ======================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const tasksRes = await api.get("/tasks/");
      setTasks(tasksRes.data?.tasks || []);

      const leadsRes = await api.get("leads/list/");
      setLeads(leadsRes.data?.leads || []);

      const usersRes = await api.get("/users/");
      setUsers(usersRes.data?.users || usersRes.data || []);

    } catch (err) {
      console.error("Failed to fetch data", err);
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
     TASK STATS
  ======================= */

  const taskStats = [
    {
      label: "To Do",
      value: tasks.filter(
        t => t.status === "todo" || t.status === "open"
      ).length,
      color: "bg-blue-400"
    },
    {
      label: "In Progress",
      value: tasks.filter(
        t => t.status === "in_progress"
      ).length,
      color: "bg-yellow-400"
    },
    {
      label: "Completed",
      value: tasks.filter(
        t => t.status === "completed" || t.status === "done"
      ).length,
      color: "bg-green-400"
    },
    {
      label: "Overdue",
      value: tasks.filter(t => {
        if (t.status === "completed" || t.status === "done") return false;
        if (!t.due_date) return false;

        const dueDate = new Date(t.due_date);
        const today = new Date();
        today.setHours(0,0,0,0);

        return dueDate < today;
      }).length,
      color: "bg-red-400"
    }
  ];

  // const leftMargin = sidebarCollapsed ? "ml-[60px]" : "ml-[140px]";

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

      <br />

      <div className={` `}>

        <div className="">

          <TasksTable
            tasks={tasks}
            leads={leads}
            users={users}
            loading={loading}
            sidebarCollapsed={sidebarCollapsed}
            refetchTasks={fetchData}
          />

          <br />

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