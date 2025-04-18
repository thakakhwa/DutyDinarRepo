import React, { useState, useEffect } from "react";
import { Edit, Save, User, Mail, Building, Calendar, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Fixed import path to use relative path
import { getUserProfile, updateUserProfile } from "../api/profileService";

const Profile = () => {
  const navigate = useNavigate();
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
    created_at: ""
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Debug: Log localStorage values
    console.log("User info in localStorage:", {
      userId: localStorage.getItem("userId"),
      userType: localStorage.getItem("userType")
    });

    // Check if user is logged in
    const userType = localStorage.getItem("userType");
    if (!userType) {
      console.log("No userType found, redirecting to login");
      navigate("/login");
      return;
    }

    // Fetch user profile
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log("Fetching user profile...");
      const response = await getUserProfile();
      console.log("Profile fetch response:", response);
      
      if (response.success) {
        setProfile(response.data);
        console.log("Profile data set successfully");
      } else {
        console.error("API returned failure:", response.message);
        setError("Failed to load profile data: " + response.message);
      }
    } catch (err) {
      console.error("Exception in profile fetch:", err);
      setError("An error occurred while fetching your profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Submitting profile update:", profile);
      const response = await updateUserProfile(profile);
      console.log("Profile update response:", response);
      
      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        console.error("API update returned failure:", response.message);
        setError("Failed to update profile: " + response.message);
      }
    } catch (err) {
      console.error("Exception in profile update:", err);
      setError("An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString; // Return the original string if formatting fails
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header with background color */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">User Profile</h1>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-6 mt-6">
              <p>{error}</p>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 mx-6 mt-6">
              <p>{successMessage}</p>
            </div>
          )}

          {/* Profile Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <User className="mr-2" size={18} />
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name || "Not specified"}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <Mail className="mr-2" size={18} />
                    Email
                  </label>
                  <p className="text-gray-900">{profile.email || "Not specified"}</p>
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <User className="mr-2" size={18} />
                    Account Type
                  </label>
                  <p className="text-gray-900 capitalize">{profile.userType || "Not specified"}</p>
                </div>

                {/* Company Name - Only for Sellers */}
                {profile.userType === "seller" && (
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium">
                      <Building className="mr-2" size={18} />
                      Company Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={profile.companyName || ""}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.companyName || "Not specified"}</p>
                    )}
                  </div>
                )}

                {/* Joined Date */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <Calendar className="mr-2" size={18} />
                    Joined On
                  </label>
                  <p className="text-gray-900">{formatDate(profile.created_at)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                      disabled={loading}
                    >
                      <Save className="mr-2" size={18} />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Edit className="mr-2" size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Actions Card */}
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/change-password" 
                className="block w-full p-3 border border-gray-300 rounded-md text-center text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Change Password
              </Link>
              {profile.userType === "buyer" && (
                <Link 
                  to="/order-history" 
                  className="block w-full p-3 border border-gray-300 rounded-md text-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Order History
                </Link>
              )}
              {profile.userType === "seller" && (
                <Link 
                  to="/manage-listings" 
                  className="block w-full p-3 border border-gray-300 rounded-md text-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Manage Listings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;