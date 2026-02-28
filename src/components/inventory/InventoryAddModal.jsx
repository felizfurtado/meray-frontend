import React, { useState, useEffect } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import FieldRenderer from "../expenses/FieldRenderer";
import api from "../../api/api";

const InventoryAddModal = ({
  open,
  onClose,
  schema,
  refetchInventory
}) => {

  const [mode, setMode] = useState("CREATE"); // CREATE or PURCHASE
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({});
      setMode("CREATE");

      api.get("/inventories/list/")
        .then(res => setProducts(res.data.rows || []))
        .catch(() => setProducts([]));
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validate = () => {

    if (mode === "CREATE") {
      for (let fieldKey of schema?.form_fields || []) {
        const field = schema.fields.find(f => f.key === fieldKey);
        if (field?.required && !formData[fieldKey]) {
          alert(`${field.label || fieldKey} is required`);
          return false;
        }
      }
    }

    if (mode === "PURCHASE") {
      if (!formData.item_code) {
        alert("Select a product");
        return false;
      }

      if (!formData.purchase_quantity || Number(formData.purchase_quantity) <= 0) {
        alert("Purchase quantity must be greater than 0");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {

    if (!validate()) return;

    try {
      setLoading(true);

      let payload = {};

      if (mode === "CREATE") {
        payload = { ...formData };
      }

      if (mode === "PURCHASE") {
        payload = {
          item_code: formData.item_code,
          purchase_quantity: Number(formData.purchase_quantity),
          purchase_price: Number(formData.purchase_price || 0)
        };
      }

      await api.post("/inventories/", payload);

      refetchInventory();
      onClose();

    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Inventory Management"
      width="max-w-5xl"
    >

      {/* MODE TOGGLE */}
      <div className="flex gap-4 mb-6 border-b pb-4">
        <button
          onClick={() => setMode("CREATE")}
          className={`px-4 py-2 rounded-lg ${
            mode === "CREATE"
              ? "bg-blue2 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Create Product
        </button>

        <button
          onClick={() => setMode("PURCHASE")}
          className={`px-4 py-2 rounded-lg ${
            mode === "PURCHASE"
              ? "bg-blue2 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Add Stock
        </button>
      </div>

      {/* CREATE MODE (Schema Driven) */}
      {mode === "CREATE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {schema?.form_fields?.map(key => {
            const field = schema.fields.find(f => f.key === key);
            if (!field) return null;

            return (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">
                  {field.label || key}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                <FieldRenderer
                  field={field}
                  value={formData[key]}
                  onChange={(k, v) => handleChange(k, v)}
                />
              </div>
            );
          })}

        </div>
      )}

      {/* PURCHASE MODE */}
      {mode === "PURCHASE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="text-sm font-medium">Select Product *</label>
            <select
              value={formData.item_code || ""}
              onChange={(e) => handleChange("item_code", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">Select</option>
              {products.map(p => (
                <option key={p.id} value={p.item_code}>
                  {p.item_code} - {p.item_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Purchase Quantity *</label>
            <input
              type="number"
              value={formData.purchase_quantity || ""}
              onChange={(e) => handleChange("purchase_quantity", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Purchase Price *</label>
            <input
              type="number"
              value={formData.purchase_price || ""}
              onChange={(e) => handleChange("purchase_price", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-10 border-t pt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue2 text-white rounded-lg"
        >
          {loading
            ? "Processing..."
            : mode === "CREATE"
              ? "Create Product"
              : "Add Stock"}
        </button>
      </div>

    </ViewEditModal>
  );
};

export default InventoryAddModal;