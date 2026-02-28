import React, { useState, useEffect } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const TaskAddModal = ({ 
  open, 
  onClose, 
  schema, 
  refetchTasks,
  onSuccess 
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    related_type: 'none',
    related_lead_id: '',
    related_customer_id: '',
    related_invoice_id: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
    recurring: false,
    recurrence_pattern: '',
    next_due_date: '',
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!open) return;
    
    // Load dropdown data
    Promise.all([
      api.get('/leads/').then(res => setLeads(res.data.leads || [])).catch(() => setLeads([])),
      api.get('/customers/').then(res => setCustomers(res.data.customers || [])).catch(() => setCustomers([])),
      api.get('/invoices/').then(res => setInvoices(res.data.invoices || [])).catch(() => setInvoices([])),
      // You'll need to create a users endpoint or get from localStorage
      // api.get('/users/').then(res => setUsers(res.data || [])).catch(() => setUsers([]))
    ]);
  }, [open]);

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

  // Handle tags
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }
    
    // Validate recurring task
    if (formData.recurring && !formData.recurrence_pattern) {
      newErrors.recurrence_pattern = "Recurrence pattern is required for recurring tasks";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSaving(true);
    try {
      // Prepare data for API
      const submitData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        priority: formData.priority,
        status: formData.status,
        recurring: formData.recurring,
        recurrence_pattern: formData.recurrence_pattern || undefined,
        next_due_date: formData.next_due_date || undefined,
        tags: formData.tags,
        related_type: formData.related_type
      };
      
      // Handle assigned_to
      if (formData.assigned_to) {
        submitData.assigned_to = formData.assigned_to;
      }
      
      // Handle related objects
      if (formData.related_type === 'lead' && formData.related_lead_id) {
        submitData.related_lead_id = formData.related_lead_id;
      } else if (formData.related_type === 'customer' && formData.related_customer_id) {
        submitData.related_customer_id = formData.related_customer_id;
      } else if (formData.related_type === 'invoice' && formData.related_invoice_id) {
        submitData.related_invoice_id = formData.related_invoice_id;
      }
      
      console.log("Creating task with data:", submitData);
      
      const response = await api.post('/tasks/create/', submitData);
      
      console.log("Task created successfully:", response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (refetchTasks) {
        refetchTasks();
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        related_type: 'none',
        related_lead_id: '',
        related_customer_id: '',
        related_invoice_id: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        status: 'todo',
        recurring: false,
        recurrence_pattern: '',
        next_due_date: '',
        tags: [],
      });
      
      onClose();
      
    } catch (err) {
      console.error("Failed to create task:", err);
      
      // Handle validation errors from backend
      if (err.response?.data) {
        if (err.response.data.errors) {
          setErrors(err.response.data.errors);
        } else if (err.response.data.error) {
          setErrors({ general: err.response.data.error });
        } else {
          setErrors({ general: "Failed to create task. Please check your data." });
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
      title="Create New Task"
      className="animate-slideInRight"
      width="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center">
            <i className="fas fa-plus text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-sm text-gray-600">Add a new task to track progress and deadlines</p>
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

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-info-circle text-blue2"></i>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } transition-colors`}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  {errors.title}
                </p>
              )}
            </div>
            
            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 ${
                  errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } transition-colors`}
              />
              {errors.due_date && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  {errors.due_date}
                </p>
              )}
            </div>
            
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter detailed task description"
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors resize-none"
            />
          </div>
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-user-plus text-blue2"></i>
            Assignment
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              placeholder="Enter username (optional)"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
            />
            <p className="text-xs text-gray-500">
              Enter the username of the person responsible for this task
            </p>
          </div>
        </div>

        {/* Related To */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-link text-blue2"></i>
            Link to CRM Entity (Optional)
          </h3>
          
          <div className="space-y-4">
            {/* Related Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Link Task To
              </label>
              <select
                value={formData.related_type}
                onChange={(e) => handleInputChange('related_type', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
              >
                <option value="none">Not Linked</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="invoice">Invoice</option>
              </select>
            </div>
            
            {/* Lead Selection */}
            {formData.related_type === 'lead' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Lead
                </label>
                <select
                  value={formData.related_lead_id}
                  onChange={(e) => handleInputChange('related_lead_id', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                >
                  <option value="">Select a lead...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} - {lead.company}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Customer Selection */}
            {formData.related_type === 'customer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Customer
                </label>
                <select
                  value={formData.related_customer_id}
                  onChange={(e) => handleInputChange('related_customer_id', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                >
                  <option value="">Select a customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name} - {customer.customer_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Invoice Selection */}
            {formData.related_type === 'invoice' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Invoice
                </label>
                <select
                  value={formData.related_invoice_id}
                  onChange={(e) => handleInputChange('related_invoice_id', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                >
                  <option value="">Select an invoice...</option>
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - {invoice.customer_name} (AED {parseFloat(invoice.total).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Recurring Task */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-redo text-blue2"></i>
            Recurring Task (Optional)
          </h3>
          
          <div className="space-y-4">
            {/* Recurring Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => handleInputChange('recurring', e.target.checked)}
                className="w-4 h-4 text-blue2 rounded border-gray-300 focus:ring-blue2 focus:ring-2"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                This is a recurring task
              </label>
            </div>
            
            {/* Recurrence Pattern */}
            {formData.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Recurrence Pattern <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.recurrence_pattern}
                    onChange={(e) => handleInputChange('recurrence_pattern', e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 ${
                      errors.recurrence_pattern ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    } transition-colors`}
                  >
                    <option value="">Select pattern...</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  {errors.recurrence_pattern && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle text-xs"></i>
                      {errors.recurrence_pattern}
                    </p>
                  )}
                </div>
                
                {/* Next Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => handleInputChange('next_due_date', e.target.value)}
                    min={formData.due_date}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
                  />
                  <p className="text-xs text-gray-500">
                    When should the next occurrence be due?
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-tags text-blue2"></i>
            Tags (Optional)
          </h3>
          
          <div className="space-y-3">
            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue2 focus:border-blue2 bg-white transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 text-sm font-medium text-blue2 bg-blue-50 border border-blue2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-plus mr-1"></i> Add
              </button>
            </div>
            
            {/* Tag Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue2 border border-blue-200 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-blue2 hover:text-blue1 ml-1"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <i className="fas fa-lightbulb mr-1"></i>
              Tasks help you track progress and deadlines
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
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </ViewEditModal>
  );
};

export default TaskAddModal;