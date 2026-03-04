import React, { useEffect, useState } from "react";
import Table from "../layout/Table";
import CustomersViewModal from "./CustomersViewModal";
import CustomersEditModal from "./CustomersEditModal";
import api from "../../api/api";
import TableFieldRenderer from "./CustomerTableFieldRenderer";

const CustomersTable = ({ sidebarCollapsed = false }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/customers/"),
        api.get("/customers/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setRows(listRes.data.rows);
      setColumns(buildColumns(schemaRes.data.schema, listRes.data.columns));
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openView = (row) => {
    setSelectedCustomer(row.id);
    setViewOpen(true);
  };

  const openEdit = (row) => {
    setSelectedCustomer(row.id);
    setEditOpen(true);
  };

  const deleteCustomer = async (row) => {
    if (!window.confirm(`Delete "${row.company}"?`)) return;

    try {
      await api.delete(`/customers/${row.id}/delete/`);
      fetchCustomers();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete customer");
    }
  };

  function buildColumns(schema, columnKeys) {
    if (!schema || !columnKeys?.length) return [];

    const fieldMap = {};
    schema.fields?.forEach((f) => {
      fieldMap[f.key] = f;
    });

    const cols = columnKeys.map((key) => {
      const field = fieldMap[key] || {};

      // hide email + phone (will merge to contact)
      if (key === "email" || key === "phone") return null;

      // merge company + industry
      if (key === "company") {
        return {
          field: "company",
          header: field.label || "Company",
          sortable: true,
          render: (value, row) => {
            const industry = row.industry;
            return (
              <div className="flex flex-col">
                <span className="font-semibold text-text text-sm">
                  {value || "-"}
                </span>
                {industry && (
                  <span className="text-xs text-muted">
                    {industry}
                  </span>
                )}
              </div>
            );
          },
        };
      }

      // contact column
      if (key === "contact") {
        return {
          field: "contact",
          header: "Contact",
          sortable: false,
          render: (_, row) => {
            const email = row.email;
            const phone = row.phone;

            if (!email && !phone) return "-";

            return (
              <div className="flex flex-col gap-1">
                {phone && <span className="text-sm">{phone}</span>}
                {email && <span className="text-sm truncate">{email}</span>}
              </div>
            );
          },
        };
      }

      return {
        field: key,
        header: field.label || prettify(key),
        sortable: true,
        render: (value, row) => (
          <TableFieldRenderer field={field} value={value} row={row} />
        ),
      };
    });

    let filteredCols = cols.filter(Boolean);

    // add contact if email or phone exists
    const hasEmailOrPhone =
      columnKeys.includes("email") || columnKeys.includes("phone");

    if (hasEmailOrPhone) {
      filteredCols.splice(2, 0, {
        field: "contact",
        header: "Contact",
        sortable: false,
        render: (_, row) => {
          const email = row.email;
          const phone = row.phone;

          if (!email && !phone) return "-";

          return (
            <div className="flex flex-col gap-1">
              {phone && <span className="text-sm">{phone}</span>}
              {email && <span className="text-sm truncate">{email}</span>}
            </div>
          );
        },
      });
    }

    // actions
  filteredCols.push({
  field: "actions",
  header: "Actions",
  width: "180px",
  render: (_, row) => (
    <div className="flex items-center justify-end gap-1">
      {/* VIEW */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openView(row);
        }}
        className="group relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        title="View Details"
      >
        <i className="fas fa-eye text-sm"></i>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          View
        </span>
      </button>

      {/* EDIT */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openEdit(row);
        }}
        className="group relative p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
        title="Edit"
      >
        <i className="fas fa-edit text-sm"></i>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Edit
        </span>
      </button>

      {/* DELETE */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteCustomer(row);
        }}
        className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
        title="Delete"
      >
        <i className="fas fa-trash-alt text-sm"></i>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Delete
        </span>
      </button>
    </div>
  ),
});

    return filteredCols;
  }

  function prettify(text) {
    return text
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <>
      <Table
        title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">
  <i className="fas fa-users"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Customers"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
        icon={schema?.icon || "🏢"}
        columns={columns}
        data={rows}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onRowClick={openView}
        searchPlaceholder="Search customers..."
        pageSize={schema?.page_size || 10}
        defaultSort={schema?.default_sort}
        emptyMessage="No customers found"
      />

      <CustomersViewModal
        open={viewOpen}
        customerId={selectedCustomer}
        onClose={() => setViewOpen(false)}
        schema={schema}
        refetchCustomers={fetchCustomers}
      />

      <CustomersEditModal
        open={editOpen}
        customerId={selectedCustomer}
        onClose={() => setEditOpen(false)}
        schema={schema}
        refetchCustomers={fetchCustomers}
      />
    </>
  );
};

export default CustomersTable;
