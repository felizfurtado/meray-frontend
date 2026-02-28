import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InvoicesEditModal = ({
  open,
  onClose,
  invoiceId,
  refetchInvoices,
}) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;

    setLoading(true);
    api
      .get(`/invoices/${invoiceId}/`)
      .then((res) => setForm(res.data.invoice))
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    await api.put(
      `/invoices/${invoiceId}/update/`,
      form
    );
    setSaving(false);
    onClose();
    refetchInvoices?.();
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Edit Invoice"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">Loading…</div>
      ) : (
        <>
          <div className="space-y-4">
            <Input
              label="Date"
              value={form.date}
              onChange={(v) =>
                setForm({ ...form, date: v })
              }
              type="date"
            />

            <Input
              label="Due Date"
              value={form.due_date}
              onChange={(v) =>
                setForm({ ...form, due_date: v })
              }
              type="date"
            />

            <Input
              label="Status"
              value={form.status}
              onChange={(v) =>
                setForm({ ...form, status: v })
              }
            />
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue2 text-white rounded"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </ViewEditModal>
  );
};

export default InvoicesEditModal;

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2"
    />
  </div>
);
