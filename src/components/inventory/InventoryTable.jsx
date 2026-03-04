import React, { useEffect, useState } from "react";
import Table from "../layout/Table";
import api from "../../api/api";
import InventoryViewModal from "./InventoryViewModal";
import InventoryEditModal from "./InventoryEditModal";
import InventoryTableFieldRenderer from "./InventoryTableFieldRenderer";

const InventoryTable = ({ schema, sidebarCollapsed, refetchInventory }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchList = async () => {
    const res = await api.get("/inventories/list/");
    setRows(res.data.rows);
    setColumns(buildColumns(schema, res.data.columns));
  };

  useEffect(() => {
    if (schema) fetchList();
  }, [schema]);

  const deleteItem = async (row) => {
    if (!window.confirm(`Delete "${row.item_name}"?`)) return;
    await api.delete(`/inventories/${row.id}/delete/`);
    refetchInventory();
    fetchList();
  };

  function buildColumns(schema, keys) {
    if (!schema) return [];

    const fieldMap = {};
    schema.fields?.forEach(f => fieldMap[f.key] = f);

    const cols = keys.map(key => ({
      field: key,
      header: fieldMap[key]?.label || prettify(key),
      sortable: true,
      render: (value, row) => (
        <InventoryTableFieldRenderer
          field={fieldMap[key]}
          value={value}
          row={row}
        />
      )
    }));

    cols.push({
      field: "actions",
      header: "Actions",
      width: "120px",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => setViewId(row.id)} 
            className="p-2 text-[#8b8f8c] hover:text-blue2 hover:bg-blue2/10 rounded-lg transition-all"
            title="View"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>
          <button 
            onClick={() => setEditId(row.id)} 
            className="p-2 text-[#8b8f8c] hover:text-[#4a9b68] hover:bg-[#4a9b68]/10 rounded-lg transition-all"
            title="Edit"
          >
            <i className="fas fa-edit text-sm"></i>
          </button>
          <button 
            onClick={() => deleteItem(row)} 
            className="p-2 text-[#8b8f8c] hover:text-[#d95a4a] hover:bg-[#d95a4a]/10 rounded-lg transition-all"
            title="Delete"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      )
    });

    return cols;
  }

  return (
    <>
      <Table
        title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">
  <i className="fas fa-boxes"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Inventory"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
        icon={schema?.icon || "📦"}
        columns={columns}
        data={rows}
        sidebarCollapsed={sidebarCollapsed}
        searchPlaceholder="Search by name, SKU, category..."
        pageSize={schema?.page_size || 10}
        defaultSort={schema?.default_sort}
        emptyMessage="No inventory items found"
      />

      <InventoryViewModal
        open={!!viewId}
        itemId={viewId}
        onClose={() => setViewId(null)}
        schema={schema}
      />

      <InventoryEditModal
        open={!!editId}
        itemId={editId}
        onClose={() => setEditId(null)}
        schema={schema}
        refetchInventory={refetchInventory}
      />
    </>
  );
};

export default InventoryTable;

/* Helper Function */
const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};