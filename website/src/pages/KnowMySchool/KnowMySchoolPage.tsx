import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
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
  avg_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  parent_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface FiltersData {
  states: string[];
  categories: string[];
  managements: string[];
}

export default function KnowMySchoolPage() {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [pinCodeInput, setPinCodeInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedManagement, setSelectedManagement] = useState("");

  // Search execution trigger state
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);

  // Data & Loading state
  const [schools, setSchools] = useState<School[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData>({ states: [], categories: [], managements: [] });
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Review Modal state
  const [activeSchoolForReview, setActiveSchoolForReview] = useState<School | null>(null);
  const [activeSchoolReviewsList, setActiveSchoolReviewsList] = useState<{ school: School; reviews: Review[] } | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Rating form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [parentName, setParentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Filter Dropdowns and Initial Search on Mount
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
        console.error("Error fetching filters:", err);
      } finally {
        setFiltersLoading(false);
      }
    };
    fetchFilters();
  }, []);

  // Execute Search Function
  const executeSearch = useCallback(async (targetPage = 1, targetLimit = limit) => {
    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedState) params.append("state", selectedState);
      if (pinCodeInput.trim()) params.append("pincode", pinCodeInput.trim());
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
  }, [searchQuery, selectedState, pinCodeInput, selectedCategory, selectedManagement, limit]);

  // Initial load search
  useEffect(() => {
    executeSearch(1, limit);
  }, [executeSearch, limit]);

  // Handle Form Submit / Search Button Click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    executeSearch(1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    executeSearch(1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    executeSearch(newPage, limit);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setPinCodeInput("");
    setSelectedCategory("");
    setSelectedManagement("");
    setPage(1);
  };

  // Fetch reviews for a school modal
  const openReviewsModal = async (school: School) => {
    try {
      setReviewsLoading(true);
      setActiveSchoolReviewsList({ school, reviews: [] });
      const res = await fetch(`/api/schools/${school.udise_code}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setActiveSchoolReviewsList({ school, reviews: data.reviews || [] });
      }
    } catch (err) {
      console.error("Error fetching school reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchoolForReview) return;

    try {
      setSubmittingReview(true);
      setReviewMessage(null);

      const token = localStorage.getItem("tailadmin_auth_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/schools/${activeSchoolForReview.udise_code}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          rating,
          comment: commentText,
          parentName: parentName.trim() || "Parent"
        })
      });

      if (res.ok) {
        setReviewMessage({ type: "success", text: "Thank you! Your rating and feedback have been saved." });
        setTimeout(() => {
          setActiveSchoolForReview(null);
          setCommentText("");
          setParentName("");
          setRating(5);
          setReviewMessage(null);
          if (hasSearched) executeSearch(page, limit);
        }, 1200);
      } else {
        const errData = await res.json();
        setReviewMessage({ type: "error", text: errData.error || "Failed to submit review" });
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Render Star Rating
  const renderStars = (avgRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.round(avgRating);
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${isFilled ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <>
      <PageMeta
        title="Know My School - Search UDISE Schools & Ratings | Student Tracker"
        description="Search over 1 million UDISE schools by name, state, PIN code, category, or management. Rate your school and view official UDISE report cards."
      />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Title Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-md text-blue-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Search 1,048,557+ UDISE Schools
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">Know My School</h1>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
              Find official school information, parent reviews, and direct links to government UDISE report cards.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
            <svg className="w-80 h-80 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.5 12.06v5.44L12 22l8.5-4.5v-5.44L12 16.5 3.5 12.06z" />
            </svg>
          </div>
        </div>

        {/* Search & Filter Form */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/60 space-y-4">
          {/* Main Search Input & Explicit Search Button */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter School Name or UDISE Code..."
                className="w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base sm:text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Explicit Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Schools</span>
            </button>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-100 transition-all"
            >
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options Panel */}
          <div className={`${showMobileFilters ? "block" : "hidden md:block"} pt-2 space-y-4`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  State / Union Territory
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={filtersLoading}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
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
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pinCodeInput}
                  onChange={(e) => setPinCodeInput(e.target.value)}
                  placeholder="e.g. 744302"
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  School Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={filtersLoading}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
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
                  Management Type
                </label>
                <select
                  value={selectedManagement}
                  onChange={(e) => setSelectedManagement(e.target.value)}
                  disabled={filtersLoading}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
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

            {(selectedState || pinCodeInput || selectedCategory || selectedManagement || searchQuery) && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Initial Unsearched Landing State */}
        {!hasSearched && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Search School Directory
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              Enter a school name, UDISE code, PIN code, or select filters above and click <strong>Search Schools</strong> to view detailed school cards and official report cards.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/udise-dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-100 transition-all border border-emerald-200 dark:border-emerald-700/50"
              >
                📊 View UDISE Schools Summary & Analytics
              </Link>
            </div>
          </div>
        )}

        {/* Search Results Display Area */}
        {hasSearched && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700/50 text-sm">
              <div className="text-gray-700 dark:text-gray-200 font-medium">
                {loading ? (
                  <span className="inline-flex items-center gap-2 font-bold">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Searching database...
                  </span>
                ) : (
                  <span>
                    Found <strong className="text-gray-900 dark:text-white font-extrabold text-base">{totalSchools.toLocaleString()}</strong> matching schools
                  </span>
                )}
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">Schools per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* School Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.25 11.75h-6M12 18.75h-3m10.5-12.75a3 3 0 01-3 3h-1.5a1.5 1.5 0 01-1.5-1.5V6a3 3 0 013-3h1.5a3 3 0 013 3v.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Schools Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  We couldn't find any schools matching your query. Try adjusting your search term, PIN code, or state.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
                >
                  Clear Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schools.map((school) => {
                  const reportCardUrl = `https://kys.udiseplus.gov.in/#/reportcard/${school.udise_code}/13`;
                  return (
                    <div
                      key={school.udise_code}
                      className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Header: School Name & UDISE Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-block px-3 py-1 rounded-md text-xs font-mono font-extrabold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mb-1.5">
                              UDISE: {school.udise_code}
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                              {school.school_name}
                            </h2>
                          </div>
                        </div>

                        {/* Location Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {school.district}, {school.state}
                          </span>
                          {school.pincode && (
                            <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 text-xs font-mono font-bold">
                              PIN: {school.pincode}
                            </span>
                          )}
                        </div>

                        {/* Category & Management Metadata */}
                        <div className="flex flex-wrap gap-2 pt-1 text-xs sm:text-sm">
                          {school.category && (
                            <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold">
                              {school.category}
                            </span>
                          )}
                          {school.management && (
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">
                              {school.management}
                            </span>
                          )}
                        </div>

                        {/* Rating Summary */}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">{renderStars(school.avg_rating)}</div>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                              {school.avg_rating > 0 ? school.avg_rating.toFixed(1) : "New"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({school.review_count} {school.review_count === 1 ? "review" : "reviews"})
                            </span>
                          </div>

                          {school.review_count > 0 && (
                            <button
                              type="button"
                              onClick={() => openReviewsModal(school)}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Read Reviews
                            </button>
                          )}
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {/* Primary CTA (GREEN) */}
                        <a
                          href={reportCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
                        >
                          <span>Official Report Card</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        {/* Secondary CTA (BLUE) */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSchoolForReview(school);
                            setRating(5);
                            setCommentText("");
                            setReviewMessage(null);
                          }}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Rate & Comment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Page <strong className="text-gray-900 dark:text-white font-black">{page}</strong> of <strong className="text-gray-900 dark:text-white font-black">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all text-xs sm:text-sm"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all text-xs sm:text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Rate & Review School */}
      {activeSchoolForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 relative space-y-5">
            <button
              type="button"
              onClick={() => setActiveSchoolForReview(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Parent Review & Rating
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1 leading-snug">
                {activeSchoolForReview.school_name}
              </h3>
            </div>

            {reviewMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-medium ${reviewMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                {reviewMessage.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= (hoverRating || rating);
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                      >
                        <svg
                          className={`w-8 h-8 ${isSelected ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    );
                  })}
                  <span className="ml-2 font-black text-amber-500">{hoverRating || rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Feedback & Comments</label>
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSchoolForReview(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  {submittingReview ? "Saving..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View School Reviews */}
      {activeSchoolReviewsList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 relative space-y-4 max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={() => setActiveSchoolReviewsList(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Parent Feedback & Ratings
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5 leading-snug">
                {activeSchoolReviewsList.school.school_name}
              </h3>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {reviewsLoading ? (
                <div className="text-center py-8 text-sm text-gray-400">Loading parent reviews...</div>
              ) : activeSchoolReviewsList.reviews.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">No reviews submitted yet for this school.</div>
              ) : (
                activeSchoolReviewsList.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {rev.parent_name}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(rev.rating)}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                    <div className="text-xs text-gray-400 text-right">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSchoolReviewsList(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs"
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
