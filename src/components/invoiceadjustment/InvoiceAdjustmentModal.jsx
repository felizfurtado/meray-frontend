import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InvoiceAdjustmentAddModal = ({ open, onClose, refetch }) => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  
  const [invoiceId, setInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [documentType, setDocumentType] = useState("CREDIT_NOTE");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState([{ 
    type: "manual", 
    description: "", 
    inventory_id: null, 
    sku: null,
    item_name: null,
    quantity: 1, 
    price: 0, 
    vat_included: false 
  }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load data on open
  useEffect(() => {
    if (!open) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, invenRes] = await Promise.all([
          api.get("/invoices/originals/"),
          api.get("/inventories/list/")
        ]);
        
        const originalInvoices = (invRes.data.rows || []).filter(inv => 
          (!inv.document_type || inv.document_type === "INVOICE") && !inv.related_invoice
        );
        
        setInvoices(originalInvoices);
        setFilteredInvoices(originalInvoices);
        
        const inventoryData = invenRes.data.rows || [];
        console.log("Inventory data:", inventoryData); // Debug log
        setInventoryItems(inventoryData);
        setFilteredInventory(inventoryData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Reset form
    setInvoiceId("");
    setSelectedInvoice(null);
    setDocumentType("CREDIT_NOTE");
    setDate(new Date().toISOString().split("T")[0]);
    setItems([{ 
      type: "manual", 
      description: "", 
      inventory_id: null, 
      sku: null,
      item_name: null,
      quantity: 1, 
      price: 0, 
      vat_included: false 
    }]);
    setError("");
    setErrors({});
    setInvoiceSearch("");
    setInventorySearch("");
  }, [open]);

  // Filter invoices on search
  useEffect(() => {
    if (!invoiceSearch.trim()) {
      setFilteredInvoices(invoices);
    } else {
      const term = invoiceSearch.toLowerCase();
      setFilteredInvoices(invoices.filter(inv => 
        inv.number?.toLowerCase().includes(term) ||
        inv.customer_name?.toLowerCase().includes(term) ||
        formatCurrency(inv.total).includes(term)
      ));
    }
  }, [invoiceSearch, invoices]);

  // Filter inventory on search
  useEffect(() => {
    if (!inventorySearch.trim()) {
      setFilteredInventory(inventoryItems);
    } else {
      const term = inventorySearch.toLowerCase();
      setFilteredInventory(inventoryItems.filter(item => 
        (item.item_name?.toLowerCase().includes(term)) ||
        (item.item_code?.toLowerCase().includes(term)) ||
        (item.sku?.toLowerCase().includes(term)) ||
        (item.description?.toLowerCase().includes(term))
      ));
    }
  }, [inventorySearch, inventoryItems]);

  // Fetch invoice details
  useEffect(() => {
    if (!invoiceId) return setSelectedInvoice(null);
    api.get(`/invoices/${invoiceId}/`)
      .then(res => setSelectedInvoice(res.data.invoice))
      .catch(() => setSelectedInvoice(null));
  }, [invoiceId]);

  if (!open) return null;

  // Calculations
  const subtotal = items.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.price)), 0);
  const vat = items.reduce((acc, i) => i.vat_included ? acc + (Number(i.quantity) * Number(i.price) * 0.05) : acc, 0);
  const total = subtotal + vat;

  const formatCurrency = (val) => 
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(val || 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // Item handlers
  const addItem = (type) => setItems([...items, { 
    type, 
    description: "", 
    inventory_id: null, 
    sku: null,
    item_name: null,
    quantity: 1, 
    price: 0, 
    vat_included: false 
  }]);

  const updateItem = (idx, key, val) => {
    const updated = [...items];
    updated[idx][key] = val;
    setItems(updated);
    if (errors[`item_${idx}_${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${idx}_${key}`];
      setErrors(newErrors);
    }
  };

  const toggleVat = (idx) => {
    const updated = [...items];
    updated[idx].vat_included = !updated[idx].vat_included;
    setItems(updated);
  };

  const removeItem = (idx) => items.length > 1 && setItems(items.filter((_, i) => i !== idx));

  const openInventorySelector = (idx) => {
    setSelectedIdx(idx);
    setInventorySearch("");
    setShowInventoryDropdown(true);
  };

  const selectInventory = (inv) => {
    if (selectedIdx !== null) {
      const updated = [...items];
      updated[selectedIdx] = {
        type: "inventory",
        description: inv.item_name || inv.description || "",
        inventory_id: inv.id,
        sku: inv.item_code || inv.sku,
        item_name: inv.item_name,
        quantity: 1,
        price: inv.selling_price || 0,
        vat_included: false
      };
      setItems(updated);
      setShowInventoryDropdown(false);
    }
  };

  const selectInvoice = (inv) => {
    setInvoiceId(inv.id);
    setInvoiceSearch(`${inv.number} - ${inv.customer_name || 'Customer'}`);
    setShowInvoiceDropdown(false);
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!invoiceId) newErrors.invoice = "Select an invoice";
    if (!date) newErrors.date = "Date required";
    
    items.forEach((item, i) => {
      if (item.type === "manual" && !item.description.trim()) 
        newErrors[`item_${i}_description`] = "Description required";
      if (item.quantity <= 0) newErrors[`item_${i}_quantity`] = "Quantity > 0";
      if (item.price <= 0) newErrors[`item_${i}_price`] = "Price > 0";
    });
    
    if (!items.some(i => i.description?.trim() && i.quantity > 0 && i.price > 0))
      newErrors.items = "Add at least one valid item";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save
  const handleSave = async () => {
    if (!validate()) return;
    setError("");
    setSaving(true);
    try {
      await api.post("/invoices/adjustment/", { 
        invoice_id: invoiceId, 
        document_type: documentType, 
        date, 
        items 
      });
      onClose();
      refetch?.();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewEditModal open={open} onClose={onClose} title="Create Credit / Debit Note" width="max-w-6xl">
      
      {/* Inventory Dropdown */}
      {showInventoryDropdown && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowInventoryDropdown(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#1f221f]">
                  <i className="fas fa-box text-blue2 mr-2"></i>Select Inventory Item
                </h3>
                <button onClick={() => setShowInventoryDropdown(false)} className="text-[#8b8f8c] hover:text-[#1f221f]">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="relative">
                <input
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                  placeholder="Search by name, code, or SKU..."
                  className="w-full border-2 border-[#e5e7eb] rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20"
                  autoFocus
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8f8c]"></i>
              </div>
              <p className="text-xs text-[#8b8f8c] mt-2">{filteredInventory.length} items found</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-blue2/20 border-t-blue2 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="py-8 text-center text-[#8b8f8c]">No items found</div>
              ) : (
                <div className="space-y-2">
                  {filteredInventory.map(item => (
                    <div
                      key={item.id}
                      onClick={() => selectInventory(item)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue2/30 hover:bg-blue2/5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-blue2/10 flex items-center justify-center">
                          <i className="fas fa-box text-blue2"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#1f221f]">{item.item_name || 'Unnamed'}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.item_code && (
                              <span className="text-xs bg-[#f6f6f4] px-2 py-0.5 rounded-full text-[#4a636e]">
                                Code: {item.item_code}
                              </span>
                            )}
                            {item.sku && (
                              <span className="text-xs bg-[#f6f6f4] px-2 py-0.5 rounded-full text-[#4a636e]">
                                SKU: {item.sku}
                              </span>
                            )}
                            <span className="text-xs text-[#8b8f8c]">
                              Qty: {item.current_quantity || 0}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-[#8b8f8c] mt-1 truncate max-w-md">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-blue2">{formatCurrency(item.selling_price || 0)}</p>
                        <p className="text-xs text-[#8b8f8c]">Cost: {formatCurrency(item.cost_price || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-[#f6f6f4]/50 flex justify-end">
              <button onClick={() => setShowInventoryDropdown(false)} className="px-4 py-2 text-sm text-[#4a636e] hover:text-[#1f221f]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg">
            <i className="fas fa-exchange-alt text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">Credit / Debit Note</h2>
            <p className="text-xs text-[#8b8f8c]">Create adjustment notes for existing invoices</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>{error}
          </div>
        )}
        {errors.items && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-600 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>{errors.items}
          </div>
        )}

        {/* Invoice Selector with Search */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
            <i className="fas fa-file-invoice text-blue2/70 text-xs"></i> Select Invoice <span className="text-[#d95a4a]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={invoiceSearch}
              onChange={(e) => {
                setInvoiceSearch(e.target.value);
                setShowInvoiceDropdown(true);
                if (!e.target.value) setInvoiceId("");
              }}
              onFocus={() => setShowInvoiceDropdown(true)}
              placeholder="Search by invoice number or customer..."
              className={`w-full border-2 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 ${errors.invoice ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"}`}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8f8c]"></i>
          </div>
          
          {showInvoiceDropdown && filteredInvoices.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {filteredInvoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => selectInvoice(inv)}
                  className="px-4 py-3 hover:bg-blue2/5 cursor-pointer border-b last:border-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-[#1f221f]">{inv.number}</span>
                      <span className="ml-2 text-sm text-[#8b8f8c]">{inv.customer_name || 'Customer'}</span>
                    </div>
                    <span className="text-sm font-medium text-blue2">{formatCurrency(inv.total)}</span>
                  </div>
                  <div className="text-xs text-[#8b8f8c] mt-1">
                    {formatDate(inv.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {errors.invoice && <p className="text-xs text-red-500"><i className="fas fa-exclamation-circle mr-1"></i>{errors.invoice}</p>}
        </div>

        {/* Selected Invoice Info */}
        {selectedInvoice && (
          <div className="bg-gradient-to-br from-blue2/5 to-blue2/10 border border-blue2/20 rounded-xl p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-[#4a636e] mb-1">Customer</p>
                <p className="font-semibold text-[#1f221f]">{selectedInvoice.customer_name || 'Walk-in Customer'}</p>
                <p className="text-xs text-[#8b8f8c] mt-1">Invoice #{selectedInvoice.number} • {formatDate(selectedInvoice.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#4a636e] mb-1">Original Total</p>
                <p className="text-xl font-bold text-blue2">{formatCurrency(selectedInvoice.total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Type Toggle & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide mb-2 block">Document Type</label>
            <div className="flex gap-2">
              <button onClick={() => setDocumentType("CREDIT_NOTE")} 
                className={`flex-1 py-3 rounded-lg font-medium border-2 transition-all ${documentType === "CREDIT_NOTE" ? "bg-red-50 text-red-600 border-red-300" : "border-[#e5e7eb] text-[#4a636e]"}`}>
                <i className="fas fa-minus-circle mr-2"></i>Credit
              </button>
              <button onClick={() => setDocumentType("DEBIT_NOTE")}
                className={`flex-1 py-3 rounded-lg font-medium border-2 transition-all ${documentType === "DEBIT_NOTE" ? "bg-green-50 text-green-600 border-green-300" : "border-[#e5e7eb] text-[#4a636e]"}`}>
                <i className="fas fa-plus-circle mr-2"></i>Debit
              </button>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide flex items-center gap-1.5">
              <i className="fas fa-calendar text-blue2/70 text-xs"></i> Date <span className="text-[#d95a4a]">*</span>
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} 
              className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 ${errors.date ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"}`} />
            {errors.date && <p className="text-xs text-red-500"><i className="fas fa-exclamation-circle mr-1"></i>{errors.date}</p>}
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">Adjustment Items</h3>
              <span className="text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-full">{items.length} items</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addItem("manual")} className="px-4 py-2 text-sm bg-[#4a636e]/10 text-[#4a636e] rounded-lg border border-[#4a636e]/20 hover:bg-[#4a636e]/20">
                <i className="fas fa-pencil-alt mr-2"></i>Manual
              </button>
              <button onClick={() => openInventorySelector(items.length)} className="px-4 py-2 text-sm bg-blue2/10 text-blue2 rounded-lg border border-blue2/20 hover:bg-blue2/20">
                <i className="fas fa-box mr-2"></i>Inventory
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className={`bg-white rounded-xl border-2 overflow-hidden ${errors[`item_${i}_description`] ? "border-red-200 bg-red-50/30" : "border-[#e5e7eb] hover:border-blue2/30"}`}>
                
                {/* Item Header */}
                <div className="px-4 pt-3 flex justify-between items-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === "inventory" ? "bg-blue2/10 text-blue2" : "bg-[#4a636e]/10 text-[#4a636e]"}`}>
                    <i className={`fas ${item.type === "inventory" ? "fa-box" : "fa-pencil-alt"} mr-1 text-[8px]`}></i>
                    {item.type === "inventory" ? "Inventory Item" : "Manual Entry"}
                    {item.sku && <span className="ml-2 text-[8px] bg-white/50 px-1 rounded">Code: {item.sku}</span>}
                  </span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded">
                      <i className="fas fa-trash-alt mr-1"></i>Remove
                    </button>
                  )}
                </div>

                {/* Item Fields */}
                <div className="p-4 pt-2">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Description */}
                    <div className="col-span-6">
                      {item.type === "inventory" ? (
                        <div className="flex items-center gap-2 p-2.5 bg-blue2/5 border border-blue2/20 rounded-lg">
                          <i className="fas fa-box text-blue2"></i>
                          <div className="flex-1">
                            <span className="font-medium text-[#1f221f]">{item.description}</span>
                            {item.item_name && (
                              <span className="ml-2 text-xs text-[#8b8f8c]">({item.item_name})</span>
                            )}
                          </div>
                          <button onClick={() => openInventorySelector(i)} className="text-xs text-blue2 hover:underline flex items-center gap-1">
                            <i className="fas fa-sync-alt text-[10px]"></i>Change
                          </button>
                        </div>
                      ) : (
                        <input 
                          value={item.description} 
                          onChange={e => updateItem(i, "description", e.target.value)}
                          placeholder="Enter description" 
                          className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm ${errors[`item_${i}_description`] ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"}`} 
                        />
                      )}
                      {errors[`item_${i}_description`] && (
                        <p className="text-xs text-red-500 mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{errors[`item_${i}_description`]}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <div className="relative">
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={e => updateItem(i, "quantity", e.target.value)}
                          className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm ${errors[`item_${i}_quantity`] ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"}`} 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8b8f8c]">units</span>
                      </div>
                      {errors[`item_${i}_quantity`] && (
                        <p className="text-xs text-red-500 mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{errors[`item_${i}_quantity`]}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a636e] text-sm">AED</span>
                        <input 
                          type="number" 
                          min="0.01" 
                          step="0.01" 
                          value={item.price} 
                          onChange={e => updateItem(i, "price", e.target.value)}
                          className={`w-full border-2 pl-12 pr-3 py-2.5 text-sm ${errors[`item_${i}_price`] ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"}`} 
                        />
                      </div>
                      {errors[`item_${i}_price`] && (
                        <p className="text-xs text-red-500 mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{errors[`item_${i}_price`]}</p>
                      )}
                    </div>

                    <div className="col-span-1"></div>
                  </div>

                  {/* VAT Toggle & Line Total */}
                  <div className="grid grid-cols-12 gap-3 items-center mt-3">
                    <div className="col-span-4">
                      <button onClick={() => toggleVat(i)} 
                        className={`w-full px-3 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 ${
                          item.vat_included 
                            ? "bg-blue2/10 text-blue2 border-blue2/30" 
                            : "bg-[#f6f6f4] text-[#4a636e] border-gray-200"
                        }`}>
                        <i className={`fas ${item.vat_included ? 'fa-check-circle' : 'fa-circle'} text-sm`}></i>
                        {item.vat_included ? 'VAT Inc (5%)' : 'VAT Excluded'}
                      </button>
                    </div>
                    <div className="col-span-8">
                      <div className="bg-gradient-to-r from-blue2/5 to-transparent px-4 py-2 rounded-lg flex justify-between items-center">
                        <span className="text-sm text-[#4a636e]">Line Total:</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-[#1f221f]">{formatCurrency(item.quantity * item.price)}</span>
                          {item.vat_included && (
                            <div className="text-[10px] text-[#8b8f8c]">VAT: {formatCurrency(item.quantity * item.price * 0.05)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-sm text-[#4a636e] mb-4">No items added</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => addItem("manual")} className="px-4 py-2 bg-[#4a636e] text-white rounded-lg text-sm">Manual Item</button>
                  <button onClick={() => openInventorySelector(0)} className="px-4 py-2 bg-blue2 text-white rounded-lg text-sm">Inventory Item</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full bg-gradient-to-br from-[#f6f6f4] to-white p-6 rounded-xl border border-[#e5e7eb]">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue2 rounded-full"></div>
              {documentType === "CREDIT_NOTE" ? "Credit" : "Debit"} Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-[#4a636e]">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-[#4a636e]">VAT (5%)</span>
                <span className="font-medium text-[#d9a44a]">{formatCurrency(vat)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-blue2">{formatCurrency(total)}</span>
              </div>
              <div className="pt-2 text-xs text-[#8b8f8c] border-t border-dashed">
                <i className="fas fa-info-circle text-blue2/70 mr-1"></i>
                {items.some(i => i.vat_included) ? "VAT on marked items only" : "No VAT applied"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 flex justify-between items-center">
          <span className="text-xs text-[#8b8f8c]">
            <i className="fas fa-info-circle mr-1"></i>
            Fields marked with <span className="text-[#d95a4a]">*</span> required
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#4a636e] hover:bg-white rounded-lg border border-transparent hover:border-gray-200">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue2 text-white rounded-lg text-sm font-medium hover:bg-[#4a636e] disabled:opacity-50">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline"></div>Creating...</>
              ) : (
                <><i className="fas fa-save mr-2"></i>Create Note</>
              )}
            </button>
          </div>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default InvoiceAdjustmentAddModal;