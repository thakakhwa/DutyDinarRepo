import React, { useState, useEffect, useContext } from "react";
import { Edit, Save, User, Mail, Building, Calendar, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/profileService";

const Profile = () => {
  const navigate = useNavigate();
  const { handleLogout } = useContext(require("../context/AuthContext").AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    userType: "",
    companyName: "",
    created_at: "",
    currentPassword: "",
    newPassword: "",
    retypeNewPassword: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const userType = localStorage.getItem("userType");
    if (!userType) {
      navigate("/login");
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        setError("Failed to load profile data: " + response.message);
      }
    } catch (err) {
      setError("An error occurred while fetching your profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (profile.newPassword || profile.retypeNewPassword) {
      const { validatePassword } = await import("../utils/passwordValidation");
      const { valid, errors } = validatePassword(profile.newPassword);

      if (!valid) {
        setError("New password is invalid: " + errors.join(" "));
        return;
      }

      if (profile.newPassword !== profile.retypeNewPassword) {
        setError("New password and retype password do not match.");
        return;
      }
    }

    try {
      setLoading(true);
      console.log("Submitting profile update with data:", profile);
      const response = await updateUserProfile(profile);
      console.log("Update profile response:", response);
      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to update profile: " + response.message);
      }
    } catch (err) {
      console.error("Error during profile update:", err);
      setError("An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading && !profile.id) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-green-600 text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 via-white to-green-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/Dashboard" className="inline-flex items-center text-green-700 hover:text-green-900 transition-colors font-semibold">
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </Link>
        </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-200">
            {/* Header */}
            <div className="bg-green-700 text-white p-8 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <User size={48} className="text-green-300" />
                <div>
                  <h1 className="text-3xl font-extrabold tracking-wide">{profile.name || "User"}</h1>
                  <p className="text-green-200 capitalize">{profile.userType || "Account"}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                >
                  <Edit className="mr-2" size={20} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 mx-6 mt-6 rounded-r-md shadow-sm">
                <p>{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-600 text-green-700 p-4 mx-6 mt-6 rounded-r-md shadow-sm">
                <p>{successMessage}</p>
              </div>
            )}

            {/* Profile Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <User className="mr-2 text-green-600" size={20} />
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleChange}
                      className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.name || "Not specified"}</p>
                  )}
                </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <Mail className="mr-2 text-green-600" size={20} />
                  Email
                </label>
                <p className="text-gray-900 text-lg">{profile.email || "Not specified"}</p>
              </div>

              {/* Account Type */}
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <User className="mr-2 text-green-600" size={20} />
                  Account Type
                </label>
                <p className="text-gray-900 capitalize text-lg">{profile.userType || "Not specified"}</p>
              </div>

              {/* Company Name - Only for Sellers */}
              {profile.userType === "seller" && isEditing && (
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <Building className="mr-2 text-green-600" size={20} />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  />
                </div>
              )}
              {profile.userType === "seller" && !isEditing && (
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <Building className="mr-2 text-green-600" size={20} />
                    Company Name
                  </label>
                  <p className="text-gray-900 text-lg">{profile.companyName || "Not specified"}</p>
                </div>
              )}

                {/* Joined Date */}
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <Calendar className="mr-2 text-green-600" size={20} />
                    Joined On
                  </label>
                  <p className="text-gray-900 text-lg">{formatDate(profile.created_at)}</p>
                </div>
              </div>

              {/* Password Fields and Action Buttons in Edit Mode */}
              {isEditing && (
                <>
                  <div className="mt-6">
                    <label className="flex items-center text-gray-700 font-semibold mb-2">
                      <Lock className="mr-2 text-green-600" size={20} />
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={profile.currentPassword || ""}
                      onChange={handleChange}
                      className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center text-gray-700 font-semibold mb-2">
                      <Lock className="mr-2 text-green-600" size={20} />
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={profile.newPassword || ""}
                      onChange={handleChange}
                      className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center text-gray-700 font-semibold mb-2">
                      <Lock className="mr-2 text-green-600" size={20} />
                      Retype New Password
                    </label>
                    <input
                      type="password"
                      name="retypeNewPassword"
                      value={profile.retypeNewPassword || ""}
                      onChange={handleChange}
                      className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Retype new password"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row justify-between items-center mt-8 space-y-4 md:space-y-0 md:space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <div className="flex-grow flex justify-center">
                      <button
                        type="button"
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                        disabled={loading}
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to delete your user account? This action cannot be undone.")) {
                                  if (window.confirm("This is your last chance to cancel. Do you really want to delete your account?")) {
                                    try {
                                      setLoading(true);
                                      const { deleteUser } = await import("../api/profile");
                                      const response = await deleteUser();
                                      if (response.success) {
                                        alert("User deleted successfully. You will be logged out.");
                                        await handleLogout();
                                        // Redirect to login page after deletion
                                        navigate("/login");
                                      } else {
                                        alert("Failed to delete user: " + response.message);
                                      }
                                    } catch (error) {
                                      alert("An error occurred while deleting the user.");
                                    } finally {
                                      setLoading(false);
                                    }
                                  }
                                }
                              }}
                      >
                        Delete User
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                      disabled={loading}
                    >
                      <Save className="mr-2" size={20} />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
