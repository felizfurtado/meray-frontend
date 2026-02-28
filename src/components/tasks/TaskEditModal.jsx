import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const TaskEditModal = ({ 
  open, 
  onClose, 
  taskId, 
  schema, 
  refetchTasks,
  onSuccess 
}) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!taskId || !open) return;

    setLoading(true);
    
    // Load task data
    api.get(`/tasks/${taskId}/`)
      .then((res) => {
        console.log("Task data for editing:", res.data);
        setTask(res.data);
        
        // Pre-fill form with existing data
        const editableData = {
          title: res.data.title || '',
          description: res.data.description || '',
          due_date: res.data.due_date ? new Date(res.data.due_date).toISOString().split('T')[0] : '',
          priority: res.data.priority || 'medium',
          status: res.data.status || 'todo',
          recurring: res.data.recurring || false,
          recurrence_pattern: res.data.recurrence_pattern || '',
          next_due_date: res.data.next_due_date ? new Date(res.data.next_due_date).toISOString().split('T')[0] : '',
          tags: res.data.tags || [],
        };
        
        // Add assigned user
        if (res.data.assigned_to) {
          editableData.assigned_to = res.data.assigned_to.id;
        }
        
        // Add related object
        editableData.related_type = res.data.related_type || 'none';
        if (res.data.related_lead) {
          editableData.related_lead_id = res.data.related_lead.id;
        }
        if (res.data.related_customer) {
          editableData.related_customer_id = res.data.related_customer.id;
        }
        if (res.data.related_invoice) {
          editableData.related_invoice_id = res.data.related_invoice.id;
        }
        
        setFormData(editableData);
      })
      .catch(err => console.error("Failed to fetch task:", err))
      .finally(() => setLoading(false));
    
    // Load dropdown data
    Promise.all([
      api.get('/leads/').then(res => setLeads(res.data.leads || [])).catch(() => setLeads([])),
      api.get('/customers/').then(res => setCustomers(res.data.customers || [])).catch(() => setCustomers([])),
      api.get('/invoices/').then(res => setInvoices(res.data.invoices || [])).catch(() => setInvoices([])),
      api.get('/users/').then(res => setUsers(res.data || [])).catch(() => setUsers([]))
    ]);
  }, [taskId, open]);

  // Get field configuration
  const getFieldConfig = (field) => {
    if (schema?.field_configs?.[field]) {
      return schema.field_configs[field];
    }
    
    // Default config for task fields
    const defaultConfigs = {
      "title": { 
        type: "string", 
        label: "Task Title", 
        required: true,
        placeholder: "Enter task title"
      },
      "description": { 
        type: "text", 
        label: "Description", 
        required: false,
        placeholder: "Detailed task description",
        rows: 4
      },
      "assigned_to": { 
        type: "select", 
        label: "Assigned To", 
        required: false,
        placeholder: "Select user"
      },
      "related_type": { 
        type: "select", 
        label: "Related To", 
        required: false,
        options: [
          { value: "none", label: "None" },
          { value: "lead", label: "Lead" },
          { value: "customer", label: "Customer" },
          { value: "invoice", label: "Invoice" }
        ]
      },
      "related_lead_id": { 
        type: "select", 
        label: "Select Lead", 
        required: false,
        placeholder: "Choose a lead"
      },
      "related_customer_id": { 
        type: "select", 
        label: "Select Customer", 
        required: false,
        placeholder: "Choose a customer"
      },
      "related_invoice_id": { 
        type: "select", 
        label: "Select Invoice", 
        required: false,
        placeholder: "Choose an invoice"
      },
      "due_date": { 
        type: "date", 
        label: "Due Date", 
        required: true
      },
      "priority": { 
        type: "select", 
        label: "Priority", 
        required: true,
        options: [
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" }
        ]
      },
      "status": { 
        type: "select", 
        label: "Status", 
        required: true,
        options: [
          { value: "todo", label: "To Do" },
          { value: "in_progress", label: "In Progress" },
          { value: "done", label: "Done" },
          { value: "blocked", label: "Blocked" },
          { value: "cancelled", label: "Cancelled" }
        ]
      },
      "recurring": {
        type: "boolean",
        label: "Recurring Task",
        required: false
      },
      "recurrence_pattern": { 
        type: "select", 
        label: "Recurrence Pattern", 
        required: false,
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
          { value: "yearly", label: "Yearly" }
        ]
      },
      "next_due_date": { 
        type: "date", 
        label: "Next Due Date", 
        required: false
      },
      "tags": {
        type: "tags",
        label: "Tags",
        required: false,
        placeholder: "Add tags (press Enter)"
      },
    };
    
    return defaultConfigs[field] || { 
      type: "string", 
      label: field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      required: false
    };
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Clear related fields when changing type
    if (field === 'related_type') {
      setFormData(prev => ({
        ...prev,
        related_lead_id: '',
        related_customer_id: '',
        related_invoice_id: ''
      }));
    }
  };

  // Handle tags input
  const handleTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    const requiredFields = ['title', 'due_date'];
    
    requiredFields.forEach(field => {
      const config = getFieldConfig(field);
      if (config.required && (!formData[field] || formData[field].toString().trim() === '')) {
        newErrors[field] = `${config.label} is required`;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSaving(true);
    try {
      // Prepare data for API
      const submitData = {};
      
      // List of fields to include
      const fieldsToInclude = [
        'title', 'description', 'due_date', 'priority', 'status',
        'recurring', 'recurrence_pattern', 'next_due_date',
        'related_type', 'related_lead_id', 'related_customer_id', 'related_invoice_id'
      ];
      
      fieldsToInclude.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== '') {
          submitData[field] = formData[field];
        }
      });
      
      // Handle assigned_to
      if (formData.assigned_to) {
        submitData.assigned_to = formData.assigned_to;
      } else if (formData.assigned_to === '') {
        submitData.assigned_to = null;
      }
      
      // Handle tags
      if (formData.tags && Array.isArray(formData.tags)) {
        submitData.tags = formData.tags;
      }
      
      // Handle boolean fields
      if (formData.recurring !== undefined) {
        submitData.recurring = Boolean(formData.recurring);
      }
      
      console.log("Submitting update data:", submitData);
      
      const response = await api.patch(`/tasks/${taskId}/update/`, submitData);
      
      console.log("Update successful:", response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (refetchTasks) {
        refetchTasks();
      }
      
      onClose();
      
    } catch (err) {
      console.error("Failed to update task:", err);
      
      // Handle validation errors from backend
      if (err.response?.data) {
        console.log("Backend error response:", err.response.data);
        
        if (err.response.data.errors) {
          setErrors(err.response.data.errors);
        } else if (err.response.data.detail) {
          setErrors({ general: err.response.data.detail });
        } else {
          setErrors({ general: "Failed to update task. Please check your data." });
        }
      } else {
        setErrors({ general: "Network error. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Edit Task"
      className="animate-slideInRight"
      width="max-w-3xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue1/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-tasks absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading task data…</p>
          </div>
        </div>
      ) : task ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center text-lg font-bold">
              <i className="fas fa-tasks"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Task</h1>
              <p className="text-sm text-gray-600">Update task information below</p>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <i className="fas fa-exclamation-circle"></i>
                <span className="font-medium">{errors.general}</span>
              </div>
            </div>
          )}

          {/* TASK INFORMATION */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  } transition-colors`}
                  placeholder="Enter task title"
                  required
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <i className="fas fa-exclamation-circle text-xs"></i>
                    <span>{errors.title}</span>
                  </div>
                )}
              </div>

              {/* Assigned To */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                >
                  <option value="">Select user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors resize-none"
                placeholder="Detailed task description..."
              />
            </div>
          </div>

          {/* TASK PROPERTIES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 ${
                  errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } transition-colors`}
                required
              />
              {errors.due_date && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  <span>{errors.due_date}</span>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                required
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                value={formData.status || 'todo'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                required
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* RELATED OBJECT */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Related To
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related Type */}
              <div className="space-y-1.5">
                <select
                  value={formData.related_type || 'none'}
                  onChange={(e) => handleInputChange('related_type', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                >
                  <option value="none">None</option>
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>

              {/* Related Object Selection */}
              {formData.related_type === 'lead' && (
                <div className="space-y-1.5">
                  <select
                    value={formData.related_lead_id || ''}
                    onChange={(e) => handleInputChange('related_lead_id', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                  >
                    <option value="">Select lead...</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} ({lead.company})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.related_type === 'customer' && (
                <div className="space-y-1.5">
                  <select
                    value={formData.related_customer_id || ''}
                    onChange={(e) => handleInputChange('related_customer_id', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                  >
                    <option value="">Select customer...</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company_name} ({customer.customer_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.related_type === 'invoice' && (
                <div className="space-y-1.5">
                  <select
                    value={formData.related_invoice_id || ''}
                    onChange={(e) => handleInputChange('related_invoice_id', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                  >
                    <option value="">Select invoice...</option>
                    {invoices.map(invoice => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} ({invoice.customer_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* RECURRING TASK */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={!!formData.recurring}
                onChange={(e) => handleInputChange('recurring', e.target.checked)}
                className="w-4 h-4 text-blue2 rounded border-gray-300 focus:ring-blue2 focus:ring-2"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                This is a recurring task
              </label>
            </div>

            {formData.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recurrence Pattern */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Recurrence Pattern
                  </label>
                  <select
                    value={formData.recurrence_pattern || ''}
                    onChange={(e) => handleInputChange('recurrence_pattern', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                  >
                    <option value="">Select pattern...</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Next Due Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_due_date || ''}
                    onChange={(e) => handleInputChange('next_due_date', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* TAGS */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white">
              {formData.tags && formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue2 border border-blue-200">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = [...formData.tags];
                      newTags.splice(index, 1);
                      handleTagsChange(newTags);
                    }}
                    className="text-blue2 hover:text-blue1 ml-1"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag (press Enter)"
                className="flex-1 min-w-[120px] outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const newTags = [...(formData.tags || []), e.target.value.trim()];
                    handleTagsChange(newTags);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Press Enter to add tags
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'Never'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-blue1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
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

export default TaskEditModal;