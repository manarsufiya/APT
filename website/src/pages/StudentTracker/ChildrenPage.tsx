import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { api, Child } from "../../lib/api";

export default function ChildrenPage() {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Add form state
  const [childName, setChildName] = useState<string>("");
  const [childGrade, setChildGrade] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit modal state
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editGrade, setEditGrade] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  // Delete modal state
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await api.getChildren();
      setChildrenList(res.children || []);
    } catch (err: any) {
      setError(err.message || "Failed to load children list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !childGrade.trim()) {
      setError("Please enter both child name and grade");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");

      await api.addChild({ name: childName.trim(), grade: childGrade.trim() });
      setChildName("");
      setChildGrade("");
      setSuccessMsg("Child profile created successfully! 🎉");
      await fetchChildren();
    } catch (err: any) {
      setError(err.message || "Failed to add child profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (child: Child) => {
    setEditingChild(child);
    setEditName(child.name);
    setEditGrade(child.grade);
  };

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;
    if (!editName.trim() || !editGrade.trim()) {
      setError("Child name and grade are required");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccessMsg("");

      await api.updateChild(editingChild.id, { name: editName.trim(), grade: editGrade.trim() });
      setEditingChild(null);
      setSuccessMsg("Child profile updated successfully!");
      await fetchChildren();
    } catch (err: any) {
      setError(err.message || "Failed to update child profile");
    } finally {
      setUpdating(false);
    }
  };

  const confirmDeleteChild = async () => {
    if (!deletingChild) return;

    try {
      setDeleting(true);
      setError("");
      setSuccessMsg("");

      await api.deleteChild(deletingChild.id);
      
      const removedName = deletingChild.name;
      setChildrenList((prev) => prev.filter((c) => c.id !== deletingChild.id));
      setDeletingChild(null);
      setSuccessMsg(`${removedName} has been deleted successfully.`);
      await fetchChildren();
    } catch (err: any) {
      setError(err.message || "Failed to delete child profile");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Children Management | Student Academic Progress Tracker"
        description="Add, edit, and manage your children's profiles"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-default dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Children Management 👨‍👩‍👧‍👦
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Register and manage your children's profiles, standard, and academic grades.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Add Child Form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                ➕ Add New Child
              </h2>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Child's Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Smith"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grade / Standard
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 5, Class 10, Year 8"
                    value={childGrade}
                    onChange={(e) => setChildGrade(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-brand-500 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Child Profile"}
                </button>
              </form>
            </div>
          </div>

          {/* Children List */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
                <span>Registered Children ({childrenList.length})</span>
              </h2>

              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading children profiles...</div>
              ) : childrenList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-gray-500 dark:border-gray-700">
                  <p className="text-base font-medium">No children added yet</p>
                  <p className="text-xs mt-1">Use the form on the left to add your first child.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {childrenList.map((child) => (
                    <div
                      key={child.id}
                      className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold dark:bg-brand-950/40 dark:text-brand-400">
                            {child.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">{child.name}</h3>
                            <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                              {child.grade}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                        <button
                          onClick={() => handleOpenEdit(child)}
                          className="flex-1 rounded-lg border border-gray-300 py-1.5 text-xs font-medium text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingChild(child)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Child Modal */}
      {editingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Edit Child Profile</h3>
            <form onSubmit={handleUpdateChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Child's Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grade / Standard
                </label>
                <input
                  type="text"
                  required
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChild(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Child Confirmation Modal */}
      {deletingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Child Profile</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{deletingChild.name}</strong> ({deletingChild.grade})? All corresponding exam marks for this child will also be permanently deleted.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingChild(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteChild}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Child"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
