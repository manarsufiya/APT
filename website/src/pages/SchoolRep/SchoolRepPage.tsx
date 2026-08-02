import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";

interface ExtendedDetails {
  udise_code: string;
  website: string;
  google_maps_url: string;
  full_address: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  announcements: string;
}

export default function SchoolRepPage() {
  const { user: currentUser } = useAuth();
  const [searchUdise, setSearchUdise] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ExtendedDetails>({
    udise_code: "",
    website: "",
    google_maps_url: "",
    full_address: "",
    contact_email: "",
    contact_phone: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    announcements: ""
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchExtendedDetails = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/schools/${code}/extended`);
      if (res.ok) {
        const data = await res.json();
        if (data.details) {
          setDetails(data.details);
        } else {
          setDetails({
            udise_code: code,
            website: "",
            google_maps_url: "",
            full_address: "",
            contact_email: "",
            contact_phone: "",
            facebook_url: "",
            twitter_url: "",
            instagram_url: "",
            announcements: ""
          });
        }
      }
    } catch (err) {
      console.error("Error loading extended details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUdise.trim()) return;
    fetchExtendedDetails(searchUdise.trim());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.udise_code) return;

    try {
      setMessage(null);
      const token = localStorage.getItem("tailadmin_auth_token");
      const res = await fetch(`/api/schools/${details.udise_code}/extended`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(details)
      });

      if (res.ok) {
        setMessage({ type: "success", text: "School profile & announcements published successfully!" });
      } else {
        const errData = await res.json();
        setMessage({ type: "error", text: errData.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error saving school details" });
    }
  };

  if (currentUser?.role !== "school_rep" && currentUser?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto bg-amber-50 dark:bg-amber-950/40 p-6 rounded-2xl border border-amber-200">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300">School Representative Access Only</h2>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
            This portal allows authorized school representatives to publish website links, location maps, contact info, and announcements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="School Representative Portal | Student Tracker"
        description="Publish website links, Google maps, contact info, and announcements for your school."
      />

      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            School Representative Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Publish School Profile & Notice Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Provide parents with official contact info, website links, Google Maps directions, and latest announcements.
          </p>
        </div>

        {/* Search School by UDISE */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex gap-3">
          <input
            type="text"
            required
            value={searchUdise}
            onChange={(e) => setSearchUdise(e.target.value)}
            placeholder="Enter your school's UDISE Code (e.g. 35020300702)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load School"}
          </button>
        </form>

        {/* Extended Details Form */}
        {details.udise_code && (
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <span className="text-xs font-bold text-gray-400 font-mono">UDISE CODE: {details.udise_code}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Extended Profile & Contacts</h2>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Official Website URL</label>
                <input
                  type="url"
                  value={details.website}
                  onChange={(e) => setDetails({ ...details, website: e.target.value })}
                  placeholder="https://www.example-school.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Google Maps Location Link</label>
                <input
                  type="url"
                  value={details.google_maps_url}
                  onChange={(e) => setDetails({ ...details, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={details.contact_email}
                  onChange={(e) => setDetails({ ...details, contact_email: e.target.value })}
                  placeholder="admissions@school.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={details.contact_phone}
                  onChange={(e) => setDetails({ ...details, contact_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="text-sm">
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Campus Address</label>
              <input
                type="text"
                value={details.full_address}
                onChange={(e) => setDetails({ ...details, full_address: e.target.value })}
                placeholder="Plot No. 12, Main Sector, City, State - PIN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              />
            </div>

            <div className="text-sm">
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">School Announcements / Parent Notices</label>
              <textarea
                rows={4}
                value={details.announcements}
                onChange={(e) => setDetails({ ...details, announcements: e.target.value })}
                placeholder="e.g. Admissions open for Academic Session 2026-27. Annual Sports Meet on Aug 15."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                Publish Profile Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
