import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, UserPlus, X } from 'lucide-react';
import { fetchUsers, addUser, editUser, deleteUser } from '../../api/adminUsers';

const UsersPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'buyer',
    companyName: ''
  });

  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    userType: 'buyer',
    companyName: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(searchQuery, selectedFilter, page);
      if (data.success) {
        setUsers(data.data);
        setTotalUsers(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, selectedFilter, page]);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const data = await addUser(newUser);
      if (data.success) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', userType: 'buyer', companyName: '' });
        loadUsers();
      } else {
        alert(data.message || 'Failed to add user');
      }
    } catch (error) {
      alert('Failed to add user');
    }
  };

  const handleEditUser = async () => {
    if (!editUserData.name || !editUserData.email) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const data = await editUser({ id: editUserId, ...editUserData });
      if (data.success) {
        setEditUserId(null);
        setEditUserData({ name: '', email: '', userType: 'buyer', companyName: '' });
        loadUsers();
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const data = await deleteUser(id);
      if (data.success) {
        loadUsers();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const totalPages = Math.ceil(totalUsers / 10);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <UserPlus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            {['all', 'buyers', 'sellers', 'admins'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize
                  ${selectedFilter === filter
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4">Name</th>
                <th className="text-left py-4 px-4">Email</th>
                <th className="text-left py-4 px-4">Type</th>
                <th className="text-left py-4 px-4">Company</th>
                <th className="text-left py-4 px-4">Joined Date</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          user.userType === 'buyer'
                            ? 'bg-blue-100 text-blue-800'
                            : user.userType === 'seller'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.userType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.companyName || '-'}</td>
                    <td className="py-4 px-4 text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditUserId(user.id);
                            setEditUserData({
                              name: user.name,
                              email: user.email,
                              userType: user.userType,
                              companyName: user.companyName || ''
                            });
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalUsers)} of {totalUsers} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                onClick={() => setPage(num + 1)}
                className={`px-4 py-2 rounded-lg hover:bg-gray-50 ${
                  page === num + 1 ? 'bg-green-600 text-white' : 'border'
                }`}
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={newUser.userType}
                onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Company Name (optional)"
                value={newUser.companyName}
                onChange={(e) => setNewUser({ ...newUser, companyName: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <button
                onClick={handleAddUser}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setEditUserId(null)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editUserData.name}
                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={editUserData.userType}
                onChange={(e) => setEditUserData({ ...editUserData, userType: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Company Name (optional)"
                value={editUserData.companyName}
                onChange={(e) => setEditUserData({ ...editUserData, companyName: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <button
                onClick={handleEditUser}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
