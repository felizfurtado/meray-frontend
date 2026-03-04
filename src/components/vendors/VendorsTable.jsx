import React, { useEffect, useState } from "react";
import Table from "../layout/Table";
import VendorsViewModal from "./VendorsViewModal";
import VendorsEditModal from "./VendorsEditModal";
import api from "../../api/api";
import TableFieldRenderer from "./VendorTableFieldRenderer";

const VendorsTable = ({ sidebarCollapsed = false }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/vendors/"),
        api.get("/vendors/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setRows(listRes.data.rows);
      setColumns(buildColumns(schemaRes.data.schema, listRes.data.columns));
    } catch (err) {
      console.error("Failed to load vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openView = (row) => {
    setSelectedVendor(row.id);
    setViewOpen(true);
  };

  const openEdit = (row) => {
    setSelectedVendor(row.id);
    setEditOpen(true);
  };

  const deleteVendor = async (row) => {
    if (!window.confirm(`Delete "${row.company}"?`)) return;

    try {
      await api.delete(`/vendors/${row.id}/delete/`);
      fetchVendors();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete vendor");
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

      if (key === "email" || key === "phone") return null;

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
             className="group relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="group relative p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
          >
            <i className="fas fa-edit text-sm"></i>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteVendor(row);
            }}
             className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
        title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">
  <i className="fas fa-users"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Vendors"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
        icon={schema?.icon || "🏬"}
        columns={columns}
        data={rows}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onRowClick={openView}
        searchPlaceholder="Search vendors..."
        pageSize={schema?.page_size || 10}
        defaultSort={schema?.default_sort}
        emptyMessage="No vendors found"
      />

      <VendorsViewModal
        open={viewOpen}
        vendorId={selectedVendor}
        onClose={() => setViewOpen(false)}
        schema={schema}
        refetchVendors={fetchVendors}
      />

      <VendorsEditModal
        open={editOpen}
        vendorId={selectedVendor}
        onClose={() => setEditOpen(false)}
        schema={schema}
        refetchVendors={fetchVendors}
      />
    </>
  );
};

export default VendorsTable;
