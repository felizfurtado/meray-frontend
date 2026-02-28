import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const VendorsEditModal = ({
  open,
  onClose,
  vendorId,
  schema,
  refetchVendors,
}) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!open || !vendorId) return;

    setLoading(true);
    api.get(`/vendors/${vendorId}/`).then((res) => {
      const data = res.data.vendor;
      setForm({
        ...data,
        ...(data.extra_data || {}),
      });
      setLoading(false);
    });
  }, [open, vendorId]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await api.put(`/vendors/${vendorId}/update/`, form);
    setSaving(false);
    onClose();
    refetchVendors?.();
  };

  if (!open) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: "bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20",
      inactive: "bg-[#8b8f8c]/10 text-[#8b8f8c] border-[#8b8f8c]/20",
    };
    return (
      statusMap[status?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const vendorName =
    form?.company ||
    form?.contact_name ||
    `Vendor ${String(vendorId).slice(-6)}`;

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Edit Vendor"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-truck absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">
              Loading vendor details…
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                    {vendorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-pencil-alt text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {form.company ||
                      form.contact_name ||
                      "Unnamed Vendor"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {form.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          form.status
                        )}`}
                      >
                        {prettify(form.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-sm text-[#8b8f8c]">Editing Mode</span>
                <span className="text-base font-semibold text-blue2 flex items-center gap-2">
                  <i className="fas fa-pencil-alt text-sm"></i>
                  Vendor #{String(vendorId).slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-[#e5e7eb]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-blue2 text-blue2"
                    : "border-transparent text-[#8b8f8c]"
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Vendor Details
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "notes"
                    ? "border-blue2 text-blue2"
                    : "border-transparent text-[#8b8f8c]"
                }`}
              >
                <i className="fas fa-sticky-note mr-2"></i>
                Notes
                {Array.isArray(form.notes) &&
                  form.notes.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                      {form.notes.length}
                    </span>
                  )}
              </button>
            </nav>
          </div>

          {/* Details Tab */}
          {activeTab === "details" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-pencil-alt text-blue2"></i>
                  Edit Vendor Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>
          ) : (
            /* Notes Tab */
            <div className="space-y-6">
              {Array.isArray(form.notes) &&
              form.notes.length > 0 ? (
                form.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-[#1f221f]">
                          {note.user_name || "System"}
                        </span>
                        <p className="text-sm text-[#4a636e] whitespace-pre-wrap mt-2">
                          {note.text}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await api.delete(
                            `/vendors/${vendorId}/notes/${note.id}/delete/`
                          );
                          setForm((prev) => ({
                            ...prev,
                            notes: prev.notes.filter(
                              (n) => n.id !== note.id
                            ),
                          }));
                        }}
                        className="ml-4 p-2 text-[#d95a4a]/70 hover:text-[#d95a4a]"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[#8b8f8c]">
                  No notes yet.
                </div>
              )}

              <AddNoteSection
                vendorId={vendorId}
                setForm={setForm}
              />
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#4a636e]"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-5 py-2 bg-blue2 rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </ViewEditModal>
  );
};

export default VendorsEditModal;

/* Reuse same EditField component */
const EditField = ({ field, value, onChange }) => {
  const common = {
    value,
    onChange: (e) => onChange(field.key, e.target.value),
    className:
      "w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 bg-white",
  };

  if (field.type === "select") {
    return (
      <select {...common}>
        <option value="">Select {field.label || "option"}</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return <input type="text" {...common} />;
};

const AddNoteSection = ({ vendorId, setForm }) => {
  const [text, setText] = useState("");

  const addNote = async () => {
    if (!text.trim()) return;

    const res = await api.post(
      `/vendors/${vendorId}/notes/add/`,
      { text }
    );

    setForm((prev) => ({
      ...prev,
      notes: [...(prev.notes || []), res.data.note],
    }));

    setText("");
  };

  return (
    <div className="flex gap-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note..."
        className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm"
      />
      <button
        onClick={addNote}
        disabled={!text.trim()}
        className="px-5 py-2 bg-[#d9a44a] text-white rounded-lg disabled:opacity-50"
      >
        Add Note
      </button>
    </div>
  );
};

const prettify = (text) =>
  text?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
