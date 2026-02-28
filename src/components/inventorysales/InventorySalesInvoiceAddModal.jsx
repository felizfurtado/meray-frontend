import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventorySalesInvoiceAddModal = ({ open, onClose, refetch }) => {

  const [schema, setSchema] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {

      const [schemaRes, custRes, invRes] = await Promise.all([
        api.get("/inventory-sales-invoices/schema/"),
        api.get("/customers/list/"),
        api.get("/inventories/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setCustomers(custRes.data.rows || []);
      setInventoryItems(invRes.data.rows || []);
    };

    fetchData();

    setForm({
      customer: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      items: [
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true
        }
      ]
    });

    setError("");
  }, [open]);

  if (!open || !schema) return null;

  const updateField = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true
        }
      ]
    }));
  };

  /* ================= TOTAL CALCULATION ================= */

  const subtotal = form.items?.reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.price || 0),
    0
  ) || 0;

  const vat = form.items?.reduce(
    (acc, item) =>
      item.vat_applicable
        ? acc + (Number(item.quantity) * Number(item.price) * 0.05)
        : acc,
    0
  ) || 0;

  const total = subtotal + vat;

  /* ================= SAVE ================= */

  const handleSave = async () => {

    if (!form.customer) {
      setError("Customer required");
      return;
    }

    setSaving(true);

    try {
      await api.post("/inventory-sales-invoices/create/", form);
      onClose();
      refetch?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title={schema.name}
      width="max-w-6xl"
    >
      <div className="px-6 py-6 space-y-6">

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border">
            {error}
          </div>
        )}

        {/* ================= BASIC FIELDS ================= */}

        <div className="grid grid-cols-3 gap-4">

          {/* Customer */}
          <select
            value={form.customer}
            onChange={(e) => updateField("customer", e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          {/* Due Date */}
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => updateField("due_date", e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

        </div>

        {/* Status */}
        <select
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
        </select>

        {/* ================= ITEMS ================= */}

        <div>
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">Items</h3>
            <button onClick={addItem} className="text-blue-600">
              + Add Item
            </button>
          </div>

          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-3 mb-3">

              <select
                value={item.inventory_item}
                onChange={(e) =>
                  updateItem(index, "inventory_item", e.target.value)
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Item</option>
                {inventoryItems.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.item_name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", e.target.value)
                }
                className="border rounded-lg px-3 py-2"
              />

              <input
                type="number"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", e.target.value)
                }
                className="border rounded-lg px-3 py-2"
              />

              <select
                value={item.vat_applicable ? "yes" : "no"}
                onChange={(e) =>
                  updateItem(index, "vat_applicable", e.target.value === "yes")
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="yes">VAT 5%</option>
                <option value="no">No VAT</option>
              </select>

            </div>
          ))}
        </div>

        {/* ================= TOTALS ================= */}

        <div className="text-right font-semibold text-lg">
          Subtotal: {subtotal.toFixed(2)} <br />
          VAT: {vat.toFixed(2)} <br />
          Total: {total.toFixed(2)}
        </div>

      </div>

      <div className="border-t px-6 py-4 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          {saving ? "Saving..." : "Create"}
        </button>
      </div>
    </ViewEditModal>
  );
};

export default InventorySalesInvoiceAddModal;