import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InvoicesAddModal = ({
  open,
  onClose,
  schema,
  refetchInvoices,
}) => {
  const [invoiceType, setInvoiceType] = useState("customer"); // "customer" or "custom"
  const [form, setForm] = useState({
    customer: "",
    add_as_customer: false,
    custom_details: {},
    date: "",
    due_date: "",
    status: "draft",
    items: [],
  });

  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    api.get("/customers/list/").then((res) => {
      setCustomers(res.data.rows || []);
    });

    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, price: 0, vat_included: false }],
    }));
  }, [open]);

  if (!open) return null;

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0, vat_included: false }],
    }));
  };

  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
  };

  const toggleVatIncluded = (index) => {
    const updated = [...form.items];
    updated[index].vat_included = !updated[index].vat_included;
    setForm({ ...form, items: updated });
  };

  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  // Calculate item subtotal with VAT logic
 const calculateItemSubtotal = (item) => {
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;
  const lineTotal = quantity * price;
  
  // If VAT is included, we still use the line total as subtotal (VAT will be added separately in calculateTotalVAT)
  return lineTotal;
};

  // Calculate total VAT from all items
const calculateTotalVAT = () => {
  return form.items.reduce((acc, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const lineTotal = quantity * price;
    
    if (item.vat_included) {
      // VAT is included: add 5% VAT to this item
      return acc + (lineTotal * 0.05);
    } else {
      // VAT is excluded: no VAT for this item
      return acc + 0;
    }
  }, 0);
};



const subtotal = form.items.reduce((acc, item) => {
  return acc + calculateItemSubtotal(item);
}, 0);

const vat = calculateTotalVAT();
const total = subtotal + vat;

 const handleSave = async () => {
  setSaving(true);

  try {
    // Create a copy of form with calculated values
    const invoiceData = {
      ...form,
      subtotal: subtotal,
      vat: vat,
      total: total
    };
    
    // 🔥 ADD THIS CONSOLE LOG
    console.log("SENDING TO BACKEND:", JSON.stringify(invoiceData, null, 2));
    console.log("Items with vat_included:", invoiceData.items.map(item => ({
      description: item.description,
      price: item.price,
      vat_included: item.vat_included,
      lineTotal: item.quantity * item.price,
      vatAmount: item.vat_included ? (item.quantity * item.price * 0.05) : 0
    })));
    console.log("Calculated totals:", { subtotal, vat, total });
    
    await api.post("/invoices/", invoiceData);
  } catch (err) {
    console.log("FULL ERROR:", err.response?.data);
    alert(err.response?.data?.error || "Something went wrong");
  }

  setSaving(false);
  onClose();
  refetchInvoices?.();
};

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Create Invoice"
      width="max-w-6xl"
    >
      {/* Header - Matching theme */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
              <i className="fas fa-file-invoice text-2xl"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
              <i className="fas fa-plus-circle text-xs text-white"></i>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
              Create New Invoice
            </h1>
            <p className="text-[#4a636e] text-sm flex items-center gap-2">
              <i className="fas fa-info-circle text-blue2 text-xs"></i>
              Fill in the details to generate a new invoice
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Type Navigation */}
      <div className="px-6 mb-6">
        <div className="bg-[#f6f6f4] p-1 rounded-lg flex w-full border border-gray-200">
          <button
            onClick={() => setInvoiceType("customer")}
            className={`flex-1 px-5 py-2 rounded-md text-sm font-medium transition-all ${
              invoiceType === "customer"
                ? "bg-white text-blue2 shadow-sm border border-gray-200"
                : "text-[#4a636e] hover:text-[#1f221f]"
            }`}
          >
            <i className="fas fa-user-tie mr-2"></i>
            Customer Invoice
          </button>

          <button
            onClick={() => setInvoiceType("custom")}
            className={`flex-1 px-5 py-2 rounded-md text-sm font-medium transition-all ${
              invoiceType === "custom"
                ? "bg-white text-blue2 shadow-sm border border-gray-200"
                : "text-[#4a636e] hover:text-[#1f221f]"
            }`}
          >
            <i className="fas fa-user-plus mr-2"></i>
            Custom Invoice
          </button>
        </div>

        <p className="text-xs text-[#8b8f8c] mt-2 flex items-center gap-1">
          <i className="fas fa-info-circle text-[10px]"></i>
          {invoiceType === "customer" 
            ? "Select an existing customer from your database" 
            : "Create a one-time invoice with custom customer details"}
        </p>
      </div>

      <div className="px-6 pb-6 space-y-8">
        {/* Customer Selection Section - Changes based on invoice type */}
        {invoiceType === "customer" ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue2 rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-user-tie text-blue2"></i>
                Select Customer
              </h3>
            </div>

            <div className="space-y-1.5">
              <select
                value={form.customer}
                onChange={(e) =>
                  setForm({ ...form, customer: e.target.value })
                }
                className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
              >
                <option value="" className="text-[#8b8f8c]">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="text-[#1f221f]">
                    {c.company || c.contact_name || `Customer ${c.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue2 rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-user-plus text-blue2"></i>
                Custom Customer Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                  <i className="fas fa-building text-blue2/70 text-xs"></i>
                  Company Name *
                </label>
                <input
                  placeholder="e.g. Acme Corp"
                  value={form.custom_details?.companyName || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      custom_details: {
                        ...form.custom_details,
                        companyName: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                  <i className="fas fa-user text-blue2/70 text-xs"></i>
                  Contact Person
                </label>
                <input
                  placeholder="e.g. John Doe"
                  value={form.custom_details?.contactPerson || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      custom_details: {
                        ...form.custom_details,
                        contactPerson: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                  <i className="fas fa-envelope text-blue2/70 text-xs"></i>
                  Email
                </label>
                <input
                  placeholder="e.g. john@acme.com"
                  value={form.custom_details?.email || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      custom_details: {
                        ...form.custom_details,
                        email: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                  <i className="fas fa-phone text-blue2/70 text-xs"></i>
                  Phone
                </label>
                <input
                  placeholder="e.g. +971 50 123 4567"
                  value={form.custom_details?.phone || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      custom_details: {
                        ...form.custom_details,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                  <i className="fas fa-map-marker-alt text-blue2/70 text-xs"></i>
                  Address
                </label>
                <input
                  placeholder="e.g. Business Bay, Dubai"
                  value={form.custom_details?.address || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      custom_details: {
                        ...form.custom_details,
                        address: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue2/5 border border-blue2/20 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.add_as_customer}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      add_as_customer: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 text-blue2 border-gray-300 rounded focus:ring-blue2"
                />
                <div>
                  <p className="text-sm font-medium text-[#1f221f] flex items-center gap-2">
                    <i className="fas fa-save text-blue2"></i>
                    Save this customer for future use
                  </p>
                  <p className="text-xs text-[#8b8f8c] mt-1">
                    This will create a new customer in your database.
                  </p>
                </div>
              </label>
            </div>

            <p className="text-xs text-[#8b8f8c] mt-2 flex items-center gap-1">
              <i className="fas fa-info-circle text-[10px]"></i>
              Fields marked with * are required
            </p>
          </div>
        )}

        {/* Invoice Details Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue2 rounded-full"></div>
            <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-calendar-alt text-blue2"></i>
              Invoice Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                <i className="fas fa-calendar text-blue2/70 text-xs"></i>
                Invoice Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                <i className="fas fa-clock text-blue2/70 text-xs"></i>
                Due Date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
                className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
                <i className="fas fa-flag text-blue2/70 text-xs"></i>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
              >
                <option value="draft" className="text-[#d9a44a]">Draft</option>
                <option value="Posted" className="text-blue2">Posted</option>
                {/* <option value="paid" className="text-[#4a9b68]">Paid</option> */}
              </select>
            </div>
          </div>
        </div>

        {/* Items Section - Same for both types */}
        <div>
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 bg-blue2 rounded-full"></div>
      <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
        <i className="fas fa-boxes text-blue2"></i>
        Invoice Items
      </h3>
    </div>
    <button
      onClick={addItem}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue2/10 text-blue2 rounded-lg text-xs font-medium border border-blue2/30 hover:bg-blue2/20 transition-colors group"
    >
      <i className="fas fa-plus-circle text-xs group-hover:scale-110 transition-transform"></i>
      Add Item
    </button>
  </div>

  {/* Column Headers */}
  {form.items.length > 0 && (
    <div className="grid grid-cols-12 gap-3 mb-2 px-3">
      <div className="col-span-8">
        <span className="text-xs font-medium text-[#4a636e] uppercase tracking-wider">Description</span>
      </div>
      <div className="col-span-3">
        <span className="text-xs font-medium text-[#4a636e] uppercase tracking-wider">Quantity</span>
      </div>
      <div className="col-span-1"></div>
    </div>
  )}

  <div className="space-y-3">
    {form.items.map((item, index) => (
      <div 
        key={index} 
        className="bg-white rounded-xl border border-gray-200 hover:border-blue2/30 hover:shadow-md transition-all duration-200 overflow-hidden group/item"
      >
        {/* First row - Description and Quantity */}
        <div className="grid grid-cols-12 gap-3 items-center p-3 pb-2 border-b border-gray-100">
          <div className="col-span-8">
            <div className="relative">
              <input
                placeholder="Enter item description..."
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/50 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
              />
              {!item.description && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <i className="fas fa-pencil-alt text-[10px] text-[#8b8f8c]/30"></i>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-3">
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", e.target.value)
                }
                className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/50 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-[#8b8f8c]">
                units
              </div>
            </div>
          </div>
          <div className="col-span-1 flex justify-end">
            <button
              onClick={() => removeItem(index)}
              className="p-2 text-[#d95a4a]/60 hover:text-[#d95a4a] hover:bg-[#d95a4a]/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 focus:opacity-100"
              title="Remove item"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          </div>
        </div>

        {/* Second row - Price, VAT toggle, and Line Total */}
        <div className="grid grid-cols-12 gap-3 items-center p-3 pt-2 bg-gradient-to-r from-transparent via-white to-white">
          <div className="col-span-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4a636e] font-medium text-sm">AED</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", e.target.value)
                }
                className="w-full rounded-lg border border-[#e5e7eb] pl-12 pr-3 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/50 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
              />
            </div>
          </div>
          <div className="col-span-3">
            <button
  onClick={() => toggleVatIncluded(index)}
  className={`w-full px-2 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
    item.vat_included
      ? "bg-blue2/10 text-blue2 border-blue2/30 hover:bg-blue2/20"
      : "bg-[#f6f6f4] text-[#4a636e] border-gray-200 hover:bg-blue2/5 hover:border-blue2/30"
  }`}
>
  <i className={`fas ${item.vat_included ? 'fa-check-circle text-blue2' : 'fa-circle text-[#8b8f8c]'} text-xs`}></i>
  <span className="text-xs">
    {item.vat_included ? 'VAT Included (5%)' : 'VAT Excluded (0%)'}
  </span>
</button>
          </div>
          <div className="col-span-4 col-start-9">
            <div className="bg-gradient-to-r from-blue2/5 to-transparent p-2 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#4a636e] font-medium">Total:</span>
                <span className="text-base font-bold text-[#1f221f]">
                  {formatCurrency(Number(item.quantity) * Number(item.price))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Item number indicator */}
        <div className="absolute top-2 left-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono text-[#8b8f8c]/30">#{index + 1}</span>
        </div>
      </div>
    ))}

    {form.items.length === 0 && (
      <div 
        onClick={addItem}
        className="py-12 text-center bg-gradient-to-br from-[#f6f6f4] to-white rounded-xl border-2 border-dashed border-gray-200 hover:border-blue2/30 hover:bg-blue2/5 transition-all cursor-pointer group"
      >
        <div className="w-20 h-20 rounded-full bg-blue2/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue2/10 transition-all group-hover:scale-110">
          <i className="fas fa-boxes text-3xl text-blue2/40 group-hover:text-blue2/60"></i>
        </div>
        <p className="text-sm font-medium text-[#4a636e] mb-2">No items added yet</p>
        <p className="text-xs text-[#8b8f8c] mb-3">Click to add your first invoice item</p>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue2 text-white rounded-lg text-sm font-medium hover:bg-blue2/90 transition-all shadow-sm hover:shadow group-hover:translate-y-[-2px]">
          <i className="fas fa-plus-circle text-xs"></i>
          Add Item
        </button>
      </div>
    )}
  </div>

  {/* Quick Tips */}
  {/* Quick Tips */}
{form.items.length > 0 && (
  <div className="mt-4 flex items-center gap-4 text-xs text-[#8b8f8c] bg-[#f6f6f4] p-3 rounded-lg border border-gray-200">
    <div className="flex items-center gap-1.5">
      <i className="fas fa-info-circle text-blue2/70"></i>
      <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-[10px]">Tab</kbd> to quickly add next item</span>
    </div>
    <div className="flex items-center gap-1.5">
      <i className="fas fa-calculator text-blue2/70"></i>
      <span>VAT is only applied to items marked as "VAT Included"</span>
    </div>
  </div>
)}
</div>

        {/* Totals Preview */}
        <div className="flex justify-end">
          <div className="w-full bg-gradient-to-br from-blue2/5 to-[#a9c0c9]/10 rounded-xl border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-[#1f221f] mb-3 flex items-center gap-2">
              <i className="fas fa-calculator text-blue2"></i>
              Invoice Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#4a636e]">Subtotal (Excluding VAT)</span>
                <span className="font-medium text-[#1f221f]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#4a636e]">VAT (5%)</span>
                <span className="font-medium text-[#1f221f]">{formatCurrency(vat)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-semibold text-[#1f221f]">Total</span>
                <span className="text-xl font-bold text-[#1f221f]">{formatCurrency(total)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-[#8b8f8c]">
  <p className="flex items-center gap-1">
    <i className="fas fa-info-circle text-blue2/70"></i>
    {form.items.some(item => item.vat_included) 
      ? "VAT is extracted from items marked as 'VAT Included'" 
      : "No VAT is applied to any items"}
  </p>
</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className={`${invoiceType === "customer" ? "fas fa-user-tie" : "fas fa-user-plus"} text-blue2/70`}></i>
          <span>
            {invoiceType === "customer" 
              ? "Creating invoice for existing customer" 
              : "Creating invoice with custom details"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Create {invoiceType === "customer" ? "Customer" : "Custom"} Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default InvoicesAddModal;