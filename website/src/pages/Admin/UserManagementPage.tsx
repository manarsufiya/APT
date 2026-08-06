import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "parent" | "school_rep";
  subscription_tier: "free" | "premium";
  created_at: string;
  children_count: number;
}

interface Child {
  id: string;
  name: string;
  grade: string;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedUserForChildren, setSelectedUserForChildren] = useState<AdminUser | null>(null);
  const [userChildren, setUserChildren] = useState<Child[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "parent" as "admin" | "parent" | "school_rep",
    subscriptionTier: "free" as "free" | "premium"
  });
  const [newChildName, setNewChildName] = useState("");
  const [newChildGrade, setNewChildGrade] = useState("");

  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("tailadmin_auth_token");
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);
      if (searchQuery) params.append("q", searchQuery);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionMessage(null);
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "User profile created successfully!" });
        setTimeout(() => {
          setShowCreateModal(false);
          setFormData({ email: "", password: "", fullName: "", role: "parent", subscriptionTier: "free" });
          setActionMessage(null);
          fetchUsers();
        }, 1200);
      } else {
        const contentType = res.headers.get("content-type");
        const errData = (contentType && contentType.includes("application/json")) ? await res.json() : {};
        setActionMessage({ type: "error", text: errData.error || "Failed to create user" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Server error creating user" });
    }
  };

  // Update User Handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setActionMessage(null);
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editingUser.full_name,
          email: editingUser.email,
          role: editingUser.role,
          subscriptionTier: editingUser.subscription_tier
        })
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "User profile updated successfully!" });
        setTimeout(() => {
          setEditingUser(null);
          setActionMessage(null);
          fetchUsers();
        }, 1200);
      } else {
        const contentType = res.headers.get("content-type");
        const errData = (contentType && contentType.includes("application/json")) ? await res.json() : {};
        setActionMessage({ type: "error", text: errData.error || "Failed to update user" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Server error updating user" });
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userToDelete: AdminUser) => {
    if (!window.confirm(`Are you sure you want to delete user "${userToDelete.email}"?`)) return;

    try {
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("User deleted successfully!");
        fetchUsers();
      } else {
        const contentType = res.headers.get("content-type");
        const errData = (contentType && contentType.includes("application/json")) ? await res.json() : {};
        alert(errData.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Server error deleting user");
    }
  };

  // Children Management Handlers
  const fetchChildren = async (targetUser: AdminUser) => {
    setSelectedUserForChildren(targetUser);
    const token = localStorage.getItem("tailadmin_auth_token");
    const res = await fetch(`/api/admin/users/${targetUser.id}/children`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUserChildren(data.children || []);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForChildren || !newChildName || !newChildGrade) return;

    const token = localStorage.getItem("tailadmin_auth_token");
    const res = await fetch(`/api/admin/users/${selectedUserForChildren.id}/children`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newChildName, grade: newChildGrade })
    });

    if (res.ok) {
      setNewChildName("");
      setNewChildGrade("");
      fetchChildren(selectedUserForChildren);
      fetchUsers();
    }
  };

  const handleDeleteChild = async (childId: string) => {
    const token = localStorage.getItem("tailadmin_auth_token");
    const res = await fetch(`/api/admin/children/${childId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok && selectedUserForChildren) {
      fetchChildren(selectedUserForChildren);
      fetchUsers();
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto bg-rose-50 dark:bg-rose-950/40 p-6 rounded-2xl border border-rose-200">
          <h2 className="text-xl font-bold text-rose-800 dark:text-rose-300">Access Denied</h2>
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
            This administration page is restricted to Admin users only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin User Management | Student Tracker"
        description="Admin panel to manage parent, student, school representative, and administrator user accounts."
      />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Admin Control Panel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              User Profiles & Roles Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Control parents, school representatives, and internal administrator profiles.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Create New User Profile
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Email, Username, or Full Name..."
              className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="parent">Parents</option>
              <option value="school_rep">School Representatives</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading user accounts...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No users found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/60 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    <th className="py-4 px-6">User / Identity</th>
                    <th className="py-4 px-6">Assigned Role</th>
                    <th className="py-4 px-6">Subscription</th>
                    <th className="py-4 px-6">Children</th>
                    <th className="py-4 px-6">Created On</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900 dark:text-white">{u.full_name || "Unnamed"}</div>
                        <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                              : u.role === "school_rep"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            u.subscription_tier === "premium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {u.subscription_tier}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                        {u.children_count || 0}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => fetchChildren(u)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-xs transition-all"
                        >
                          Children
                        </button>
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 font-semibold text-xs transition-all"
                        >
                          Edit
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-100 font-semibold text-xs transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Create New User Profile</h3>

            {actionMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${actionMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                {actionMessage.text}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Email / Username</label>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. parent@example.com or user.admin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Secret password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Assign Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="parent">Parent</option>
                    <option value="school_rep">School Rep</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Subscription</label>
                  <select
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Edit User Profile</h3>

            {actionMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${actionMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                {actionMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Email / Username</label>
                <input
                  type="text"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="parent">Parent</option>
                    <option value="school_rep">School Rep</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Subscription</label>
                  <select
                    value={editingUser.subscription_tier}
                    onChange={(e) => setEditingUser({ ...editingUser, subscription_tier: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: User's Children Management */}
      {selectedUserForChildren && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Children for {selectedUserForChildren.full_name || selectedUserForChildren.email}
                </h3>
                <p className="text-xs text-gray-500">Admin management of children profiles</p>
              </div>
              <button onClick={() => setSelectedUserForChildren(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Add Child Form */}
            <form onSubmit={handleAddChild} className="flex gap-2 text-sm">
              <input
                type="text"
                required
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Child Name"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              />
              <input
                type="text"
                required
                value={newChildGrade}
                onChange={(e) => setNewChildGrade(e.target.value)}
                placeholder="Grade"
                className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                Add Child
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userChildren.length === 0 ? (
                <div className="text-xs text-gray-400 py-4 text-center">No children profiles logged for this user.</div>
              ) : (
                userChildren.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{c.grade}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteChild(c.id)}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUserForChildren(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
