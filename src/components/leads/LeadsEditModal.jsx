import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const LeadsEditModal = ({ open, onClose, leadId, schema, refetchLeads }) => {
  const [form, setForm] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!open || !leadId) return;

    setLoading(true);
    api.get(`/leads/${leadId}/`)
      .then((res) => {
        const lead = res.data.lead || {};
        setForm({
          ...lead,
          ...(lead.extra_data || {})
        });
        // Ensure notes is always an array
        setNotes(Array.isArray(lead.notes) ? lead.notes : []);
      })
      .catch((err) => {
        console.error("Failed to fetch lead:", err);
        setNotes([]);
      })
      .finally(() => setLoading(false));
  }, [open, leadId]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

    const handleSave = async () => {
      setSaving(true);
      try {
        await api.put(`/leads/${leadId}/update/`, form);
        refetchLeads?.();
        onClose();
      } catch (error) {
        console.error("Failed to save lead:", error);
      } finally {
        setSaving(false);
      }
    };

  /* ------------------ NOTES ------------------ */

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await api.post(
        `/leads/${leadId}/notes/add/`,
        { text: newNote }
      );
      
      // Add the new note to the list
      setNotes((prev) => [...prev, res.data.note]);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setDeletingNoteId(noteId);
    try {
      await api.delete(`/leads/${leadId}/notes/${noteId}/delete/`);
      // Filter out the deleted note
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setDeletingNoteId(null);
    }
  };

  if (!open) return null;

  const leadName = form?.name || form?.company_name || form?.email || "Edit Lead";

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title={`Edit: ${leadName}`}
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue1/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-user-tie absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading lead details…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Lead Info */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue2/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                  {form.name?.charAt(0)?.toUpperCase() || form.company_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-blue2 flex items-center justify-center">
                  <i className="fas fa-pen text-blue2 text-xs"></i>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Editing: {form.name || form.company_name || "Unnamed Lead"}
                </h1>
                <p className="text-sm text-gray-600">
                  Update lead information and notes below
                </p>
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
                Lead Details
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'notes'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-sticky-note mr-2"></i>
                Notes
                {notes.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                    {notes.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Form Fields */}
              <Section title="Lead Information" icon="fas fa-user-tie">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {schema?.fields?.map((field) => {
                    if (field.type === "repeat") return null;

                    return (
                      <EditField
                        key={field.key}
                        field={field}
                        value={form[field.key] ?? ""}
                        onChange={handleChange}
                      />
                    );
                  })}
                </div>
              </Section>

             
            </div>
          ) : (
            /* Notes Tab */
            <div className="space-y-6">
              <Section title="Notes" icon="fas fa-sticky-note">
                {/* Add Note */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Add New Note
                  </label>
                  <div className="flex gap-3">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write a note..."
                      rows={3}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue2/30 focus:border-blue2 resize-none"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                      className="px-5 py-2.5 h-fit bg-gradient-to-r from-blue1 to-blue2 text-white rounded-xl hover:from-blue2 hover:to-blue1 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue1 disabled:hover:to-blue2 flex items-center gap-2"
                    >
                      {addingNote ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          Add Note
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Existing Notes */}
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue2/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue2">
                                {note.user_name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {note.user_name || 'System'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  <i className="fas fa-circle text-[4px] mx-1"></i>
                                  {formatDate(note.created_at)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deletingNoteId === note.id}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingNoteId === note.id ? (
                                  <>
                                    <i className="fas fa-spinner fa-spin text-xs"></i>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-trash-alt text-xs"></i>
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {note.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-sticky-note text-3xl text-blue2"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes</h3>
                    <p className="text-gray-600">No notes have been added for this lead yet.</p>
                  </div>
                )}
              </Section>
            </div>
          )}
        </>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-[10px] font-mono shadow-sm">
              ESC
            </kbd>
            <span>to cancel</span>
          </span>
          <span className="flex items-center gap-1.5 ml-3">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-[10px] font-mono shadow-sm">
              Ctrl+S
            </kbd>
            <span>to save</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-times text-gray-500 group-hover:text-gray-700"></i>
              Cancel
            </span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="group relative px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue1 to-blue2 rounded-xl hover:from-blue2 hover:to-blue1 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue1 disabled:hover:to-blue2"
          >
            <span className="flex items-center gap-2">
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
            </span>
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

/* -------------------- */
/* Form Components      */
/* -------------------- */

const EditField = ({ field, value, onChange }) => {
  const [touched, setTouched] = useState(false);
  
  const handleChange = (e) => {
    onChange(field.key, e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const common = {
    value: value || "",
    onChange: handleChange,
    onBlur: handleBlur,
    className: `w-full border ${
      touched && !value && field.required ? 'border-red-300 bg-red-50' : 'border-gray-200'
    } rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue2/30 focus:border-blue2 transition-colors`
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {field.label || prettify(field.key)}
        </label>
        {field.required && (
          <span className="text-[10px] font-medium text-blue2 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            Required
          </span>
        )}
      </div>
      
      {field.type === "select" ? (
        <select {...common}>
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea 
          {...common} 
          rows={4}
          placeholder={`Enter ${field.label?.toLowerCase() || 'value'}...`}
        />
      ) : (
        <input
          {...common}
          type={
            field.type === "number" || field.type === "currency" ? "number" :
            field.type === "date" ? "date" :
            field.type === "email" ? "email" :
            field.type === "phone" ? "tel" : "text"
          }
          placeholder={`Enter ${field.label?.toLowerCase() || 'value'}...`}
          step={field.type === "currency" ? "0.01" : "1"}
        />
      )}
      
      {field.description && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <i className="fas fa-info-circle text-gray-400"></i>
          {field.description}
        </p>
      )}
    </div>
  );
};

/* -------------------- */
/* UI Components        */
/* -------------------- */

const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <i className={`${icon} text-blue2 text-lg`}></i>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

/* -------------------- */
/* Helper Functions     */
/* -------------------- */

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

const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default LeadsEditModal;