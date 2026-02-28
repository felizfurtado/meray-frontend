import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const TaskViewEditModal = ({ 
  open, 
  onClose, 
  taskId, 
  schema, 
  refetchTasks 
}) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'comments'
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!taskId || !open) return;

    setLoading(true);
    api
      .get(`/tasks/${taskId}/`)
      .then((res) => {
        console.log("Task detail response:", res.data);
        setTask(res.data);
      })
      .catch(err => console.error("Failed to fetch task:", err))
      .finally(() => setLoading(false));
  }, [taskId, open]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const response = await api.post(`/tasks/${taskId}/add-comment/`, {
        comment: newComment.trim()
      });

      if (response.data.success) {
        // Refresh task data to get updated comments
        const taskRes = await api.get(`/tasks/${taskId}/`);
        setTask(taskRes.data);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api.delete(`/tasks/${taskId}/delete-comment/${commentId}/`);
      
      // Refresh task data
      const taskRes = await api.get(`/tasks/${taskId}/`);
      setTask(taskRes.data);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!open) return null;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Task Details"
      className="animate-slideInRight"
      width="max-w-4xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue1/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-tasks absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading task details…</p>
          </div>
        </div>
      ) : task ? (
        <>
          {/* Task Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue2/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                    task.priority === 'high' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    task.priority === 'medium' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                    'bg-gradient-to-br from-green-500 to-green-600'
                  } text-white`}>
                    <i className={`fas ${
                      task.status === 'done' ? 'fa-check' :
                      task.status === 'in_progress' ? 'fa-spinner fa-spin' :
                      task.status === 'blocked' ? 'fa-ban' :
                      'fa-clipboard-check'
                    }`}></i>
                  </div>
                  {task.is_overdue && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-red-600 to-red-700 rounded-full border-2 border-white flex items-center justify-center">
                      <i className="fas fa-exclamation text-xs text-white"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {task.title || "Untitled Task"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                      <i className={`fas ${
                        task.priority === 'high' ? 'fa-arrow-up' :
                        task.priority === 'medium' ? 'fa-minus' :
                        'fa-arrow-down'
                      }`}></i>
                      {task.priority_display || task.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                      <i className={`fas ${
                        task.status === 'done' ? 'fa-check-circle' :
                        task.status === 'in_progress' ? 'fa-spinner fa-spin' :
                        task.status === 'blocked' ? 'fa-ban' :
                        'fa-circle'
                      }`}></i>
                      {task.status_display || task.status}
                    </span>
                    {task.tags && task.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue2 border border-blue-200">
                        <i className="fas fa-tag text-xs"></i>
                        {tag}
                      </span>
                    ))}
                    {task.is_overdue && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                        <i className="fas fa-exclamation-triangle"></i>
                        Overdue ({task.days_overdue} days)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="md:ml-auto flex gap-2">
                {task.status !== 'done' && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                      api.patch(`/tasks/${taskId}/update/`, { status: 'done' })
                        .then(() => {
                          if (refetchTasks) refetchTasks();
                          // Refresh task data
                          api.get(`/tasks/${taskId}/`).then(res => setTask(res.data));
                        })
                        .catch(err => console.error("Failed to mark as done:", err));
                    }}
                  >
                    <i className="fas fa-check"></i>
                    Mark as Done
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Task Details
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'comments'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-comments mr-2"></i>
                Comments
                {task.comments && task.comments.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                    {task.comments.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Task Description */}
              {task.description && (
                <Section title="Description" icon="fas fa-align-left">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {task.description}
                    </div>
                  </div>
                </Section>
              )}

              {/* Task Information Grid */}
              <Section title="Task Information" icon="fas fa-tasks">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assigned To */}
                  <InfoCard
                    label="Assigned To"
                    value={task.assigned_to?.username || "Unassigned"}
                    icon="fas fa-user"
                    badge
                    badgeColor="blue"
                  />

                  {/* Created By */}
                  <InfoCard
                    label="Created By"
                    value={task.created_by?.username || "System"}
                    icon="fas fa-user-plus"
                  />

                  {/* Due Date */}
                  <InfoCard
                    label="Due Date"
                    value={formatDate(task.due_date)}
                    icon="fas fa-calendar-alt"
                    badgeColor={task.is_overdue ? 'red' : 'green'}
                  />

                  {/* Completed Date */}
                  {task.completed_date && (
                    <InfoCard
                      label="Completed Date"
                      value={formatDate(task.completed_date)}
                      icon="fas fa-check-circle"
                      badgeColor="green"
                    />
                  )}

                  {/* Days Info */}
                  {task.is_overdue ? (
                    <InfoCard
                      label="Days Overdue"
                      value={`${task.days_overdue} days`}
                      icon="fas fa-exclamation-triangle"
                      badgeColor="red"
                    />
                  ) : task.days_until_due !== null && task.status !== 'done' && (
                    <InfoCard
                      label="Days Until Due"
                      value={`${task.days_until_due} days`}
                      icon="fas fa-clock"
                      badgeColor={task.days_until_due <= 3 ? 'amber' : 'green'}
                    />
                  )}

                  {/* Recurring Info */}
                  {task.recurring && (
                    <InfoCard
                      label="Recurring"
                      value={task.recurrence_pattern ? `${task.recurrence_pattern.charAt(0).toUpperCase() + task.recurrence_pattern.slice(1)}` : "Yes"}
                      icon="fas fa-redo"
                      badge
                      badgeColor="purple"
                    />
                  )}

                  {/* Next Due Date (for recurring) */}
                  {task.recurring && task.next_due_date && (
                    <InfoCard
                      label="Next Due Date"
                      value={formatDate(task.next_due_date)}
                      icon="fas fa-calendar-plus"
                    />
                  )}
                </div>
              </Section>

              {/* Related Object */}
              {task.related_info && (
                <Section title="Related To" icon="fas fa-link">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        task.related_info.type === 'lead' ? 'bg-blue-100 text-blue2' :
                        task.related_info.type === 'customer' ? 'bg-green-100 text-green-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        <i className={`fas ${
                          task.related_info.type === 'lead' ? 'fa-user' :
                          task.related_info.type === 'customer' ? 'fa-building' :
                          'fa-file-invoice-dollar'
                        }`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {task.related_info.type === 'lead' && task.related_info.name}
                          {task.related_info.type === 'customer' && task.related_info.name}
                          {task.related_info.type === 'invoice' && `Invoice ${task.related_info.number}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {task.related_info.type === 'lead' && task.related_info.company}
                          {task.related_info.type === 'customer' && task.related_info.customer_name}
                          {task.related_info.type === 'invoice' && `Amount: AED ${task.related_info.total}`}
                        </div>
                        {task.related_info.type === 'invoice' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Status: {task.related_info.status}
                          </div>
                        )}
                      </div>
                      <button
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue2 rounded-lg hover:bg-blue-100 transition-colors"
                        onClick={() => {
                          // Navigate to related object
                          if (task.related_info.type === 'lead') {
                            window.open(`/leads/${task.related_info.id}`, '_blank');
                          } else if (task.related_info.type === 'customer') {
                            window.open(`/customers/${task.related_info.id}`, '_blank');
                          } else if (task.related_info.type === 'invoice') {
                            window.open(`/invoices/${task.related_info.id}`, '_blank');
                          }
                        }}
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>
                        View
                      </button>
                    </div>
                  </div>
                </Section>
              )}

              {/* System Information */}
              <Section title="System Information" icon="fas fa-database">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.created_at && (
                    <InfoCard
                      label="Created At"
                      value={formatDate(task.created_at)}
                      icon="fas fa-calendar-plus"
                    />
                  )}
                  {task.updated_at && (
                    <InfoCard
                      label="Last Updated"
                      value={formatDate(task.updated_at)}
                      icon="fas fa-calendar-check"
                    />
                  )}
                </div>
              </Section>
            </div>
          ) : (
            /* Comments Tab */
            <div className="space-y-6">
              {/* Add Comment */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Add a Comment</h4>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment here..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-blue1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-paper-plane"></i>
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-comments text-blue2"></i>
                  Comments ({task.comments ? task.comments.length : 0})
                </h4>
                
                {task.comments && task.comments.length > 0 ? (
                  <div className="space-y-3">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-xs font-semibold flex items-center justify-center">
                              {comment.user_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {comment.user_name || "User"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Delete comment"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                          {comment.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-comment-slash text-2xl text-gray-400"></i>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Comments Yet</h4>
                    <p className="text-gray-600">Be the first to add a comment!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-gray-600">Task not found</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-blue1 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </ViewEditModal>
  );
};

/* -------------------- */
/* UI Components        */
/* -------------------- */

const Section = ({ title, icon, children, description }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <i className={`${icon} text-blue2 text-lg`}></i>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {description && (
      <p className="text-sm text-gray-600 -mt-2">{description}</p>
    )}
    {children}
  </div>
);

const InfoCard = ({ label, value, icon, link = null, badge = false, badgeColor = 'gray' }) => {
  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-green-100 text-green-800 border border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    amber: 'bg-amber-100 text-amber-800 border border-amber-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200'
  };

  const content = (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue2/30 transition-colors h-full">
      <div className="flex items-center gap-2 mb-2">
        {icon && <i className={`${icon} text-blue2 text-sm`}></i>}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      
      {badge ? (
        <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${badgeColors[badgeColor] || badgeColors.gray}`}>
          {value}
        </span>
      ) : link ? (
        <a
          href={link}
          target={link?.startsWith('http') ? "_blank" : undefined}
          rel={link?.startsWith('http') ? "noopener noreferrer" : undefined}
          className="text-base font-medium text-blue2 hover:text-blue1 hover:underline block truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
          {link?.startsWith('http') && <i className="fas fa-external-link-alt text-xs ml-1"></i>}
        </a>
      ) : (
        <div className="text-base font-medium text-gray-900 break-words">
          {value}
        </div>
      )}
    </div>
  );

  return content;
};

export default TaskViewEditModal;