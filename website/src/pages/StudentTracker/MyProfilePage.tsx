import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function MyProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Full Name and Email address are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      const res = await api.updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      });

      updateUser(res.user);
      setSuccessMsg("Profile details updated successfully! ✨");
    } catch (err: any) {
      setError(err.message || "Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError("");

      await api.deleteAccount();
      logout();
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <PageMeta
        title="My Profile | Student Academic Progress Tracker"
        description="View and edit your profile details or delete your parent account"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-default dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            My Profile 👤
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage your personal details, email address, and account preferences.
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
          {/* Profile Overview Card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-3xl font-bold text-white shadow-md">
                {user?.fullName?.charAt(0).toUpperCase() || "P"}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
                {user?.fullName || "Parent User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                <span>Tier:</span>
                <span className="uppercase">{user?.subscriptionTier || "free"} PLAN</span>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 space-y-2">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Account ID:</span>
                  <p className="font-mono text-[11px] truncate">{user?.id}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Role:</span> Parent / Guardian
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                ✏️ Edit Profile Details
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-default dark:border-red-900/50 dark:bg-red-950/20">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                ⚠️ Danger Zone: Delete Account
              </h2>
              <p className="mt-1 text-sm text-red-600/90 dark:text-red-300">
                Permanently remove your parent account. This action cannot be undone and will delete all children profiles and recorded exam marks.
              </p>

              <div className="mt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Account Confirmation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you completely sure you want to delete your account <strong>({user?.email})</strong>? All child profiles and exam score history will be lost forever.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
