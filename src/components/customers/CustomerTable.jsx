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
      width: "140px",
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(row);
            }}
            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600"
          >
            <i className="fas fa-edit text-sm"></i>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCustomer(row);
            }}
            className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600"
          >
            <i className="fas fa-trash text-sm"></i>
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
        title={schema?.name || "Customers"}
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
