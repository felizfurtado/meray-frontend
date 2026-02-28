import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventoryInvoiceAddModal = ({
  open,
  onClose,
  refetch,
}) => {

  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    vendor: "",
    date: "",
    due_date: "",
    status: "draft",
    items: [],
  });

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const vendorRes = await api.get("/vendors/list/");
        const inventoryRes = await api.get("/inventories/list/");
        setVendors(vendorRes.data.rows || []);
        setInventoryItems(inventoryRes.data.rows || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    setForm({
      vendor: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      items: [
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true,
        },
      ],
    });

    setError("");
  }, [open]);

  if (!open) return null;

  /* ================= ITEM LOGIC ================= */

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true,
        },
      ],
    }));
  };

  const updateItem = (index, key, value) => {
    const updated = [...form.items];

    if (key === "inventory_item") {
      const selected = inventoryItems.find(
        i => String(i.id) === String(value)
      );

      updated[index].inventory_item = value;

      if (selected) {
        updated[index].price = selected.cost_price || 0;
      }

    } else {
      updated[index][key] = value;
    }

    setForm({ ...form, items: updated });
  };

  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  /* ================= CALCULATIONS ================= */

  const subtotal = form.items.reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  const vat = form.items.reduce((acc, item) => {
    const line =
      Number(item.quantity || 0) *
      Number(item.price || 0);

    return item.vat_applicable
      ? acc + line * 0.05
      : acc;
  }, 0);

  const total = subtotal + vat;

  /* ================= SAVE ================= */

  const handleSave = async () => {

    if (!form.vendor) {
      setError("Vendor is required");
      return;
    }

    if (!form.items.length) {
      setError("Add at least one item");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("/inventory-invoices/create/", form);
      onClose();
      refetch?.();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to create invoice"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Create Inventory Purchase Invoice"
      width="max-w-6xl"
    >

      <div className="px-6 py-6 space-y-8">

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border">
            {error}
          </div>
        )}

        {/* Vendor */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Vendor
          </label>

          <select
            value={form.vendor}
            onChange={(e) =>
              setForm({ ...form, vendor: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.company || v.contact_name}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            className="border rounded-lg px-4 py-2"
          />

          <input
            type="date"
            value={form.due_date}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value })
            }
            className="border rounded-lg px-4 py-2"
          />
        </div>

        {/* Post Immediately Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.status === "posted"}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.checked ? "posted" : "draft"
              })
            }
          />
          <label className="text-sm text-gray-600">
            Post invoice immediately (update stock & journal)
          </label>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Inventory Items
            </h3>
            <button
              onClick={addItem}
              className="text-blue-600 text-sm"
            >
              + Add Item
            </button>
          </div>

          {form.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 mb-3"
            >
              <div className="col-span-4">
                <select
                  value={item.inventory_item}
                  onChange={(e) =>
                    updateItem(index, "inventory_item", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select Item</option>
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.item_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, "price", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <select
                  value={item.vat_applicable ? "yes" : "no"}
                  onChange={(e) =>
                    updateItem(index, "vat_applicable", e.target.value === "yes")
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="yes">VAT 5%</option>
                  <option value="no">No VAT</option>
                </select>
              </div>

              <div className="col-span-2 flex items-center justify-between">
                <span className="font-medium">
                  {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                </span>

                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>VAT</span>
              <span>{vat.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="border-t px-6 py-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          {saving ? "Saving..." : "Create Invoice"}
        </button>
      </div>

    </ViewEditModal>
  );
};

export default InventoryInvoiceAddModal;