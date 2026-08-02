import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      setError("");
      setSuccessMsg("");

      const res = await api.upgradeSubscription();
      updateUser(res.user);
      setSuccessMsg("🎉 Congratulations! You have successfully upgraded to Premium!");
    } catch (err: any) {
      setError(err.message || "Failed to upgrade subscription");
    } finally {
      setUpgrading(false);
    }
  };

  const isPremium = user?.subscriptionTier === "premium";

  return (
    <>
      <PageMeta
        title="Subscription & Pricing | Student Academic Progress Tracker"
        description="View your subscription status and upgrade to premium features"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-default dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Subscription Plans & Premium Access ✨
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Unlock advanced academic analytics, AI weak-point insights, and unlimited multi-child reporting.
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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free Tier */}
          <div
            className={`rounded-2xl border p-6 shadow-default transition-all ${
              !isPremium
                ? "border-brand-500 bg-white ring-2 ring-brand-500/20 dark:bg-gray-900"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Free Starter Plan</h3>
              {!isPremium && (
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  Current Active Plan
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ forever free</span>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">✓ Add up to 2 children profiles</li>
              <li className="flex items-center gap-2">✓ Standard subject performance breakdown</li>
              <li className="flex items-center gap-2">✓ Basic progress trend line charts</li>
              <li className="flex items-center gap-2">✓ RLS database row isolation</li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div
            className={`relative rounded-2xl border p-6 shadow-default transition-all ${
              isPremium
                ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20 dark:bg-gray-900"
                : "border-brand-500 bg-white dark:border-brand-900/50 dark:bg-gray-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Premium Plan ✨</h3>
              {isPremium ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  Active Plan
                </span>
              ) : (
                <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$9.99</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ month billed annually</span>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">🌟 Unlimited children profiles</li>
              <li className="flex items-center gap-2">🌟 Subject weak-point AI insights</li>
              <li className="flex items-center gap-2">🌟 Comprehensive PDF progress export</li>
              <li className="flex items-center gap-2">🌟 Priority parent support</li>
            </ul>

            <div className="mt-8">
              {isPremium ? (
                <div className="w-full rounded-xl bg-emerald-50 py-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                  ✓ Premium Plan Activated
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full rounded-xl bg-brand-500 py-3.5 text-center text-sm font-semibold text-white shadow-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {upgrading ? "Processing Upgrade..." : "Upgrade to Premium ✨"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
