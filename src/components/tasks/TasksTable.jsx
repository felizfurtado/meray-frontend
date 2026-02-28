import React, { useState } from "react";
import Table from "../layout/Table";
import TaskViewEditModal from "./TaskViewEditModal";
import TaskEditModal from "./TaskEditModal";
import TaskAddModal from "./TaskAddModal";
import api from "../../api/api";

const TasksTable = ({
  tasks = [],
  loading = false,
  sidebarCollapsed = false,
  schema = null,
  refetchTasks,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const openTaskView = (row) => {
    if (!row?.id) return;
    setSelectedTask(row.id);
    setOpenViewModal(true);
  };

  const handleEditTask = (row) => {
    if (!row?.id) return;
    setSelectedTask(row.id);
    setOpenEditModal(true);
  };

  const handleDeleteTask = async (row) => {
    if (!row?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${row.id}/delete/`);
      
      setSelectedTask(null);
      setOpenViewModal(false);
      alert(`Task "${row.title}" deleted successfully`);
      
      if (refetchTasks) {
        refetchTasks();
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete task: " + (err.response?.data?.error || err.message));
    }
  };

  const getColumns = () => {
   const columns = [
  // 1. TASK TITLE column - Compact
  {
    field: "title",
    header: "Task",
    sortable: true,
    width: "200px",
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
            row.priority === 'high' ? 'bg-red-100 text-red-600' :
            row.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
            'bg-green-100 text-green-600'
          }`}>
            <i className={`fas ${
              row.status === 'done' ? 'fa-check' :
              row.status === 'in_progress' ? 'fa-spinner' :
              row.status === 'blocked' ? 'fa-ban' :
              'fa-clipboard-check'
            } text-xs`}></i>
          </div>
          {row.is_overdue && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white">
              <i className="fas fa-exclamation text-[8px]"></i>
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="font-medium text-gray-900 text-sm truncate">
            {value || "Untitled Task"}
          </div>
          {row.tags && row.tags.length > 0 && (
            <div className="mt-0.5">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue2">
                {row.tags[0]}
                {row.tags.length > 1 && (
                  <span className="text-gray-500 ml-0.5">+{row.tags.length - 1}</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
  },

  // 2. ASSIGNED TO column - Compact
  {
    field: "assigned_to_name",
    header: "Assigned To",
    sortable: true,
    width: "120px",
    render: (value) => (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-blue2/10 text-blue2 text-xs font-medium flex items-center justify-center">
          {value?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <span className="text-sm text-gray-900 truncate">
          {value || "Unassigned"}
        </span>
      </div>
    ),
  },

  // 3. RELATED TO column - Compact
  {
    field: "related_to",
    header: "Related To",
    sortable: false,
    width: "120px",
    render: (value, row) => (
      <div className="flex items-center gap-1.5">
        {row.related_info ? (
          <>
            {row.related_info.type === 'lead' && (
              <i className="fas fa-user text-blue2 text-xs"></i>
            )}
            {row.related_info.type === 'customer' && (
              <i className="fas fa-building text-green-600 text-xs"></i>
            )}
            {row.related_info.type === 'invoice' && (
              <i className="fas fa-file-invoice-dollar text-amber-600 text-xs"></i>
            )}
            <span className="text-xs text-gray-700 truncate">
              {value}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-500 italic">-</span>
        )}
      </div>
    ),
  },

  // 4. DUE DATE column - Compact
  {
    field: "due_date",
    header: "Due Date",
    sortable: true,
    width: "120px",
    render: (value, row) => (
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${
          row.is_overdue ? 'text-red-600' :
          row.status === 'done' ? 'text-green-600' :
          'text-gray-900'
        }`}>
          {formatDate(value)}
        </span>
        {row.is_overdue && (
          <span className="text-xs text-red-500 font-medium">
            {row.days_overdue}d overdue
          </span>
        )}
        {row.days_until_due !== null && row.status !== 'done' && !row.is_overdue && (
          <span className="text-xs text-gray-500">
            {row.days_until_due}d left
          </span>
        )}
      </div>
    ),
  },

  // 5. STATUS column - Compact
  {
    field: "status",
    header: "Status",
    sortable: true,
    width: "100px",
    render: (value) => {
      const statusConfigs = {
        "todo": { 
          bg: "bg-gray-100", 
          text: "text-gray-700", 
          border: "border-gray-200", 
          icon: "fas fa-circle",
          label: "To Do"
        },
        "in_progress": { 
          bg: "bg-blue-50", 
          text: "text-blue2", 
          border: "border-blue-200", 
          icon: "fas fa-spinner fa-spin",
          label: "In Progress"
        },
        "done": { 
          bg: "bg-green-50", 
          text: "text-green-700", 
          border: "border-green-200", 
          icon: "fas fa-check-circle",
          label: "Done"
        },
        "blocked": { 
          bg: "bg-red-50", 
          text: "text-red-700", 
          border: "border-red-200", 
          icon: "fas fa-ban",
          label: "Blocked"
        },
        "cancelled": { 
          bg: "bg-gray-100", 
          text: "text-gray-500", 
          border: "border-gray-200", 
          icon: "fas fa-times-circle",
          label: "Cancelled"
        },
      };

      const config = statusConfigs[value] || { 
        bg: "bg-gray-100", 
        text: "text-gray-600", 
        border: "border-gray-200", 
        icon: "fas fa-circle",
        label: value
      };

      return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.border} ${config.bg}`}>
          <i className={`${config.icon} ${config.text} text-xs`}></i>
          <span className={`font-medium text-xs ${config.text}`}>
            {config.label}
          </span>
        </div>
      );
    },
  },

  // 6. PRIORITY column - Compact
  {
    field: "priority",
    header: "Priority",
    sortable: true,
    width: "80px",
    render: (value) => {
      const priorityConfigs = {
        "high": { 
          bg: "bg-red-100", 
          text: "text-red-700", 
          border: "border-red-200", 
          icon: "fas fa-arrow-up"
        },
        "medium": { 
          bg: "bg-amber-100", 
          text: "text-amber-700", 
          border: "border-amber-200", 
          icon: "fas fa-minus"
        },
        "low": { 
          bg: "bg-green-100", 
          text: "text-green-700", 
          border: "border-green-200", 
          icon: "fas fa-arrow-down"
        },
      };

      const config = priorityConfigs[value] || { 
        bg: "bg-gray-100", 
        text: "text-gray-600", 
        border: "border-gray-200", 
          icon: "fas fa-circle"
      };

      return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.border} ${config.bg}`}>
          <i className={`${config.icon} ${config.text} text-xs`}></i>
          <span className={`font-medium text-xs ${config.text}`}>
            {value?.charAt(0).toUpperCase() || "-"}
          </span>
        </div>
      );
    },
  },

  // 7. ACTIONS column - Compact (Only View, Edit, Delete buttons)
  {
    header: "Actions",
    field: "actions",
    type: "actions",
    width: "120px",
    render: (value, row) => (
      <div className="flex items-center gap-1.5">
        {/* View Button */}
        <button
          className="w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
          title="View Details"
          onClick={(e) => {
            e.stopPropagation();
            openTaskView(row);
          }}
        >
          <i className="fas fa-eye text-xs"></i>
        </button>
        
        {/* Edit Button */}
        <button
          className="w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
          title="Edit Task"
          onClick={(e) => {
            e.stopPropagation();
            handleEditTask(row);
          }}
        >
          <i className="fas fa-edit text-xs"></i>
        </button>
        
        {/* Delete Button */}
        <button
          className="w-7 h-7 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 flex items-center justify-center transition-colors"
          title="Delete Task"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTask(row);
          }}
        >
          <i className="fas fa-trash text-xs"></i>
        </button>
      </div>
    ),
  },
];
    return columns;
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Table
        title={schema?.name || "Tasks"}
        icon={schema?.icon || "✅"}
        columns={getColumns()}
        data={tasks}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onRowClick={(row) => openTaskView(row)}
        searchPlaceholder="Search tasks by title, description, tags..."
        pageSize={schema?.page_size || 25}
        defaultSort={
          schema?.default_sort || {
            field: "due_date",
            direction: "asc",
          }
        }
        emptyMessage={
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <i className="fas fa-tasks text-2xl text-blue2"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-600 mb-6">Create your first task to get started.</p>
            <button
              onClick={() => setOpenAddModal(true)}
              className="px-4 py-2 bg-blue2 text-white rounded-lg hover:bg-blue1 transition-colors flex items-center gap-2 mx-auto"
            >
              <i className="fas fa-plus"></i>
              Create First Task
            </button>
          </div>
        }
        onAddNew={() => setOpenAddModal(true)}
      />

      {/* Task View Modal */}
      <TaskViewEditModal
        open={openViewModal}
        taskId={selectedTask}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedTask(null);
        }}
        schema={schema}
        refetchTasks={refetchTasks}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        open={openEditModal}
        taskId={selectedTask}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedTask(null);
        }}
        schema={schema}
        refetchTasks={refetchTasks}
        onSuccess={() => {
          console.log("Task updated successfully");
        }}
      />

      {/* Task Add Modal */}
      <TaskAddModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
        }}
        schema={schema}
        refetchTasks={refetchTasks}
        onSuccess={() => {
          console.log("Task created successfully");
        }}
      />
    </>
  );
};

export default TasksTable;