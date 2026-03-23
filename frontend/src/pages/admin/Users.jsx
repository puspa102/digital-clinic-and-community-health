import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import {
  authAPI,
  handleApiError,
  getStatusBadgeClass,
  getRoleBadgeClass,
  formatDateTime,
} from "../../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;

      const response = await authAPI.getAllUsers(params);
      console.log("Users API Response:", response);

      if (response.success) {
        const usersData = response.data || [];
        console.log("Users data:", usersData);
        setUsers(usersData);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Users API Error:", err);
      const errorData = handleApiError(err);
      setError(
        errorData.message ||
          "Failed to connect to server. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.role, filters.status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewUser = async (userId) => {
    try {
      setActionLoading(true);
      const response = await authAPI.getUserById(userId);
      if (response.success) {
        setSelectedUser(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await authAPI.updateUserStatus(
        selectedUser.user_id,
        status,
      );
      if (response.success) {
        setShowStatusModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await authAPI.deleteUser(selectedUser.user_id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filter users by search term (client-side)
  const filteredUsers = users.filter((user) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all users, view details, and control access.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total: <span className="font-semibold">{pagination.total}</span>{" "}
              users
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ role: "", status: "", search: "" });
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-12 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          No users found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.user_id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                                {user.full_name?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.full_name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(user.status)}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                            {formatDateTime(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewUser(user.user_id)}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openStatusModal(user)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Change Status"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl shadow-sm px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 dark:text-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  User Details
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl font-bold">
                  {selectedUser.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Role
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(selectedUser.role)}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(selectedUser.status)}`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    User ID
                  </p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    #{selectedUser.user_id}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Joined
                  </p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {formatDateTime(selectedUser.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openStatusModal(selectedUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Status
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Change User Status
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Update status for {selectedUser.full_name}
              </p>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Current status:{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(selectedUser.status)}`}
                >
                  {selectedUser.status}
                </span>
              </p>
              <button
                onClick={() => handleUpdateStatus("approved")}
                disabled={actionLoading || selectedUser.status === "approved"}
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Approve User</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={() => handleUpdateStatus("pending")}
                disabled={actionLoading || selectedUser.status === "pending"}
                className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Set as Pending</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
              <button
                onClick={() => handleUpdateStatus("blocked")}
                disabled={actionLoading || selectedUser.status === "blocked"}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Block User</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </button>
            </div>
            <div className="p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                Delete User
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedUser.full_name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Users;
