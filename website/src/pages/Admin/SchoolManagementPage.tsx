import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";

interface School {
  udise_code: string;
  school_name: string;
  district: string;
  block: string;
  state: string;
  management: string;
  category: string;
  pincode: string;
}

interface FiltersData {
  states: string[];
  categories: string[];
  managements: string[];
}

export default function SchoolManagementPage() {
  const { user: currentUser } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedManagement, setSelectedManagement] = useState("");

  // Pagination & Results state
  const [schools, setSchools] = useState<School[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData>({ states: [], categories: [], managements: [] });
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const [formData, setFormData] = useState<School>({
    udise_code: "",
    school_name: "",
    district: "",
    block: "",
    state: "",
    management: "Department of Education",
    category: "Primary",
    pincode: ""
  });

  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Filter Dropdowns on Mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFiltersLoading(true);
        const res = await fetch("/api/schools/filters");
        if (res.ok) {
          const data = await res.json();
          setFiltersData(data);
        }
      } catch (err) {
        console.error("Error loading filters:", err);
      } finally {
        setFiltersLoading(false);
      }
    };
    fetchFilters();
  }, []);

  // Execute Search
  const executeSearch = useCallback(async (targetPage = 1, targetLimit = limit) => {
    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedState) params.append("state", selectedState);
      if (pincodeInput.trim()) params.append("pincode", pincodeInput.trim());
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedManagement) params.append("management", selectedManagement);
      params.append("page", targetPage.toString());
      params.append("limit", targetLimit.toString());

      const res = await fetch(`/api/schools/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schools || []);
        setTotalSchools(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error searching schools:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedState, pincodeInput, selectedCategory, selectedManagement, limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    executeSearch(1, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    executeSearch(newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    if (hasSearched) {
      executeSearch(1, newLimit);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setPincodeInput("");
    setSelectedCategory("");
    setSelectedManagement("");
    setHasSearched(false);
    setSchools([]);
    setTotalSchools(0);
    setPage(1);
  };

  // Create School Handler
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionMessage(null);
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "School created successfully!" });
        setTimeout(() => {
          setShowAddModal(false);
          setFormData({ udise_code: "", school_name: "", district: "", block: "", state: "", management: "Department of Education", category: "Primary", pincode: "" });
          setActionMessage(null);
          if (hasSearched) executeSearch(page, limit);
        }, 1200);
      } else {
        const contentType = res.headers.get("content-type");
        const errData = (contentType && contentType.includes("application/json")) ? await res.json() : {};
        setActionMessage({ type: "error", text: errData.error || "Failed to create school" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Server error creating school" });
    }
  };

  // Update School Handler
  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    try {
      setActionMessage(null);
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch(`/api/admin/schools/${editingSchool.udise_code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingSchool)
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "School updated successfully!" });
        setTimeout(() => {
          setEditingSchool(null);
          setActionMessage(null);
          executeSearch(page, limit);
        }, 1200);
      } else {
        const contentType = res.headers.get("content-type");
        const errData = (contentType && contentType.includes("application/json")) ? await res.json() : {};
        setActionMessage({ type: "error", text: errData.error || "Failed to update school" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Server error updating school" });
    }
  };

  // Delete School Handler
  const handleDeleteSchool = async (schoolToDelete: School) => {
    if (!window.confirm(`Are you sure you want to delete "${schoolToDelete.school_name}" (UDISE: ${schoolToDelete.udise_code})?`)) return;

    try {
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch(`/api/admin/schools/${schoolToDelete.udise_code}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("School deleted successfully!");
        executeSearch(page, limit);
      } else {
        const contentType = res.headers.get("content-type");
        const errData = (contentType && contentType.includes("application/json")) ? await res.json() : {};
        alert(errData.error || "Failed to delete school");
      }
    } catch (err) {
      alert("Server error deleting school");
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
        title="Admin School Directory Management | Student Tracker"
        description="Admin tool to search by name, UDISE code, State, PIN code, Category, or Management, add new schools, edit existing school attributes, or delete schools."
      />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Directory Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              School Directory Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Multi-criteria search by School Name, UDISE Code, State, PIN Code, Category, or Management.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New School
          </button>
        </div>

        {/* Multi-Criteria Search & Filters Panel */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          {/* Main Name / Code Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by School Name or UDISE Code..."
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Directory</span>
            </button>
          </div>

          {/* Advanced Filters Grid: State, PIN Code, Category, Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled={filtersLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All States</option>
                {filtersData.states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Filter by PIN Code
              </label>
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="e.g. 744302"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={filtersLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                {filtersData.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Filter by Management
              </label>
              <select
                value={selectedManagement}
                onChange={(e) => setSelectedManagement(e.target.value)}
                disabled={filtersLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Managements</option>
                {filtersData.managements.map((mgmt) => (
                  <option key={mgmt} value={mgmt}>
                    {mgmt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedState || pincodeInput || selectedCategory || selectedManagement || searchQuery) && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
              >
                Reset Search & Filters
              </button>
            </div>
          )}
        </form>

        {/* Results List */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden space-y-0">
          {hasSearched && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 border-b border-gray-100 dark:border-gray-700 text-sm">
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Found <strong className="text-gray-900 dark:text-white font-extrabold">{totalSchools.toLocaleString()}</strong> matching schools
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">Results per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Searching schools database...</div>
          ) : !hasSearched ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Use the search bar or criteria dropdowns above (State, PIN Code, Category, Management) to locate schools, or click <strong>Add New School</strong>.
            </div>
          ) : schools.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No schools found matching search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/60 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    <th className="py-4 px-6">UDISE Code</th>
                    <th className="py-4 px-6">School Name</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Category & Management</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                  {schools.map((s) => (
                    <tr key={s.udise_code} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">{s.udise_code}</td>
                      <td className="py-4 px-6 font-extrabold text-gray-900 dark:text-white">{s.school_name}</td>
                      <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300">
                        <div>{s.district}, {s.state}</div>
                        {s.pincode && <div className="font-mono text-gray-400">PIN: {s.pincode}</div>}
                      </td>
                      <td className="py-4 px-6 text-xs space-y-1">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">{s.category}</div>
                        <div className="text-gray-500">{s.management}</div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setEditingSchool(s)}
                          className="px-3.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(s)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 font-bold text-xs hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {hasSearched && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-700 text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Page <strong className="text-gray-900 dark:text-white">{page}</strong> of <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add School */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Add New School Record</h3>

            {actionMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${actionMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                {actionMessage.text}
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">UDISE Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.udise_code}
                    onChange={(e) => setFormData({ ...formData, udise_code: e.target.value })}
                    placeholder="e.g. 18060806805"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 744302"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  placeholder="Official School Name"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="District"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Block</label>
                  <input
                    type="text"
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    placeholder="Block"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Primary, Secondary"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Management</label>
                  <input
                    type="text"
                    value={formData.management}
                    onChange={(e) => setFormData({ ...formData, management: e.target.value })}
                    placeholder="e.g. Department of Education"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit School */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Edit School: {editingSchool.udise_code}
            </h3>

            {actionMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${actionMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                {actionMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateSchool} className="space-y-3 text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={editingSchool.school_name}
                  onChange={(e) => setEditingSchool({ ...editingSchool, school_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    value={editingSchool.state}
                    onChange={(e) => setEditingSchool({ ...editingSchool, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <input
                    type="text"
                    value={editingSchool.district}
                    onChange={(e) => setEditingSchool({ ...editingSchool, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editingSchool.pincode}
                    onChange={(e) => setEditingSchool({ ...editingSchool, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingSchool.category}
                    onChange={(e) => setEditingSchool({ ...editingSchool, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Management</label>
                  <input
                    type="text"
                    value={editingSchool.management}
                    onChange={(e) => setEditingSchool({ ...editingSchool, management: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
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
    </>
  );
}
