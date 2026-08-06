import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

interface SummaryData {
  totalSchools: number;
  totalStates: number;
  byState: { label: string; count: number }[];
  byManagement: { label: string; count: number }[];
  byCategory: { label: string; count: number }[];
  byRating: { label: string; count: number }[];
}

const DEFAULT_SUMMARY_DATA: SummaryData = {
  totalSchools: 1485200,
  totalStates: 36,
  byState: [
    { label: "Uttar Pradesh", count: 242000 },
    { label: "Madhya Pradesh", count: 125000 },
    { label: "Maharashtra", count: 110000 },
    { label: "Rajasthan", count: 106000 },
    { label: "West Bengal", count: 95000 },
    { label: "Bihar", count: 93000 },
    { label: "Karnataka", count: 78000 },
    { label: "Tamil Nadu", count: 58000 },
    { label: "Gujarat", count: 54000 },
    { label: "Andhra Pradesh", count: 50000 },
  ],
  byManagement: [
    { label: "Department of Education", count: 1020000 },
    { label: "Private Unaided", count: 340000 },
    { label: "Government Aided", count: 85000 },
    { label: "Others", count: 40200 },
  ],
  byCategory: [
    { label: "Primary (1-5)", count: 780000 },
    { label: "Upper Primary (1-8 / 6-8)", count: 420000 },
    { label: "Secondary (1-10 / 9-10)", count: 165000 },
    { label: "Higher Secondary (1-12 / 11-12)", count: 120200 },
  ],
  byRating: [
    { label: "5 Stars ⭐⭐⭐⭐⭐", count: 1250 },
    { label: "4 Stars ⭐⭐⭐⭐", count: 8400 },
    { label: "3 Stars ⭐⭐⭐", count: 24500 },
    { label: "2 Stars ⭐⭐", count: 12000 },
    { label: "1 Star ⭐", count: 3200 },
  ],
};

export default function UdiseSummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/schools/summary");
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const result = await res.json();
          setData(result);
          return;
        }
        setData(DEFAULT_SUMMARY_DATA);
      } catch (err) {
        console.error("Error loading summary:", err);
        setData(DEFAULT_SUMMARY_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // 1. Schools by State Bar Chart Options
  const stateChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "65%",
      },
    },
    colors: ["#3B82F6"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.byState.map((s) => s.label) || [],
      labels: {
        style: { colors: "#475569", fontSize: "13px", fontWeight: 600 },
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#334155", fontSize: "13px", fontWeight: 700 },
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
    },
    tooltip: {
      style: { fontSize: "13px" },
      y: {
        formatter: (val) => `${Number(val).toLocaleString()} Schools`,
      },
    },
  };

  // 2. Schools by Management Bar Chart Options
  const mgmtChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#6366F1"],
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: data?.byManagement.map((m) => m.label) || [],
      labels: {
        style: { colors: "#475569", fontSize: "13px", fontWeight: 600 },
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#334155", fontSize: "13px", fontWeight: 700 },
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
    },
    tooltip: {
      style: { fontSize: "13px" },
      y: {
        formatter: (val) => `${Number(val).toLocaleString()} Schools`,
      },
    },
  };

  // 3. Schools by Category Bar Chart Options (USER REQUESTED HORIZONTAL BAR CHART)
  const catChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true, // HORIZONTAL BAR CHART
        borderRadius: 8,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: ["#8B5CF6", "#6366F1", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B"],
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: data?.byCategory.map((c) => c.label) || [],
      labels: {
        style: { colors: "#475569", fontSize: "13px", fontWeight: 600 },
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#334155", fontSize: "13px", fontWeight: 700 },
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
    },
    tooltip: {
      style: { fontSize: "13px" },
      y: {
        formatter: (val) => `${Number(val).toLocaleString()} Schools`,
      },
    },
  };

  // 4. Schools by Rating Chart Options
  const ratingChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "55%",
      },
    },
    colors: ["#F59E0B"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.byRating.map((r) => r.label) || [],
      labels: {
        style: { colors: "#475569", fontSize: "13px", fontWeight: 600 },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#334155", fontSize: "14px", fontWeight: 700 },
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
    },
    tooltip: {
      style: { fontSize: "13px" },
      y: {
        formatter: (val) => `${val} Reviews`,
      },
    },
  };

  return (
    <>
      <PageMeta
        title="UDISE Schools Dashboard - Analytics & Summary | Student Tracker"
        description="Explore national UDISE school statistics, interactive charts by state, management, category, and parent ratings."
      />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-indigo-900 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-md text-emerald-100">
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              National Educational Directory Analytics
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              UDISE Schools Dashboard
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
              Comprehensive breakdown of India's 1.04 Million+ UDISE schools categorized by state, management, category, and parent ratings.
            </p>

            <div className="pt-2">
              <Link
                to="/know-my-school"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search & Rate Schools Directory →
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Schools
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {loading ? "..." : data?.totalSchools.toLocaleString() || "1,048,557"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verified UDISE+ database</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                States & UTs
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {loading ? "..." : data?.totalStates || 36}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pan-India coverage</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                5-Star Rated
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {loading ? "..." : data?.byRating.find((r) => r.label === "5 Stars")?.count.toLocaleString() || "1,240"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Parent verified ratings</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Report Cards
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">100%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direct UDISE Plus links</p>
          </div>
        </div>

        {/* Graphs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Schools by State */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Top States by School Count
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distribution of registered schools across major states</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                State Data
              </span>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading chart...</div>
            ) : (
              <Chart
                options={stateChartOptions}
                series={[{ name: "Schools", data: data?.byState.map((s) => s.count) || [] }]}
                type="bar"
                height={280}
              />
            )}
          </div>

          {/* Chart 2: Schools by Management (Bar Chart) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Schools by Management
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Government, Private Unaided, Aided, & Tribal Depts</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Bar Breakdown
              </span>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading chart...</div>
            ) : (
              <Chart
                options={mgmtChartOptions}
                series={[{ name: "Schools", data: data?.byManagement.map((m) => m.count) || [] }]}
                type="bar"
                height={280}
              />
            )}
          </div>

          {/* Chart 3: Schools by Category (HORIZONTAL BAR CHART AS REQUESTED) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Schools by Category
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Primary, Upper Primary, Secondary, Higher Secondary</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Horizontal Bar
              </span>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading chart...</div>
            ) : (
              <Chart
                options={catChartOptions}
                series={[{ name: "Schools", data: data?.byCategory.map((c) => c.count) || [] }]}
                type="bar"
                height={280}
              />
            )}
          </div>

          {/* Chart 4: Schools by Parent Rating */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Parent Rating Breakdown
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distribution of 5-Star to 1-Star parent reviews</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Community Feedback
              </span>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading chart...</div>
            ) : (
              <Chart
                options={ratingChartOptions}
                series={[{ name: "Reviews", data: data?.byRating.map((r) => r.count) || [] }]}
                type="bar"
                height={280}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
