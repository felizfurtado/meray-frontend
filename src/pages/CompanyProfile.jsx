import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import api from "../api/api";

const CompanyProfile = ({ collapsed = false }) => {
  const leftMargin = collapsed ? "ml-[60px]" : "ml-[140px]";

  const defaultProfile = {
    company_name: "",
    company_logo: "",
    company_address: "",
    city: "",
    state: "",
    country: "United Arab Emirates",
    postal_code: "",
    phone_number: "",
    email: "",
    website: "",
    is_vat_registered: true,
    vat_number: "",
    corporate_registration_number: "",
    signature_image: "",
    company_stamp: "",
    custom_footer_notes: "",
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});

  /* ================= LOAD FROM BACKEND ================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/company-profile/");
      if (res.data.profile) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      setMessage({ 
        text: "Failed to load company profile", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ 
        text: "File size must be less than 5MB", 
        type: "error" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ 
        text: "Only image files are allowed", 
        type: "error" 
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        [key]: reader.result, // base64
      }));
      setMessage({ text: "", type: "" });
    };
    reader.onerror = () => {
      setMessage({ 
        text: "Failed to read image file", 
        type: "error" 
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!profile.company_name?.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Invalid email format";
    }

    if (profile.website && !/^https?:\/\/.+\..+/.test(profile.website)) {
      newErrors.website = "Invalid website URL (include http:// or https://)";
    }

    if (profile.is_vat_registered && !profile.vat_number?.trim()) {
      newErrors.vat_number = "VAT number is required for registered companies";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validate()) {
      setMessage({ 
        text: "Please fix the errors before saving", 
        type: "error" 
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ text: "", type: "" });

      await api.post("/company-profile/save/", profile);

      setIsEditing(false);
      setMessage({ 
        text: "Profile saved successfully.", 
        type: "success" 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error("Save failed", err);
      setMessage({ 
        text: err.response?.data?.error || "Failed to save profile", 
        type: "error" 
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    fetchProfile(); // Reload original data
    setErrors({});
    setMessage({ text: "", type: "" });
  };

  if (loading) {
    return (
      <div className={`${leftMargin} p-10`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-building absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Company Profile"
        description="Manage company information, branding and compliance"
        icon="fas fa-building"
        collapsed={collapsed}
      />

      <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-8 py-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <i className="fas fa-building text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#1f221f]">
                    Company Information
                  </h2>
                  <p className="text-sm text-[#8b8f8c] flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue2/70 text-xs"></i>
                    This information appears on invoices & documents
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-5 py-2.5 bg-blue2 text-white rounded-xl hover:bg-[#4a636e] transition-all shadow-sm gap-2"
                >
                  <i className="fas fa-pen text-sm"></i>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mx-8 mt-6 px-4 py-3 rounded-lg border flex items-center gap-3 ${
              message.type === "success" 
                ? "bg-green-50 border-green-200 text-green-700" 
                : "bg-red-50 border-red-200 text-red-600"
            }`}>
              <i className={`fas ${message.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`}></i>
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="p-8 space-y-6">

            {/* BASIC INFO */}
            <Card title="Basic Information" icon="fa-id-card">
              <Grid>
                <Input
                  label="Company Name"
                  value={profile.company_name}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("company_name", v)}
                  required
                  error={errors.company_name}
                />

                <ImageUpload
                  label="Company Logo"
                  value={profile.company_logo}
                  disabled={!isEditing}
                  onChange={(e) => handleImageUpload(e, "company_logo")}
                />
              </Grid>
            </Card>

            {/* ADDRESS */}
            <Card title="Address Details" icon="fa-location-dot">
              <Textarea
                label="Company Address"
                value={profile.company_address}
                disabled={!isEditing}
                onChange={(v) => handleChange("company_address", v)}
              />

              <Grid>
                <Input 
                  label="City" 
                  value={profile.city}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("city", v)} 
                />
                <Input 
                  label="State" 
                  value={profile.state}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("state", v)} 
                />
                <Input 
                  label="Postal Code" 
                  value={profile.postal_code}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("postal_code", v)} 
                />
              </Grid>
            </Card>

            {/* CONTACT */}
            <Card title="Contact Details" icon="fa-phone">
              <Grid>
                <Input 
                  label="Phone" 
                  value={profile.phone_number}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("phone_number", v)} 
                />
                <Input 
                  label="Email" 
                  value={profile.email}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("email", v)}
                  error={errors.email}
                />
                <Input 
                  label="Website" 
                  value={profile.website}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("website", v)}
                  error={errors.website}
                />
              </Grid>
            </Card>

            {/* TAX */}
            <Card title="Tax & Registration" icon="fa-file-invoice">
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.is_vat_registered}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("is_vat_registered", e.target.checked)
                    }
                    className="w-4 h-4 text-blue2 border-gray-300 rounded focus:ring-blue2"
                  />
                  <div>
                    <span className="text-sm font-medium text-[#1f221f]">VAT Registered</span>
                    <p className="text-xs text-[#8b8f8c]">Enable if your company is registered for VAT</p>
                  </div>
                </label>

                {profile.is_vat_registered && (
                  <Input
                    label="VAT Number"
                    value={profile.vat_number}
                    disabled={!isEditing}
                    onChange={(v) => handleChange("vat_number", v)}
                    required
                    error={errors.vat_number}
                  />
                )}

                <Input
                  label="Corporate Registration Number"
                  value={profile.corporate_registration_number}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("corporate_registration_number", v)}
                />
              </div>
            </Card>

            {/* SIGNATURE */}
            <Card title="Signatures & Stamp" icon="fa-signature">
              <Grid>
                <ImageUpload
                  label="Signature"
                  value={profile.signature_image}
                  disabled={!isEditing}
                  onChange={(e) => handleImageUpload(e, "signature_image")}
                />

                <ImageUpload
                  label="Company Stamp"
                  value={profile.company_stamp}
                  disabled={!isEditing}
                  onChange={(e) => handleImageUpload(e, "company_stamp")}
                />
              </Grid>
            </Card>

            {/* FOOTER */}
            <Card title="Document Settings" icon="fa-file-lines">
              <Textarea
                label="Footer Notes"
                value={profile.custom_footer_notes}
                disabled={!isEditing}
                onChange={(v) => handleChange("custom_footer_notes", v)}
              />
              <p className="text-xs text-[#8b8f8c] mt-2 flex items-center gap-1">
                <i className="fas fa-info-circle"></i>
                These notes will appear at the bottom of all invoices and documents
              </p>
            </Card>

            {/* ACTIONS */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-[#e5e7eb]">
                <button
                  onClick={cancelEdit}
                  className="px-5 py-2.5 border border-[#e5e7eb] rounded-xl text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2.5 bg-blue2 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-[#4a636e] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;

/* ================= COMPONENTS ================= */

const Card = ({ title, icon, children }) => (
  <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 hover:border-blue2/30 transition-all duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-blue2/10 flex items-center justify-center">
        <i className={`fas ${icon} text-blue2 text-sm`}></i>
      </div>
      <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
        {title}
      </h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {children}
  </div>
);

const Input = ({ label, value, onChange, disabled, required, error }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
      <i className="fas fa-circle text-blue2/70 text-[6px]"></i>
      {label}
      {required && <span className="text-[#d95a4a]">*</span>}
    </label>

    <input
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border-2 px-4 py-2.5 text-sm text-[#1f221f] transition-all duration-200
        ${disabled 
          ? "bg-gray-100 text-[#8b8f8c] border-[#e5e7eb] cursor-not-allowed" 
          : error
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-[#e5e7eb] hover:border-blue2/30 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 bg-white"
        }`}
    />
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <i className="fas fa-exclamation-circle"></i>
        {error}
      </p>
    )}
  </div>
);

const Textarea = ({ label, value, onChange, disabled }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
      <i className="fas fa-circle text-blue2/70 text-[6px]"></i>
      {label}
    </label>

    <textarea
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`w-full rounded-lg border-2 px-4 py-2.5 text-sm text-[#1f221f] transition-all duration-200 resize-none
        ${disabled 
          ? "bg-gray-100 text-[#8b8f8c] border-[#e5e7eb] cursor-not-allowed" 
          : "border-[#e5e7eb] hover:border-blue2/30 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 bg-white"
        }`}
    />
  </div>
);

const ImageUpload = ({ label, value, onChange, disabled }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
      <i className="fas fa-circle text-blue2/70 text-[6px]"></i>
      {label}
    </label>

    {value ? (
      <div className="relative group">
        <div className="relative rounded-lg overflow-hidden border-2 border-[#e5e7eb] group-hover:border-blue2/30 transition-all duration-200">
          <img
            src={value}
            alt={label}
            className="h-40 w-full object-cover"
          />
        </div>
        {!disabled && (
          <>
            <button
              onClick={() => document.getElementById(`${label}-upload`)?.click()}
              className="absolute top-2 right-2 w-8 h-8 bg-blue2 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-[#4a636e] flex items-center justify-center"
            >
              <i className="fas fa-pen text-xs"></i>
            </button>
            <p 
              onClick={() => document.getElementById(`${label}-upload`)?.click()}
              className="text-xs text-blue2 mt-2 cursor-pointer hover:underline inline-flex items-center gap-1"
            >
              <i className="fas fa-sync-alt"></i>
              Change image
            </p>
          </>
        )}
      </div>
    ) : (
      <div 
        onClick={() => !disabled && document.getElementById(`${label}-upload`)?.click()}
        className={`relative group transition-all duration-200
          ${!disabled ? "cursor-pointer" : "cursor-not-allowed"}`}
      >
        <div className={`h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200
          ${!disabled 
            ? "border-[#e5e7eb] group-hover:border-blue2/30 group-hover:bg-blue2/5 bg-gray-50" 
            : "border-[#e5e7eb] bg-gray-50/30"
          }`}>
          <i className={`fas fa-cloud-upload-alt ${!disabled ? "text-blue2" : "text-gray-400"} text-2xl mb-2`}></i>
          <span className="text-xs font-medium text-[#4a636e]">Click to upload</span>
          <span className="text-xs text-[#8b8f8c] mt-1">PNG, JPG up to 5MB</span>
        </div>
      </div>
    )}

    <input
      id={`${label}-upload`}
      type="file"
      disabled={disabled}
      accept="image/*"
      onChange={onChange}
      className="hidden"
    />
  </div>
);