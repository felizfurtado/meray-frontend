import React, { useState, useRef } from 'react';

const DataMigrationTool = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedData, setSelectedData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [mappingData, setMappingData] = useState({});
  const fileInputRef = useRef(null);

  const templateData = [
    {
      id: 'contacts',
      template: 'Contacts',
      mandatory: ['Name', 'Email', 'Phone'],
      optional: ['Company', 'Address', 'City', 'Country', 'Job Title', 'Lead Source', 'Status'],
      description: 'Import customer and lead contact information.',
      exampleHeaders: 'Name,Email,Phone,Company,Address,City,Country,Job Title,Lead Source,Status'
    },
    {
      id: 'companies',
      template: 'Companies',
      mandatory: ['Company Name', 'Industry'],
      optional: ['Website', 'Phone', 'Address', 'City', 'Country', 'Revenue', 'Employee Count', 'Description'],
      description: 'Migrate company/organization records.',
      exampleHeaders: 'Company Name,Industry,Website,Phone,Address,City,Country,Revenue,Employee Count,Description'
    },
    {
      id: 'deals',
      template: 'Deals/Opportunities',
      mandatory: ['Deal Name', 'Amount', 'Stage'],
      optional: ['Company', 'Contact', 'Expected Close Date', 'Probability', 'Source', 'Description', 'Pipeline'],
      description: 'Transfer sales opportunities and deals.',
      exampleHeaders: 'Deal Name,Amount,Stage,Company,Contact,Expected Close Date,Probability,Source,Description'
    },
    {
      id: 'tasks',
      template: 'Tasks/Activities',
      mandatory: ['Subject', 'Due Date', 'Priority'],
      optional: ['Related To', 'Assigned To', 'Status', 'Description', 'Reminder', 'Category'],
      description: 'Import tasks, meetings, and activities.',
      exampleHeaders: 'Subject,Due Date,Priority,Related To,Assigned To,Status,Description,Reminder,Category'
    },
    {
      id: 'products',
      template: 'Products/Services',
      mandatory: ['Product Name', 'Price'],
      optional: ['SKU', 'Description', 'Category', 'Tax Rate', 'Unit', 'Stock Quantity', 'Vendor'],
      description: 'Migrate product and service catalog.',
      exampleHeaders: 'Product Name,Price,SKU,Description,Category,Tax Rate,Unit,Stock Quantity,Vendor'
    },
    {
      id: 'notes',
      template: 'Notes/Comments',
      mandatory: ['Content', 'Related To'],
      optional: ['Created Date', 'Created By', 'Type', 'Attachment', 'Visibility'],
      description: 'Transfer notes and comments.',
      exampleHeaders: 'Content,Related To,Created Date,Created By,Type,Attachment,Visibility'
    },
    {
      id: 'custom',
      template: 'Custom Objects',
      mandatory: ['Record Name'],
      optional: ['Custom Field 1', 'Custom Field 2', 'Custom Field 3', 'Custom Field 4', 'Custom Field 5'],
      description: 'Import custom modules and fields.',
      exampleHeaders: 'Record Name,Custom Field 1,Custom Field 2,Custom Field 3,Custom Field 4,Custom Field 5'
    }
  ];

  const handleFileUpload = (e, templateId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        setSelectedData({
          templateId,
          fileName: file.name,
          headers,
          rowCount: lines.length - 1,
          content: csvContent
        });

        setUploadStatus(prev => ({
          ...prev,
          [templateId]: { 
            status: 'success', 
            message: `Successfully uploaded ${file.name} with ${lines.length - 1} records` 
          }
        }));

        // Auto-generate mapping suggestions
        const template = templateData.find(t => t.id === templateId);
        const suggestedMapping = {};
        
        template.mandatory.forEach(mandatoryField => {
          const matchingHeader = headers.find(header => 
            header.toLowerCase().includes(mandatoryField.toLowerCase().split(' ')[0])
          );
          if (matchingHeader) {
            suggestedMapping[mandatoryField] = matchingHeader;
          }
        });

        setMappingData(prev => ({
          ...prev,
          [templateId]: suggestedMapping
        }));

        setActiveTab('mapping');
      } catch (error) {
        setUploadStatus(prev => ({
          ...prev,
          [templateId]: { 
            status: 'error', 
            message: 'Error reading CSV file. Please check the format.' 
          }
        }));
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = (template) => {
    const headers = [
      ...template.mandatory,
      ...template.optional
    ].join(',');
    
    const exampleData = headers.split(',').map(header => {
      if (header.includes('Name')) return 'Example Name';
      if (header.includes('Date')) return '2024-01-15';
      if (header.includes('Amount') || header.includes('Price')) return '1000.00';
      if (header.includes('Email')) return 'example@company.com';
      if (header.includes('Phone')) return '+1234567890';
      return 'Example Data';
    }).join(',');
    
    const csvContent = `${headers}\n${exampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.template.replace(/\s+/g, '_')}_Template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMappingChange = (templateId, systemField, csvField) => {
    setMappingData(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [systemField]: csvField
      }
    }));
  };

  const executeMigration = (templateId) => {
    if (!mappingData[templateId]) {
      alert('Please complete field mapping before migration.');
      return;
    }

    const missingMandatory = templateData
      .find(t => t.id === templateId)
      .mandatory.filter(field => !mappingData[templateId][field]);

    if (missingMandatory.length > 0) {
      alert(`Please map all mandatory fields: ${missingMandatory.join(', ')}`);
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      [templateId]: { 
        status: 'processing', 
        message: 'Migration in progress...' 
      }
    }));

    // Simulate migration process
    setTimeout(() => {
      setUploadStatus(prev => ({
        ...prev,
        [templateId]: { 
          status: 'success', 
          message: 'Migration completed successfully!' 
        }
      }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative mb-8 md:mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue2/90 via-blue2/80 to-blue2/90 text-white p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <i className="fas fa-database text-3xl text-white/90"></i>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              CRM Data Migration Tool
            </h1>
            <p className="text-slate-200/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Import your data from any CRM using our CSV templates and mapping tool
            </p>
          </div>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-table text-xl text-blue2"></i>
              </div>
              <div>
                <p className="text-sm text-slate-500">Data Types</p>
                <p className="text-2xl font-bold text-slate-900">{templateData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <i className="fas fa-upload text-xl text-emerald-600"></i>
              </div>
              <div>
                <p className="text-sm text-slate-500">Upload CSV</p>
                <p className="text-2xl font-bold text-slate-900">Supported</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                <i className="fas fa-exchange-alt text-xl text-purple-600"></i>
              </div>
              <div>
                <p className="text-sm text-slate-500">Field Mapping</p>
                <p className="text-2xl font-bold text-slate-900">Auto/Manual</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                <i className="fas fa-shield-alt text-xl text-amber-600"></i>
              </div>
              <div>
                <p className="text-sm text-slate-500">Data Validation</p>
                <p className="text-2xl font-bold text-slate-900">Built-in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'overview' 
                ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent'}`}
            >
              <i className="fas fa-th-large"></i>
              Templates
            </button>
            <button
              onClick={() => setActiveTab('mapping')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'mapping' 
                ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent'}`}
            >
              <i className="fas fa-exchange-alt"></i>
              Field Mapping
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'instructions' 
                ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent'}`}
            >
              <i className="fas fa-book"></i>
              Instructions
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Upload Section - Enhanced */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-cloud-upload-alt text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Quick CSV Upload</h2>
                    <p className="text-sm text-slate-500">Upload your exported data from any CRM system</p>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue2 transition-colors group/upload bg-gradient-to-br from-slate-50 to-white">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(e, 'contacts');
                    }
                  }}
                  className="hidden"
                />
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue2/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                  <i className="fas fa-file-csv text-3xl text-blue2"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Drag & Drop CSV File</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">Upload your exported data from any CRM system in CSV format</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue2 text-white font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-upload"></i>
                  Browse Files
                </button>
                <p className="text-sm text-slate-500 mt-6">Supports CSV files up to 10MB</p>
              </div>
            </div>

            {/* Templates Grid - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateData.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                        <i className="fas fa-file-alt text-xl text-blue2"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{template.template}</h3>
                        <p className="text-xs text-slate-500">{template.description}</p>
                      </div>
                    </div>
                    {uploadStatus[template.id] && (
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${uploadStatus[template.id].status === 'success' 
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'}`}>
                        {uploadStatus[template.id].status}
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="fas fa-asterisk text-xs text-rose-500"></i>
                        Mandatory Fields
                      </span>
                      <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{template.mandatory.length} required</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.mandatory.map((field, idx) => (
                        <span key={idx} className="px-3 py-1.5 text-xs bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 rounded-lg border border-rose-200 font-medium">
                          {field}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="fas fa-plus text-xs text-slate-500"></i>
                        Optional Fields
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{template.optional.length} optional</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.optional.slice(0, 4).map((field, idx) => (
                        <span key={idx} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg border border-slate-200 font-medium">
                          {field}
                        </span>
                      ))}
                      {template.optional.length > 4 && (
                        <span className="px-3 py-1.5 text-xs bg-slate-200 text-slate-700 rounded-lg font-medium">
                          +{template.optional.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      id={`upload-${template.id}`}
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, template.id)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`upload-${template.id}`}
                      className="flex-1 px-4 py-3 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 border border-blue2 cursor-pointer text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <i className="fas fa-upload"></i>
                      Upload CSV
                    </label>
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="flex-1 px-4 py-3 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-download"></i>
                      Template
                    </button>
                  </div>

                  {uploadStatus[template.id] && (
                    <div className={`mt-4 p-3 text-sm rounded-xl border ${uploadStatus[template.id].status === 'success' 
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'}`}>
                      <i className={`fas fa-${uploadStatus[template.id].status === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2`}></i>
                      {uploadStatus[template.id].message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mapping' && selectedData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                      <i className="fas fa-exchange-alt text-xl text-blue2"></i>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Field Mapping</h2>
                  </div>
                  <p className="text-slate-600">Map your CSV columns to CRM fields</p>
                </div>
                <div className="px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-700">
                  <span className="font-medium">{selectedData.fileName}</span> • 
                  <span className="ml-2 font-medium">{selectedData.rowCount} records</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CSV Headers - Enhanced */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <i className="fas fa-file-csv text-blue2"></i>
                    Your CSV Columns
                  </h3>
                  <div className="space-y-3">
                    {selectedData.headers.map((header, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2/10 to-blue2/5 border border-blue2/20 flex items-center justify-center text-blue2 font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">{header}</span>
                          <p className="text-xs text-slate-500 mt-1">Column {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mapping Fields - Enhanced */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <i className="fas fa-database text-blue2"></i>
                    CRM Fields
                  </h3>
                  <div className="space-y-4">
                    {templateData
                      .find(t => t.id === selectedData.templateId)
                      ?.mandatory.map((field, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-xl border border-rose-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-slate-900">{field}</span>
                            <span className="px-3 py-1 text-xs bg-gradient-to-r from-rose-100 to-rose-200 text-rose-700 rounded-lg font-semibold">Required</span>
                          </div>
                          <select
                            value={mappingData[selectedData.templateId]?.[field] || ''}
                            onChange={(e) => handleMappingChange(selectedData.templateId, field, e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200 appearance-none bg-white"
                          >
                            <option value="">Select CSV column...</option>
                            {selectedData.headers.map((header, idx) => (
                              <option key={idx} value={header}>
                                {header} (Column {idx + 1})
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}

                    {templateData
                      .find(t => t.id === selectedData.templateId)
                      ?.optional.map((field, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-slate-900">{field}</span>
                            <span className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg font-semibold">Optional</span>
                          </div>
                          <select
                            value={mappingData[selectedData.templateId]?.[field] || ''}
                            onChange={(e) => handleMappingChange(selectedData.templateId, field, e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200 appearance-none bg-white"
                          >
                            <option value="">Skip this field...</option>
                            {selectedData.headers.map((header, idx) => (
                              <option key={idx} value={header}>
                                {header} (Column {idx + 1})
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Templates
                  </button>
                  <button
                    onClick={() => executeMigration(selectedData.templateId)}
                    className="px-6 py-3 bg-gradient-to-r from-blue2 to-blue2/90 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                  >
                    <i className="fas fa-rocket"></i>
                    Start Migration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-6">
            {/* Migration Guide - Enhanced */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-xl text-blue2"></i>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Migration Guide</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-blue2/5 to-blue2/10 rounded-xl border border-blue2/20">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                        <i className="fas fa-download text-blue2"></i>
                      </div>
                      Step 1: Export from Source CRM
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 ml-2">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-blue2 text-xs mt-1"></i>
                        Export your data in CSV format
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-blue2 text-xs mt-1"></i>
                        Ensure data is clean and properly formatted
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-blue2 text-xs mt-1"></i>
                        Keep original column headers for reference
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-xl border border-emerald-200">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                        <i className="fas fa-upload text-emerald-600"></i>
                      </div>
                      Step 2: Download & Prepare Template
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 ml-2">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-emerald-600 text-xs mt-1"></i>
                        Download our CSV template for your data type
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-emerald-600 text-xs mt-1"></i>
                        Copy your data into the template structure
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-emerald-600 text-xs mt-1"></i>
                        Validate required fields are populated
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-xl border border-purple-200">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                        <i className="fas fa-exchange-alt text-purple-600"></i>
                      </div>
                      Step 3: Upload & Map Fields
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 ml-2">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-purple-600 text-xs mt-1"></i>
                        Upload your prepared CSV file
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-purple-600 text-xs mt-1"></i>
                        Map CSV columns to CRM fields
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-purple-600 text-xs mt-1"></i>
                        Use auto-mapping suggestions
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-xl border border-amber-200">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                        <i className="fas fa-check-circle text-amber-600"></i>
                      </div>
                      Step 4: Validate & Import
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 ml-2">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-amber-600 text-xs mt-1"></i>
                        Review mapping and validation results
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-amber-600 text-xs mt-1"></i>
                        Start the migration process
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check text-amber-600 text-xs mt-1"></i>
                        Monitor progress and check for errors
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Best Practices - Enhanced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-rose-400"></div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-rose-600"></i>
                  </div>
                  Common Issues
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-lg">
                    <i className="fas fa-times text-rose-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Special characters breaking CSV format</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-lg">
                    <i className="fas fa-times text-rose-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Inconsistent date formats</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-lg">
                    <i className="fas fa-times text-rose-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Empty required fields</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-lg">
                    <i className="fas fa-times text-rose-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Duplicate email addresses</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <i className="fas fa-lightbulb text-emerald-600"></i>
                  </div>
                  Best Practices
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-lg">
                    <i className="fas fa-check text-emerald-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Test with small data sample first</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-lg">
                    <i className="fas fa-check text-emerald-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Clean data before importing</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-lg">
                    <i className="fas fa-check text-emerald-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Use unique identifiers for matching</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-lg">
                    <i className="fas fa-check text-emerald-500 mt-1"></i>
                    <span className="text-sm text-slate-600">Keep backup of original files</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Migration Progress - Enhanced */}
        <div className="mt-8 bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue2/5 via-transparent to-blue2/5"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-headset text-xl text-blue2"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Ready for Bulk Migration?</h3>
                <p className="text-sm text-slate-600">Need to migrate multiple data types at once? Contact our migration specialists.</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-blue2 text-white font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
              <i className="fas fa-headset"></i>
              Request Migration Assistance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMigrationTool;