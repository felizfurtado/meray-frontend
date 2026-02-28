import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventoryViewModal = ({ open, onClose, itemId, schema }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;

    setLoading(true);
    api
      .get(`/inventories/${itemId}/`)
      .then((res) => setItem(res.data.inventory))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  if (!open) return null;

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(value);
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Inventory Details"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : !item ? (
        <div className="py-20 text-center text-red-500">
          Item not found
        </div>
      ) : (
        <div className="space-y-8">

          {/* ===================================== */}
          {/* HEADER SUMMARY */}
          {/* ===================================== */}

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">
              {item.item_name}
            </h2>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span>Code: {item.item_code}</span>
              <span>Category: {item.category}</span>
              <span>Status: {item.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">

              <StatCard label="Current Quantity" value={item.current_quantity} />
              <StatCard label="Average Cost" value={formatCurrency(item.average_cost || item.cost_price)} />
              <StatCard label="Inventory Value" value={formatCurrency(item.inventory_value)} />
              <StatCard label="Selling Price" value={formatCurrency(item.selling_price)} />

            </div>
          </div>

          {/* ===================================== */}
          {/* DYNAMIC FIELDS FROM SCHEMA */}
          {/* ===================================== */}

          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
              Item Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {schema?.fields?.map((field) => {
                const value = item[field.key];

                if (
                  value === undefined ||
                  value === null ||
                  typeof value === "object"
                )
                  return null;

                return (
                  <div
                    key={field.key}
                    className="bg-white rounded-lg border p-4"
                  >
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      {field.label || field.key}
                    </div>
                    <div className="font-medium">
                      {formatValue(field.type, value)}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* ===================================== */}
          {/* STOCK TRANSACTIONS TABLE */}
          {/* ===================================== */}

          {item.transactions?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                Stock Transactions
              </h3>

              <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Unit Cost</th>
                      <th className="px-4 py-3 text-right">Total Cost</th>
                      <th className="px-4 py-3 text-left">Reference</th>
                    </tr>
                  </thead>

                  <tbody>
                    {item.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {tx.type}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {tx.quantity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(tx.unit_cost)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(tx.total_cost)}
                        </td>
                        <td className="px-4 py-3">
                          {tx.reference || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </ViewEditModal>
  );
};

export default InventoryViewModal;


const StatCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 border">
    <div className="text-xs text-gray-500 mb-1 uppercase">
      {label}
    </div>
    <div className="text-xl font-bold">
      {value}
    </div>
  </div>
);

function formatValue(type, value) {
  if (!value && value !== 0) return "—";

  switch (type) {
    case "number":
      return new Intl.NumberFormat("en-AE").format(value);
    case "boolean":
      return value ? "Yes" : "No";
    case "currency":
      return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
      }).format(value);
    default:
      return value;
  }
}