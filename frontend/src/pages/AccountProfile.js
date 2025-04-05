import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getUserCredentials } from '../api/get_usercredentials';

const AccountProfile = ({ setIsLoggedIn, setUserType }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserCredentials();
        
        if (response.success && response.data) {
          setProfile({
            name: response.data.name || 'Unknown',
            email: response.data.email || '',
            userType: response.data.userType || '',
            companyName: response.data.companyName || ''
          });
          setUserType(response.data.userType);
          setError('');
        } else {
          setError(response.message || 'Failed to load profile');
          if (response.message && response.message.toLowerCase().includes('authentication')) {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Profile error:', err);
        setError('Connection to server failed');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, setUserType]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/login');
  };

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      getUserCredentials()
        .then(response => {
          if (response.success && response.data) {
            setProfile({
              name: response.data.name || 'Unknown',
              email: response.data.email || '',
              userType: response.data.userType || '',
              companyName: response.data.companyName || ''
            });
            setUserType(response.data.userType);
            setError('');
          } else {
            setError(response.message || 'Failed to load profile');
          }
        })
        .catch(err => {
          console.error('Retry error:', err);
          setError('Connection error on retry attempt');
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="text-red-600 text-lg mb-4">{error || 'Profile not found'}</div>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleRefresh}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Account Type:</span>
              <span className="capitalize bg-gray-100 px-3 py-1 rounded">
                {profile.userType}
              </span>
            </div>
            
            {profile.companyName && (
              <div className="flex items-center gap-4">
                <span className="font-medium">Company:</span>
                <span className="bg-gray-100 px-3 py-1 rounded">
                  {profile.companyName}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;