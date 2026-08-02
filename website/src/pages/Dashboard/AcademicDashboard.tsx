import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { api, Child, ExamMark } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AcademicDashboard() {
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [marks, setMarks] = useState<ExamMark[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [childrenRes, marksRes] = await Promise.all([
        api.getChildren(),
        api.getMarks(selectedChildId === "all" ? undefined : selectedChildId),
      ]);
      setChildrenList(childrenRes.children || []);
      setMarks(marksRes.marks || []);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChildId]);

  // Compute Metrics
  const filteredMarks = useMemo(() => {
    if (selectedChildId === "all") return marks;
    return marks.filter((m) => m.child_id === selectedChildId);
  }, [marks, selectedChildId]);

  const metrics = useMemo(() => {
    if (filteredMarks.length === 0) {
      return {
        overallAvg: 0,
        topSubject: "N/A",
        topSubjectAvg: 0,
        lowestSubject: "N/A",
        lowestSubjectAvg: 0,
        totalExams: 0,
      };
    }

    let totalScored = 0;
    let totalMax = 0;
    const subjectTotals: Record<string, { scored: number; max: number }> = {};

    filteredMarks.forEach((m) => {
      const scored = Number(m.marks_scored);
      const max = Number(m.max_marks);
      totalScored += scored;
      totalMax += max;

      if (!subjectTotals[m.subject]) {
        subjectTotals[m.subject] = { scored: 0, max: 0 };
      }
      subjectTotals[m.subject].scored += scored;
      subjectTotals[m.subject].max += max;
    });

    const overallAvg = totalMax > 0 ? (totalScored / totalMax) * 100 : 0;

    // Calculate subject averages
    const subjectAverages = Object.entries(subjectTotals).map(([subject, data]) => ({
      subject,
      avg: data.max > 0 ? (data.scored / data.max) * 100 : 0,
    }));

    subjectAverages.sort((a, b) => b.avg - a.avg);

    const topSubjectObj = subjectAverages[0] || { subject: "N/A", avg: 0 };
    const lowestSubjectObj = subjectAverages[subjectAverages.length - 1] || { subject: "N/A", avg: 0 };

    return {
      overallAvg: Math.round(overallAvg * 10) / 10,
      topSubject: topSubjectObj.subject,
      topSubjectAvg: Math.round(topSubjectObj.avg * 10) / 10,
      lowestSubject: lowestSubjectObj.subject,
      lowestSubjectAvg: Math.round(lowestSubjectObj.avg * 10) / 10,
      totalExams: filteredMarks.length,
    };
  }, [filteredMarks]);

  // Subject-wise Breakdown Bar Chart Data
  const subjectChartData = useMemo(() => {
    const subjectTotals: Record<string, { scored: number; max: number }> = {};
    filteredMarks.forEach((m) => {
      const scored = Number(m.marks_scored);
      const max = Number(m.max_marks);
      if (!subjectTotals[m.subject]) {
        subjectTotals[m.subject] = { scored: 0, max: 0 };
      }
      subjectTotals[m.subject].scored += scored;
      subjectTotals[m.subject].max += max;
    });

    const categories = Object.keys(subjectTotals);
    const seriesData = categories.map((subj) => {
      const data = subjectTotals[subj];
      return data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0;
    });

    return {
      categories: categories.length > 0 ? categories : ["No Data"],
      seriesData: seriesData.length > 0 ? seriesData : [0],
    };
  }, [filteredMarks]);

  // Progress Trend Line Chart Data
  const trendChartData = useMemo(() => {
    // Sort marks by date ascending
    const sorted = [...filteredMarks].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const dates = sorted.map((m) => {
      const d = new Date(m.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const percentages = sorted.map((m) => {
      const max = Number(m.max_marks);
      return max > 0 ? Math.round((Number(m.marks_scored) / max) * 100) : 0;
    });

    return {
      dates: dates.length > 0 ? dates : ["No Exams"],
      percentages: percentages.length > 0 ? percentages : [0],
    };
  }, [filteredMarks]);

  // ApexCharts Configs
  const barChartOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 320,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      style: { colors: ["#fff"], fontSize: "12px" },
    },
    xaxis: {
      categories: subjectChartData.categories,
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
        style: { colors: "#64748b" },
      },
    },
    grid: { borderColor: "#e2e8f0" },
  };

  const lineChartOptions: ApexOptions = {
    colors: ["#10b981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 320,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 4,
    },
    markers: {
      size: 6,
      colors: ["#10b981"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    xaxis: {
      categories: trendChartData.dates,
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      max: 100,
      min: 0,
      labels: {
        formatter: (val) => `${val}%`,
        style: { colors: "#64748b" },
      },
    },
    grid: { borderColor: "#e2e8f0" },
  };

  return (
    <>
      <PageMeta
        title="Student Academic Tracker | TailAdmin"
        description="Comprehensive Student Academic Progress Tracker Dashboard connected with Supabase"
      />

      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-6 shadow-default dark:bg-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Academic Progress Tracker 🎓
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back, {user?.fullName || user?.email || "Parent"}! Track your children's grades and subject insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Child Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="childSelect" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Child:
              </label>
              <select
                id="childSelect"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="all">All Children ({childrenList.length})</option>
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade})
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/children"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 transition"
            >
              + Add Child
            </Link>
            <Link
              to="/marks"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition"
            >
              + Add Exam Mark
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Key Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Overall Average */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Overall Average
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                📊
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {metrics.overallAvg}%
              </span>
              <span className="text-xs text-gray-500">across all exams</span>
            </div>
          </div>

          {/* Card 2: Top Subject */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Top Subject
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                🏆
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.topSubject}
              </span>
              {metrics.topSubject !== "N/A" && (
                <span className="ml-2 text-xs font-semibold text-emerald-600">
                  ({metrics.topSubjectAvg}%)
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Needs Improvement */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Needs Improvement
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                ⚠️
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.lowestSubject}
              </span>
              {metrics.lowestSubject !== "N/A" && (
                <span className="ml-2 text-xs font-semibold text-amber-600">
                  ({metrics.lowestSubjectAvg}%)
                </span>
              )}
            </div>
          </div>

          {/* Card 4: Total Exams Recorded */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Exams Recorded
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                📝
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {metrics.totalExams}
              </span>
              <span className="ml-2 text-xs text-gray-500">tests evaluated</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar Chart: Subject-wise Performance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Subject-Wise Performance Breakdown 📊
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Average percentage scored in each subject
                </p>
              </div>
            </div>
            {filteredMarks.length > 0 ? (
              <Chart
                options={barChartOptions}
                series={[{ name: "Average Score %", data: subjectChartData.seriesData }]}
                type="bar"
                height={320}
              />
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center rounded-xl bg-gray-50 text-gray-500 dark:bg-gray-900/50">
                <p className="text-sm font-medium">No exam marks recorded yet.</p>
                <Link to="/add-data" className="mt-2 text-xs text-brand-500 hover:underline">
                  + Add First Exam Record
                </Link>
              </div>
            )}
          </div>

          {/* Line Chart: Overall Progress Trend */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Academic Progress Trend 📈
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Exam score percentage over time
                </p>
              </div>
            </div>
            {filteredMarks.length > 0 ? (
              <Chart
                options={lineChartOptions}
                series={[{ name: "Exam Score %", data: trendChartData.percentages }]}
                type="line"
                height={320}
              />
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center rounded-xl bg-gray-50 text-gray-500 dark:bg-gray-900/50">
                <p className="text-sm font-medium">No exam marks recorded yet.</p>
                <Link to="/add-data" className="mt-2 text-xs text-brand-500 hover:underline">
                  + Add First Exam Record
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exam Marks Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Exam Marks
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Detailed record of all logged test evaluations
              </p>
            </div>
            <Link
              to="/add-data"
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              Manage Marks &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Child Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Exam Name</th>
                  <th className="px-4 py-3">Marks Scored</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMarks.length > 0 ? (
                  filteredMarks.slice(0, 10).map((m) => {
                    const pct = Math.round((Number(m.marks_scored) / Number(m.max_marks)) * 100);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {m.child_name || "N/A"} ({m.grade || ""})
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                          {m.subject}
                        </td>
                        <td className="px-4 py-3">{m.exam_name}</td>
                        <td className="px-4 py-3">
                          {m.marks_scored} / {m.max_marks}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              pct >= 85
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : pct >= 70
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : pct >= 50
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(m.date).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No exam marks logged yet. Click "+ Add Marks / Child" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
