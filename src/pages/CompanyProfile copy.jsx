import React, { useState, useEffect } from "react";

const CompanyProfile = () => {
  // State for company profile
  const [companyProfile, setCompanyProfile] = useState({
    // Basic Information
    companyName: "",
    companyLogo: null,
    logoPreview: "",
    companyAddress: "",
    city: "",
    state: "",
    country: "United Arab Emirates",
    postalCode: "",
    
    // Contact Details
    phoneNumber: "",
    email: "",
    website: "",
    
    // Tax & Registration
    vatNumber: "",
    corporateRegistrationNumber: "",
    isVATRegistered: true,
    
    // Signatures & Stamps
    signatureImage: null,
    signaturePreview: "",
    companyStamp: null,
    stampPreview: "",
    
    // Document Settings
    customFooterNotes: "Thank you for your business. All payments should be made within 30 days of invoice date.",
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  // Load company profile from localStorage on component mount
  useEffect(() => {
    loadCompanyProfile();
  }, []);

  // Load company profile from localStorage
  const loadCompanyProfile = () => {
    try {
      const savedProfile = localStorage.getItem('companyProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setCompanyProfile(parsedProfile);
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
      showMessage("Failed to load company profile", "error");
    }
  };

  // Save company profile to localStorage
  const saveCompanyProfile = () => {
    try {
      localStorage.setItem('companyProfile', JSON.stringify(companyProfile));
      return true;
    } catch (error) {
      console.error("Error saving company profile:", error);
      return false;
    }
  };

  // Show message helper
  const showMessage = (text, type = "success") => {
    setSaveMessage({ text, type });
    setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setCompanyProfile(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setCompanyProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle file upload for logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage("Logo file size must be less than 2MB", "error");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showMessage("Please upload an image file", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyProfile(prev => ({
          ...prev,
          companyLogo: file,
          logoPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for signature
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        showMessage("Signature file size must be less than 1MB", "error");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showMessage("Please upload an image file", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyProfile(prev => ({
          ...prev,
          signatureImage: file,
          signaturePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for company stamp
  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        showMessage("Stamp file size must be less than 1MB", "error");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showMessage("Please upload an image file", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyProfile(prev => ({
          ...prev,
          companyStamp: file,
          stampPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setCompanyProfile(prev => ({
      ...prev,
      companyLogo: null,
      logoPreview: ""
    }));
  };

  // Remove signature
  const handleRemoveSignature = () => {
    setCompanyProfile(prev => ({
      ...prev,
      signatureImage: null,
      signaturePreview: ""
    }));
  };

  // Remove stamp
  const handleRemoveStamp = () => {
    setCompanyProfile(prev => ({
      ...prev,
      companyStamp: null,
      stampPreview: ""
    }));
  };

  // Clear company profile from localStorage
  const clearCompanyProfile = async () => {
  if (!window.confirm("Are you sure you want to clear all company profile data?")) return;

  try {
    await api.delete("/company-profile/delete/");

    setCompanyProfile({
      companyName: "",
      companyLogo: "",
      logoPreview: "",
      companyAddress: "",
      city: "",
      state: "",
      country: "United Arab Emirates",
      postalCode: "",
      phoneNumber: "",
      email: "",
      website: "",
      vatNumber: "",
      corporateRegistrationNumber: "",
      isVATRegistered: true,
      signatureImage: "",
      signaturePreview: "",
      companyStamp: "",
      stampPreview: "",
      customFooterNotes: "",
    });

    showMessage("Company profile cleared!", "success");
    setIsEditing(true);

  } catch (error) {
    showMessage("Failed to clear profile", "error");
  }
};


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!companyProfile.companyName.trim()) {
      showMessage("Company Name is required", "error");
      return;
    }

    if (!companyProfile.vatNumber.trim() && companyProfile.isVATRegistered) {
      showMessage("VAT Number is required when VAT Registered is checked", "error");
      return;
    }

    setLoading(true);
    
    try {
      // Save to localStorage
      const saved = saveCompanyProfile();
      
      if (saved) {
        showMessage("Company profile saved successfully!", "success");
        setIsEditing(false);
      } else {
        showMessage("Failed to save company profile. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error saving company profile:", error);
      showMessage("An error occurred while saving. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setSaveMessage({ text: "", type: "" });
  };

  // Reset form to saved values
  const handleCancel = () => {
    loadCompanyProfile();
    setIsEditing(false);
    setSaveMessage({ text: "", type: "" });
  };

  // UAE VAT number validation (15 digits)
  const validateVATNumber = (vatNumber) => {
    if (!vatNumber) return true;
    const vatRegex = /^\d{15}$/;
    return vatRegex.test(vatNumber);
  };

  const [collapsed, setCollapsed] = useState(false);
  const leftMargin = collapsed ? 'ml-[60px]' : 'ml-[140px]';

  return (
    <div className={`min-h-screen bg-gradient-to-br  p-4 md:p-6 lg:p-8 ${leftMargin} transition-all duration-300`}>
      {/* Enhanced Header */}
      <div className="relative mb-8 md:mb-12 overflow-hidden rounded-2xl bg-blue2 text-white p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r "></div>
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <i className="fas fa-building text-3xl text-white/90"></i>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Company Profile
          </h1>
          <p className="text-slate-200/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Manage your company information for invoices, reports, and official documents
          </p>

        </div>
      </div>

      {/* Floating Save Message */}
      {saveMessage.text && (
        <div className={`fixed top-6 right-6 z-50 animate-slideInRight ${saveMessage.type === 'success' 
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
          : 'bg-gradient-to-r from-rose-500 to-rose-600'} 
          text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border border-white/20 flex items-center gap-3`}>
          <i className={`fas ${saveMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-xl`}></i>
          <span className="font-medium">{saveMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo & Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-landmark text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Company Logo & Basic Information</h2>
                    <p className="text-sm text-slate-500">Primary company identification details</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200">
                  Required
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-file-signature text-blue2"></i>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyProfile.companyName}
                    onChange={handleInputChange}
                    placeholder="Official registered company name"
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-image text-blue2"></i>
                    Company Logo Upload
                  </label>
                  <div className="space-y-4">
                    {companyProfile.logoPreview ? (
                      <div className="relative group/logo">
                        <img 
                          src={companyProfile.logoPreview} 
                          alt="Company Logo" 
                          className="w-32 h-32 rounded-xl border-2 border-slate-200 object-contain p-4 bg-white shadow-sm"
                        />
                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <i className="fas fa-building text-3xl mb-2 text-blue2"></i>
                        <p className="text-sm">No logo</p>
                      </div>
                    )}
                    
                    {isEditing && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          id="logoUpload"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="logoUpload"
                          className="inline-flex items-center gap-2 px-4 py-3 bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-cloud-upload-alt"></i>
                          Upload Logo
                        </label>
                        <p className="text-xs text-slate-500">Recommended: 300×300px, PNG or JPG, max 2MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Address */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Company Address</h2>
                    <p className="text-sm text-slate-500">Billing & physical address information</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200">
                  Required
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-address-card text-blue2"></i>
                    Company Address *
                  </label>
                  <textarea
                    name="companyAddress"
                    value={companyProfile.companyAddress}
                    onChange={handleInputChange}
                    placeholder="Billing & physical address"
                    rows="3"
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 resize-none transition-all duration-200 hover:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={companyProfile.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2">State/Emirate</label>
                    <input
                      type="text"
                      name="state"
                      value={companyProfile.state}
                      onChange={handleInputChange}
                      placeholder="State or Emirate"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                    <select
                      name="country"
                      value={companyProfile.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400 appearance-none bg-white"
                    >
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Oman">Oman</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={companyProfile.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal Code"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-address-book text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Contact Details</h2>
                    <p className="text-sm text-slate-500">Primary contact information</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200">
                  Required
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <i className="fas fa-phone text-blue2"></i>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={companyProfile.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+971 XX XXX XXXX"
                      required
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <i className="fas fa-envelope text-blue2"></i>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={companyProfile.email}
                      onChange={handleInputChange}
                      placeholder="contact@company.com"
                      required
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-globe text-blue2"></i>
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyProfile.website}
                    onChange={handleInputChange}
                    placeholder="https://www.company.com"
                    disabled={!isEditing}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Tax & Registration */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-receipt text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Tax & Registration Numbers</h2>
                    <p className="text-sm text-slate-500">Legal and tax identification</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200">
                  Required
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <i className="fas fa-id-card text-blue2"></i>
                      VAT Number *
                    </label>
                    <input
                      type="text"
                      name="vatNumber"
                      value={companyProfile.vatNumber}
                      onChange={handleInputChange}
                      placeholder="15-digit UAE VAT number"
                      pattern="\d{15}"
                      title="15-digit VAT number required"
                      required={companyProfile.isVATRegistered}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400 ${
                        !validateVATNumber(companyProfile.vatNumber) && companyProfile.vatNumber ? 'border-rose-300' : 'border-slate-300'
                      }`}
                    />
                    {!validateVATNumber(companyProfile.vatNumber) && companyProfile.vatNumber && (
                      <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle text-blue2"></i>
                        VAT number must be 15 digits
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <i className="fas fa-file-contract text-blue2"></i>
                      Corporate Registration Number
                    </label>
                    <input
                      type="text"
                      name="corporateRegistrationNumber"
                      value={companyProfile.corporateRegistrationNumber}
                      onChange={handleInputChange}
                      placeholder="CR Number"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 transition-all duration-200 hover:border-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue2/5 rounded-xl border border-blue2/10">
                  <input
                    type="checkbox"
                    id="isVATRegistered"
                    name="isVATRegistered"
                    checked={companyProfile.isVATRegistered}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-5 h-5 text-blue2 border-slate-300 rounded focus:ring-blue2 disabled:bg-slate-100 accent-blue2"
                  />
                  <label htmlFor="isVATRegistered" className="text-sm text-slate-700 flex items-center gap-2 cursor-pointer">
                    <i className="fas fa-check-circle text-blue2"></i>
                    VAT Registered Company
                  </label>
                  <span className="text-xs text-slate-500 ml-auto">Check if your company is registered for VAT in UAE</span>
                </div>
              </div>
            </div>

            {/* Signatures & Stamps */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-signature text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Signatures & Stamps</h2>
                    <p className="text-sm text-slate-500">Digital signatures and company seals</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <i className="fas fa-signature text-blue2"></i>
                      Signature Image *
                    </label>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700">Required</span>
                  </div>
                  
                  <div className="space-y-4">
                    {companyProfile.signaturePreview ? (
                      <div className="relative group/signature">
                        <img 
                          src={companyProfile.signaturePreview} 
                          alt="Authorized Signature" 
                          className="w-full max-w-md h-48 border-2 border-slate-200 rounded-xl object-contain bg-white p-6 shadow-sm"
                        />
                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={handleRemoveSignature}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <i className="fas fa-signature text-4xl mb-3 text-blue2"></i>
                        <p className="text-sm">No signature</p>
                      </div>
                    )}
                    
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          id="signatureUpload"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="signatureUpload"
                          className="inline-flex items-center gap-2 px-4 py-3 bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-upload"></i>
                          Upload Signature
                        </label>
                        <p className="text-xs text-slate-500 mt-2">Recommended: Transparent PNG, white background</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <i className="fas fa-stamp text-blue2"></i>
                      Company Stamps / Seal
                    </label>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700">Optional</span>
                  </div>
                  
                  <div className="space-y-4">
                    {companyProfile.stampPreview ? (
                      <div className="relative group/stamp">
                        <img 
                          src={companyProfile.stampPreview} 
                          alt="Company Stamp" 
                          className="w-full max-w-md h-48 border-2 border-slate-200 rounded-xl object-contain bg-white p-6 shadow-sm"
                        />
                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={handleRemoveStamp}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <i className="fas fa-stamp text-4xl mb-3 text-blue2"></i>
                        <p className="text-sm">No stamp</p>
                      </div>
                    )}
                    
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          id="stampUpload"
                          accept="image/*"
                          onChange={handleStampUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="stampUpload"
                          className="inline-flex items-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-upload"></i>
                          Upload Stamp
                        </label>
                        <p className="text-xs text-slate-500 mt-2">Optional: Company seal or stamp image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-file-alt text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Document Footer Notes</h2>
                    <p className="text-sm text-slate-500">Standard text for invoices and documents</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200">
                  Recommended
                </span>
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-sticky-note text-blue2"></i>
                  Custom Footer / Notes
                </label>
                <textarea
                  name="customFooterNotes"
                  value={companyProfile.customFooterNotes}
                  onChange={handleInputChange}
                  placeholder="Add standard text for invoices, e.g., 'Thank you for your business. All payments should be made within 30 days of invoice date.'"
                  rows="4"
                  disabled={!isEditing}
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 disabled:bg-slate-50 disabled:text-slate-500 resize-none transition-all duration-200 hover:border-slate-400"
                />
                <p className="text-xs text-slate-500 mt-2">This text will appear at the bottom of all invoices and official documents.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {!isEditing ? (
                  <>
                    <button 
                      type="button" 
                      onClick={toggleEditMode}
                      className="w-full md:w-auto px-8 py-4 bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <i className="fas fa-edit"></i>
                      Edit Company Profile
                    </button>
                    
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue2/5 rounded-xl border border-blue2/10">
                      <i className="fas fa-info-circle text-blue2"></i>
                      <span className="text-sm text-slate-600">
                        Profile {companyProfile.companyName ? 'saved' : 'not configured'}. Click Edit to make changes.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-200 flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
                      >
                        <i className="fas fa-times"></i>
                        Cancel
                      </button>
                      
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-4 bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                      <i className="fas fa-exclamation-triangle text-amber-500"></i>
                      <span className="text-sm text-amber-700">Editing mode: Changes saved to browser storage</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Preview & Actions (Removed sticky positioning) */}
        <div className="space-y-6">
          {/* Company Profile Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-eye text-xl text-blue2"></i>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Live Preview</h2>
              <div className="ml-auto px-3 py-1 bg-blue2 text-white text-xs font-semibold rounded-full">
                PREVIEW
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-blue2/5 rounded-xl border border-blue2/10">
                <div className="flex items-start gap-4">
                  {companyProfile.logoPreview ? (
                    <img 
                      src={companyProfile.logoPreview} 
                      alt="Company Logo" 
                      className="w-20 h-20 rounded-xl border-2 border-blue2/20 object-contain bg-white p-3 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                      <i className="fas fa-building text-2xl text-blue2"></i>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {companyProfile.companyName || "Your Company Name"}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {companyProfile.companyAddress || "Company Address"} {companyProfile.city ? `, ${companyProfile.city}` : ""}
                      {companyProfile.state ? `, ${companyProfile.state}` : ""} {companyProfile.postalCode ? `, ${companyProfile.postalCode}` : ""}
                      {companyProfile.country ? `, ${companyProfile.country}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                      {companyProfile.phoneNumber && (
                        <span className="flex items-center gap-2">
                          <i className="fas fa-phone text-blue2"></i>
                          {companyProfile.phoneNumber}
                        </span>
                      )}
                      {companyProfile.email && (
                        <span className="flex items-center gap-2">
                          <i className="fas fa-envelope text-blue2"></i>
                          {companyProfile.email}
                        </span>
                      )}
                      {companyProfile.website && (
                        <span className="flex items-center gap-2">
                          <i className="fas fa-globe text-blue2"></i>
                          {companyProfile.website}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <span className="text-sm font-medium text-slate-700">VAT Number:</span>
                  <span className="text-sm text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded-lg">
                    {companyProfile.vatNumber || "Not provided"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Registration Number:</span>
                  <span className="text-sm text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded-lg">
                    {companyProfile.corporateRegistrationNumber || "Not provided"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <span className="text-sm font-medium text-slate-700">VAT Registered:</span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    companyProfile.isVATRegistered 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    {companyProfile.isVATRegistered ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {companyProfile.signaturePreview && (
                <div className="p-4 bg-blue2/5 rounded-xl border border-blue2/10">
                  <p className="text-sm font-medium text-slate-700 mb-2">Authorized Signature:</p>
                  <img 
                    src={companyProfile.signaturePreview} 
                    alt="Signature" 
                    className="w-48 h-24 object-contain bg-white border border-slate-200 rounded-lg shadow-sm p-4"
                  />
                </div>
              )}

              {companyProfile.customFooterNotes && (
                <div className="p-4 bg-blue2/5 rounded-xl border border-blue2/10">
                  <p className="text-sm font-medium text-slate-700 mb-2">Document Footer:</p>
                  <p className="text-sm text-slate-600 italic leading-relaxed">{companyProfile.customFooterNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-cog text-xl text-blue2"></i>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => document.getElementById('exportImport').click()}
                className="p-4 bg-blue2/5 rounded-xl border border-blue2/10 hover:border-blue2/30 transition-all duration-200 hover:translate-y-[-2px] text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-blue2/10 text-blue2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-file-export text-lg"></i>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Export Profile</span>
                    <p className="text-xs text-slate-500">Download as JSON file</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById('importFile').click()}
                className="p-4 bg-blue2/5 rounded-xl border border-blue2/10 hover:border-blue2/30 transition-all duration-200 hover:translate-y-[-2px] text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-blue2/10 text-blue2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-file-import text-lg"></i>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Import Profile</span>
                    <p className="text-xs text-slate-500">Upload JSON file</p>
                  </div>
                </div>
              </button>

              <input
                type="file"
                id="importFile"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const importedProfile = JSON.parse(e.target.result);
                        setCompanyProfile(prev => ({
                          ...prev,
                          ...importedProfile
                        }));
                        showMessage("Company profile imported successfully!", "success");
                        setIsEditing(true);
                      } catch (error) {
                        showMessage("Invalid JSON file format", "error");
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={clearCompanyProfile}
                className="p-4 bg-rose-50 rounded-xl border border-rose-200 hover:border-rose-300 transition-all duration-200 hover:translate-y-[-2px] text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-trash-alt text-lg"></i>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Clear Profile</span>
                    <p className="text-xs text-slate-500">Remove all data</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Help & Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-question-circle text-xl text-blue2"></i>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Help & Information</h2>
            </div>
            
            <div className="space-y-4">
              {/* <div className="flex items-start gap-3 p-3 bg-blue2/5 rounded-xl border border-blue2/10">
                <div className="w-8 h-8 rounded-lg bg-blue2/10 text-blue2 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-database text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Data Storage</p>
                  <p className="text-xs text-slate-600">Stored in browser's local storage. Remains until you clear browser data.</p>
                </div>
              </div> */}
              
              <div className="flex items-start gap-3 p-3 bg-blue2/5 rounded-xl border border-blue2/10">
                <div className="w-8 h-8 rounded-lg bg-blue2/10 text-blue2 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-check-circle text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Required Fields</p>
                  <p className="text-xs text-slate-600">Fields marked with * are required for professional documents.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue2/5 rounded-xl border border-blue2/10">
                <div className="w-8 h-8 rounded-lg bg-blue2/10 text-blue2 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-exclamation-triangle text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">VAT Compliance</p>
                  <p className="text-xs text-slate-600">For UAE companies: VAT number must be 15 digits for tax compliance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Functionality (Hidden) */}
      <button
        id="exportImport"
        onClick={() => {
          const profileData = JSON.stringify(companyProfile, null, 2);
          const blob = new Blob([profileData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `company-profile-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showMessage("Company profile exported successfully!", "success");
        }}
        style={{ display: 'none' }}
      >
        Export
      </button>

      {/* Add custom animations to Tailwind config */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CompanyProfile;