import React, { useState } from 'react';
import axios from 'axios';
import useAuth from "../auth/useAuth";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    companyName: 'bigco',
    username: 'admin',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim() || !formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const companySlug = formData.companyName.toLowerCase().trim().replace(/\s+/g, '');
    
    setLoading(true);

    try {
      const apiUrl = `http://${companySlug}.localhost:8000/login/`;
      
      console.log('API URL:', apiUrl);
      
      const response = await axios.post(apiUrl, {
        role: formData.username,
        password: formData.password,
      });

      // Store data
      login({
  access: response.data.access,
  refresh: response.data.refresh,
  username: response.data.username,
  companySlug,
  companyName: formData.companyName,
});
window.location.href = "/";

      if (rememberMe) {
        localStorage.setItem('remembered_company', formData.companyName);
      } else {
        localStorage.removeItem('remembered_company');
      }

      console.log('Login successful:', response.data);
      
      if (onLogin) {
        onLogin({
          ...response.data,
          companyName: formData.companyName,
          companySlug: companySlug
        });
      }

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError('Invalid request format');
            break;
          case 401:
            setError('Invalid username or password');
            break;
          case 404:
            setError(`Company "${formData.companyName}" not found`);
            break;
          case 500:
            setError('Server error. Please try again later');
            break;
          default:
            setError(`Login failed: ${err.response.data?.detail || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError(`Cannot connect to ${formData.companyName}.localhost:8000. Check your network.`);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load remembered company on mount
  React.useEffect(() => {
    const rememberedCompany = localStorage.getItem('remembered_company');
    if (rememberedCompany) {
      setFormData(prev => ({ ...prev, companyName: rememberedCompany }));
      setRememberMe(true);
    }
  }, []);

  const loadDemoCredentials = (company = 'bigco') => {
    setFormData({
      companyName: company,
      username: 'admin',
      password: 'admin123'
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-blue1 flex items-center justify-center p-4 md:p-0">
      {/* Main Container */}
      <div className="w-full max-w-6xl h-auto md:h-[90vh] min-h-[500px] md:min-h-[600px] max-h-[900px] flex flex-col md:flex-row rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl overflow-hidden border border-gray-200/30 md:border-gray-200/50 bg-white">
        
        {/* Left Side - Info Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue1/10 via-blue2/10 to-blue1/5 p-6 md:p-8 lg:p-12 relative overflow-hidden order-2 md:order-1">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-40 h-40 md:w-64 md:h-64 rounded-full bg-blue1/20 blur-2xl md:blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 md:w-80 md:h-80 rounded-full bg-blue2/20 blur-2xl md:blur-3xl"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo - Visible on mobile too */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue1 to-blue2 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg md:text-xl font-bold">M</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Meray CRM</h1>
                <p className="text-xs md:text-sm text-gray-600">Multi-tenant CRM Platform</p>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-grow">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Welcome Back
              </h2>
              <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                Streamline your customer relationships, track leads, and grow your business with our powerful CRM platform designed for multi-company management.
              </p>
              
              {/* Features List */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-users text-blue2 text-xs md:text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">Multi-tenant Architecture</p>
                    <p className="text-gray-600 text-xs md:text-sm">Separate data for each company</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-chart-line text-blue2 text-xs md:text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">Real-time Analytics</p>
                    <p className="text-gray-600 text-xs md:text-sm">Track sales and customer metrics</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-tasks text-blue2 text-xs md:text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">Workflow Automation</p>
                    <p className="text-gray-600 text-xs md:text-sm">Automate repetitive tasks</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* API Info - Bottom */}
            <div className="pt-4 md:pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>API Endpoint:</strong>
              </p>
              <div className="bg-gray-50 p-2 md:p-3 rounded-lg font-mono text-xs text-gray-700 break-all">
                POST http://{formData.companyName ? formData.companyName.toLowerCase().replace(/\s+/g, '') : 'company'}.localhost:8000/login/
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-5 md:p-8 lg:p-10 flex flex-col justify-center order-1 md:order-2">
          {/* Mobile Logo - Hidden on desktop */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue1 to-blue2 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Meray CRM</h1>
              <p className="text-xs text-gray-600">Sign in to your company dashboard</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Company Login</h2>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
              Enter your company name, username, and password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-3 text-sm md:text-base"></i>
              <span className="text-red-700 text-xs md:text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-3.5 flex items-center pointer-events-none">
                  <i className="fas fa-building text-gray-400 group-focus-within:text-blue2 transition-colors text-sm md:text-base"></i>
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-3 md:py-3.5 border border-gray-300 rounded-xl focus:border-blue2 focus:ring-2 focus:ring-blue2/20 focus:outline-none transition-all duration-200 text-gray-900 bg-white text-sm md:text-base"
                  placeholder="e.g., bigco"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Subdomain: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                  {formData.companyName.toLowerCase().replace(/\s+/g, '')}.localhost:8000
                </code>
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-3.5 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400 group-focus-within:text-blue2 transition-colors text-sm md:text-base"></i>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-3 md:py-3.5 border border-gray-300 rounded-xl focus:border-blue2 focus:ring-2 focus:ring-blue2/20 focus:outline-none transition-all duration-200 text-gray-900 bg-white text-sm md:text-base"
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-800">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-xs md:text-sm text-blue2 font-medium hover:text-blue1 transition-colors"
                  onClick={() => alert('Contact your administrator to reset password')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-3.5 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400 group-focus-within:text-blue2 transition-colors text-sm md:text-base"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 md:pl-11 pr-10 md:pr-11 py-3 md:py-3.5 border border-gray-300 rounded-xl focus:border-blue2 focus:ring-2 focus:ring-blue2/20 focus:outline-none transition-all duration-200 text-gray-900 bg-white text-sm md:text-base"
                  placeholder="Enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 md:pr-3.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 hover:text-gray-600 text-sm md:text-base`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Demo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center group w-fit"
              >
                <div className={`w-4 h-4 md:w-5 md:h-5 rounded border flex items-center justify-center mr-2 md:mr-3 transition-all duration-200 ${
                  rememberMe 
                    ? 'bg-blue2 border-blue2' 
                    : 'bg-white border-gray-300 group-hover:border-blue2'
                }`}>
                  {rememberMe && <i className="fas fa-check text-white text-xs"></i>}
                </div>
                <span className="text-xs md:text-sm text-gray-700 group-hover:text-gray-900">Remember company</span>
              </button>

              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => loadDemoCredentials('bigco')}
                  className="text-xs md:text-sm text-blue2 font-medium hover:text-blue1 transition-colors flex items-center gap-1 md:gap-2 px-2 py-1 bg-blue2/5 rounded-lg"
                >
                  <i className="fas fa-building text-xs"></i>
                  BigCo
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoCredentials('startup')}
                  className="text-xs md:text-sm text-blue2 font-medium hover:text-blue1 transition-colors flex items-center gap-1 md:gap-2 px-2 py-1 bg-blue2/5 rounded-lg"
                >
                  <i className="fas fa-rocket text-xs"></i>
                  Startup
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoCredentials('company1')}
                  className="text-xs md:text-sm text-blue2 font-medium hover:text-blue1 transition-colors flex items-center gap-1 md:gap-2 px-2 py-1 bg-blue2/5 rounded-lg"
                >
                  <i className="fas fa-briefcase text-xs"></i>
                  Company1
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 px-6 bg-gradient-to-r from-blue1 to-blue2 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue1/95 hover:to-blue2/95 focus:outline-none focus:ring-2 focus:ring-blue2/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2 md:mr-3 text-sm md:text-base"></i>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="fas fa-sign-in-alt mr-2 md:mr-3 text-sm md:text-base"></i>
                  Sign In to Dashboard
                </span>
              )}
            </button>
          </form>



          {/* Footer */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 text-center">
       
            <p className="text-xs text-gray-400 mt-1 md:mt-2">
              © {new Date().getFullYear()} Meray CRM. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;