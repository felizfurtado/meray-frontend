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
  const [message, setMessage] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        [key]: reader.result, // base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage("");

      await api.post("/company-profile/save/", profile);

      setIsEditing(false);
      setMessage("Profile saved successfully.");
    } catch (err) {
      console.error("Save failed", err);
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${leftMargin} p-10`}>
        <p className="text-gray-500">Loading company profile...</p>
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

          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-center px-8 py-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-[#1f221f]">
                Company Information
              </h2>
              <p className="text-sm text-gray-500">
                This information appears on invoices & documents
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-blue2 text-white rounded-xl flex items-center gap-2"
              >
                <i className="fas fa-pen"></i>
                Edit
              </button>
            )}
          </div>

          <div className="p-8 space-y-10">

            {/* BASIC INFO */}
            <Card title="Basic Information" icon="fa-id-card">
              <Grid>
                <Input
                  label="Company Name *"
                  value={profile.company_name}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("company_name", v)}
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
                <Input label="City" value={profile.city}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("city", v)} />
                <Input label="State" value={profile.state}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("state", v)} />
                <Input label="Postal Code" value={profile.postal_code}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("postal_code", v)} />
              </Grid>
            </Card>

            {/* CONTACT */}
            <Card title="Contact Details" icon="fa-phone">
              <Grid>
                <Input label="Phone" value={profile.phone_number}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("phone_number", v)} />
                <Input label="Email" value={profile.email}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("email", v)} />
                <Input label="Website" value={profile.website}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("website", v)} />
              </Grid>
            </Card>

            {/* TAX */}
            <Card title="Tax & Registration" icon="fa-file-invoice">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={profile.is_vat_registered}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleChange("is_vat_registered", e.target.checked)
                  }
                />
                <span>VAT Registered</span>
              </label>

              {profile.is_vat_registered && (
                <Input
                  label="VAT Number"
                  value={profile.vat_number}
                  disabled={!isEditing}
                  onChange={(v) => handleChange("vat_number", v)}
                />
              )}

              <Input
                label="Corporate Registration Number"
                value={profile.corporate_registration_number}
                disabled={!isEditing}
                onChange={(v) =>
                  handleChange("corporate_registration_number", v)
                }
              />
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
                onChange={(v) =>
                  handleChange("custom_footer_notes", v)
                }
              />
            </Card>

            {/* ACTIONS */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-6 py-2 bg-blue2 text-white rounded-xl flex items-center gap-2"
                >
                  {saving ? (
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
            )}

            {message && (
              <div className="text-sm text-green-600 mt-4">
                {message}
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
  <div className="mb-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue2/10">
        <i className={`fas ${icon} text-blue2 text-sm`}></i>
      </div>
      <h2 className="text-lg font-semibold text-[#1f221f]">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {children}
  </div>
);


const Input = ({ label, value, onChange, disabled }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-600">
      {label}
    </label>

    <input
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all duration-200
        ${disabled 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : "bg-white hover:border-blue2 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 outline-none"
        }`}
    />
  </div>
);

const Textarea = ({ label, value, onChange, disabled }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-600">
      {label}
    </label>

    <textarea
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={`w-full border rounded-xl px-4 py-3 text-sm transition-all duration-200 resize-none
        ${disabled 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : "bg-white hover:border-blue2 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 outline-none"
        }`}
    />
  </div>
);

const ImageUpload = ({ label, value, onChange, disabled, required }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>

    {value ? (
      <div className="relative group">
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue2 transition-all duration-200 shadow-sm">
          <img
            src={value}
            alt="preview"
            className="h-72 w-72 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200"></div>
        </div>
        {!disabled && (
          <>
            <div className="absolute -top-3 -right-3 bg-blue2 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 cursor-pointer hover:bg-blue-700"
                 onClick={() => document.getElementById(`${label}-upload`)?.click()}>
              <i className="fas fa-pen text-sm"></i>
            </div>
            <p className="text-sm text-blue1 mt-3 cursor-pointer hover:underline inline-flex items-center gap-2"
               onClick={() => document.getElementById(`${label}-upload`)?.click()}>
              <i className="fas fa-sync-alt text-xs"></i>
              Change image
            </p>
          </>
        )}
      </div>
    ) : (
      <div 
        onClick={() => !disabled && document.getElementById(`${label}-upload`)?.click()}
        className={`relative group cursor-pointer transition-all duration-200
          ${!disabled ? "cursor-pointer" : "cursor-not-allowed"}`}
      >
        <div className={`h-48 w-72 rounded-xl border-3 border-dashed flex flex-col items-center justify-center text-center p-6 transition-all duration-200
          ${!disabled 
            ? "border-gray-300 group-hover:border-blue2 group-hover:bg-blue-50/50 bg-gray-50" 
            : "border-gray-200 bg-gray-50/30"
          }`}>
          <i className={`fas fa-cloud-upload-alt ${!disabled ? "text-blue1" : "text-gray-400"} text-4xl mb-3 transition-transform group-hover:scale-110`}></i>
          <span className="text-sm font-medium text-gray-600">Click to upload</span>
          <span className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</span>
        </div>
        {!disabled && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-100 pointer-events-none transition-all"></div>
        )}
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


/* ================= COMPONENTS ================= */









