import React, { useState, useEffect } from "react";
import { getUserData, deleteUser } from "../api/user_api";
import { useNavigate } from "react-router-dom";
import { Package, User, Trash2, Mail, Building, UserCheck } from "lucide-react";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Hard-coded user ID for testing
  const OVERRIDE_USER_ID = 6; // Example: Set to ID 6 for "Anas Ghazal"

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        console.log("Fetching data for user ID:", OVERRIDE_USER_ID);
        const response = await getUserData(OVERRIDE_USER_ID);
        console.log("API Response in component:", response);
        
        if (response && response.success) {
          setUserData(response.data);
          setError(null);
        } else {
          // Handle error response from API
          const errorMessage = response?.message || "Failed to fetch user data";
          console.error("API Error:", errorMessage);
          setError(errorMessage);
          
          // If not authenticated, redirect to login
          if (errorMessage.includes("Authentication required")) {
            navigate("/login");
          }
        }
      } catch (err) {
        console.error("Exception caught:", err);
        setError("Error fetching user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  
  const handleDeleteAccount = async () => {
    if (showDeleteConfirm) {
      try {
        const response = await deleteUser();
        if (response && response.success) {
          // Show success message and redirect to home/login
          alert("Account deleted successfully");
          navigate("/login");
        } else {
          setError(response?.message || "Failed to delete account");
        }
      } catch (err) {
        console.error("Delete account error:", err);
        setError("Error deleting account. Please try again later.");
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
        <p className="ml-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-semibold mt-2">Error</h2>
            <p className="mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Rest of your component remains the same...
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-600 p-6 text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-green-100">Manage your account information</p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* User Details */}
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <User size={24} className="text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{userData?.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Mail size={24} className="text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{userData?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <UserCheck size={24} className="text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-medium capitalize">
                    {userData?.userType || "N/A"}
                  </p>
                </div>
              </div>

              {userData?.companyName && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Building size={24} className="text-green-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{userData.companyName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="mt-10 border border-red-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Danger Zone
              </h3>

              {!showDeleteConfirm ? (
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600 mb-4">
                    Are you sure you want to delete your account? This action
                    cannot be undone and all your data will be permanently
                    removed.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;