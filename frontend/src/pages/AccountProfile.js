import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Edit, Save, LogOut } from 'lucide-react';
import { getUserCredentials } from '../api/get_usercredentials'; 

const AccountProfile = ({ setIsLoggedIn, setUserType }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    companyName: '',
    userType: 'buyer',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost/get_profile.php', {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const { data } = await response.json();
        
        setProfileData({
          name: data.name,
          email: data.email,
          userType: data.userType,
          companyName: data.companyName || ''
        });
        setUserType(data.userType);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUserType]);

  // Password strength calculator
  useEffect(() => {
    if (passwordData.newPassword.length > 0) {
      let strength = 0;
      if (passwordData.newPassword.length >= 8) strength += 1;
      if (/[A-Z]/.test(passwordData.newPassword)) strength += 1;
      if (/[0-9]/.test(passwordData.newPassword)) strength += 1;
      if (/[^A-Za-z0-9]/.test(passwordData.newPassword)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [passwordData.newPassword]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch('http://localhost/update_profile.php', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordStrength < 3) {
      setError("New password must have at least 3 strength points");
      return;
    }

    try {
      const response = await fetch('http://localhost/change_password.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "" });
        setShowPasswordForm(false);
      } else {
        throw new Error(data.message || 'Password change failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost/logout.php', {
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      setIsLoggedIn(false);
      setUserType(null);
      navigate("/");
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-600 text-white px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-2xl font-bold">
                    {profileData.name[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <p className="opacity-90">{profileData.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-white/10 px-4 py-2 rounded-lg"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 py-8 space-y-8">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.userType}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {profileData.userType === 'seller' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.companyName}
                        onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Save className="mr-2" size={18} />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Edit className="mr-2" size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </form>

            {/* Password Change Section */}
            {showPasswordForm ? (
              <form onSubmit={handlePasswordChange} className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold">Change Password</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div 
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength >= level 
                              ? level > 2 ? 'bg-green-500' : 'bg-yellow-500' 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t pt-6">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-green-600 hover:text-green-700 flex items-center"
                >
                  <Lock className="mr-2" size={18} />
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;