import { useState } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { SunIcon, MoonIcon } from "../../icons";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"parents" | "students">("parents");
  const [activeShowcase, setActiveShowcase] = useState<"dashboard" | "marks" | "children" | "school">("dashboard");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Academic Progress Tracker (APT)",
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Academic Progress Tracker (APT) is an all-in-one student grade tracking and school analytics platform for parents and students to monitor exam marks, visual trends, and school performance.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 font-outfit">
      <Helmet>
        <title>Academic Progress Tracker (APT) | Smart Student Grade & Performance Tracking</title>
        <meta
          name="description"
          content="Academic Progress Tracker (APT) helps parents and students log exam scores, track subject performance trends over time, set grade target goals, and explore UDISE school benchmarks."
        />
        <meta
          name="keywords"
          content="Academic Progress Tracker, APT, student grade tracker, exam marks logger, school performance analytics, parent student portal, UDISE school data, mark sheet calculator"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Academic Progress Tracker (APT) | Elevate Student Performance" />
        <meta
          property="og:description"
          content="Track exam marks, view progressive score analytics, manage multiple children profiles, and set grade goals with Academic Progress Tracker (APT)."
        />
        <meta property="og:url" content="https://apt.app/" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Academic Progress Tracker (APT)" />
        <meta
          name="twitter:description"
          content="The ultimate student mark tracking and visual grade analytics tool for parents and students."
        />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-blue-light-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-bold text-xl">
              APT
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-gray-900 via-brand-600 to-brand-500 dark:from-white dark:via-brand-300 dark:to-brand-400 bg-clip-text text-transparent">
                Academic Progress Tracker
              </span>
              <span className="block text-[10px] uppercase font-semibold text-brand-600 dark:text-brand-400 tracking-wider">
                APT Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#benefits" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
              Benefits
            </a>
            <a href="#features" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
              How It Works
            </a>
            <a href="#showcase" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
              Screenshots
            </a>
            <a href="#faq" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Start for Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-500/20 to-blue-light-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            ✨ Powering Your Academic Decisions with Data
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Transform Exam Marks into{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-blue-light-500 bg-clip-text text-transparent">
              Visual Insights & Better Decisions
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-gray-900 dark:text-white">Academic Progress Tracker (APT)</strong> helps parents and students log test scores, track subject trends over time, compare school performance with UDISE data, and stay on top of academic goals.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-light-600 hover:from-brand-700 hover:to-blue-light-700 text-white font-bold text-lg shadow-xl shadow-brand-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Start for Free Today
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Explore Live Demo
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free Forever Basic Plan
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Multi-Child Support
            </span>
          </div>

          {/* Hero Visual Mockup */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-blue-light-400 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
              {/* Fake Window Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                  apt.app / student-progress / rahul-sharma
                </div>
                <div className="text-xs font-semibold text-brand-500 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-md">
                  LIVE DASHBOARD MOCK
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                {/* Metric Card 1 */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-500/5 border border-brand-200/50 dark:border-brand-800/50">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Overall Score</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">92.4%</div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    ↑ +4.2% from last term
                  </div>
                </div>

                {/* Metric Card 2 */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Target Goal</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">95.0%</div>
                  <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                    Gap: 2.6% remaining
                  </div>
                </div>

                {/* Metric Card 3 */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Top Subject</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Mathematics</div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    98/100 (Grade A1)
                  </div>
                </div>

                {/* Metric Card 4 */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Exams Logged</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">14 Exams</div>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">
                    Term 1 & Mid-Terms
                  </div>
                </div>

                {/* Mock Chart Area */}
                <div className="md:col-span-3 p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Exam Progress Trend Line</h4>
                    <span className="text-xs font-medium text-brand-500">2025-2026 Academic Session</span>
                  </div>
                  {/* SVG Chart Graphic */}
                  <div className="h-44 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#465fff" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#465fff" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 10 120 Q 80 110, 150 75 T 300 45 T 490 20 L 490 140 L 10 140 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M 10 120 Q 80 110, 150 75 T 300 45 T 490 20"
                        fill="none"
                        stroke="#465fff"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Data Points */}
                      <circle cx="10" cy="120" r="5" fill="#465fff" className="animate-pulse" />
                      <circle cx="150" cy="75" r="5" fill="#465fff" />
                      <circle cx="300" cy="45" r="5" fill="#465fff" />
                      <circle cx="490" cy="20" r="6" fill="#3641f5" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-400 mt-2">
                    <span>Unit Test 1 (78%)</span>
                    <span>Quarterly (84%)</span>
                    <span>Mid-Term (89%)</span>
                    <span className="text-brand-600 font-bold">Term 1 Final (92.4%)</span>
                  </div>
                </div>

                {/* Recent Subject Breakdown */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Subject Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>Mathematics</span>
                          <span className="font-bold text-brand-600">98%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-500 h-full rounded-full" style={{ width: "98%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>Science</span>
                          <span className="font-bold text-emerald-600">92%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>English</span>
                          <span className="font-bold text-purple-600">88%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: "88%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline cursor-pointer">
                      View All 6 Subjects →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Parent & Student Benefits Section */}
      <section id="benefits" className="py-20 bg-white dark:bg-gray-900 border-y border-gray-200/70 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              Tailored Value Propositions
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Why Parents & Students Choose APT
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              Academic Progress Tracker (APT) brings clarity, elimination of stress, and actionable insights to every student's learning journey.
            </p>

            {/* Toggle Tabs */}
            <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("parents")}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "parents"
                  ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                👨‍👩‍👧‍👦 Benefits for Parents
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "students"
                  ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                🎓 Benefits for Students
              </button>
            </div>
          </div>

          {/* Benefits Content */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activeTab === "parents" ? (
              <>
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    👨‍👩‍👧
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Multi-Child Single Dashboard</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Easily manage mark sheets, report cards, and target goals for all your children under a single parent account.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    📉
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Early Mark Decline Warning</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Identify subject drops immediately after unit tests rather than waiting for mid-year report cards.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-light-500/10 text-blue-light-600 dark:text-blue-light-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    🏫
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">UDISE School Benchmarking</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Compare your child's school with state and national stats using integrated UDISE school database insights.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    🎯
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Target Score Management</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Set target percentages for term exams and track the exact marks required in remaining tests.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    📊
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subject Strength Analysis</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Instantly identify strong vs weak subjects to prioritize study hours and revision before final board exams.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    🚀
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Exam Prep Readiness</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Track scores sequentially over time to build confidence and maintain momentum during revision cycles.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    🏆
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Milestones & Motivation</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Celebrate score improvements, goal completions, and academic milestones with visual trend highlights.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-4 font-bold">
                    📄
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Student Reports</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Generate clean, shareable summary reports to present at school meetings or study sessions.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Everything You Need to Track & Improve Scores
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              Designed specifically for parents, students, and educators seeking data-driven academic success.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center text-3xl mb-6">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Flexible Mark Logging</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Log marks for Unit Tests, Mid-Terms, Quarterly, Annual, or Competitive Entrance Exams with custom maximum marks and subject weightages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mb-6">
                📈
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interactive Progress Curves</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Visualize score growth across sequential exams over time using interactive line charts, subject bar charts, and overall grade distribution.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl mb-6">
                👨‍👩‍👧‍👦
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Multi-Child Profiles</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Manage distinct profiles for multiple children across different standards, boards (CBSE, ICSE, State), and schools from one single account.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-light-50 dark:bg-blue-light-950 text-blue-light-600 dark:text-blue-light-400 flex items-center justify-center text-3xl mb-6">
                🏫
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Know My School (UDISE)</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Explore real UDISE school data, compare school infrastructure, student-teacher ratios, and academic results across regions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center text-3xl mb-6">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Target Score Calculator</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Set desired target percentages for each subject. APT automatically calculates target gaps and helps set actionable study goals.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mb-6">
                🔒
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Private & Secure Multi-Tenancy</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Strict row-level security ensures your family's mark sheets and child profiles remain completely private and accessible only to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Does It Work Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900 border-y border-gray-200/70 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              Simple 4-Step Process
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              How Academic Progress Tracker Works
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-base">
              Get up and running in under 2 minutes to start tracking your student's scores.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Free Account</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign up with your email in 30 seconds. No credit card or complex setup required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Student Profiles</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter your child's name, grade/standard, school, and core academic subjects.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log Exam Marks</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Record test scores for Unit Tests, Quarterly, or Board Exams as soon as results arrive.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-6">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unlock Visual Insights</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View trend lines, subject breakdown graphs, and target progress recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Screenshots / Interactive Showcase */}
      <section id="showcase" className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              Interface Showcase
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Built for Simplicity & Power
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-base">
              Explore key platform views designed to make academic management effortless.
            </p>

            {/* Showcase selector tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveShowcase("dashboard")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeShowcase === "dashboard"
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                  }`}
              >
                📊 Dashboard View
              </button>
              <button
                onClick={() => setActiveShowcase("marks")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeShowcase === "marks"
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                  }`}
              >
                📝 Marks Logging
              </button>
              <button
                onClick={() => setActiveShowcase("children")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeShowcase === "children"
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                  }`}
              >
                👨‍👩‍👧‍👦 Multi-Child Management
              </button>
              <button
                onClick={() => setActiveShowcase("school")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeShowcase === "school"
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                  }`}
              >
                🏫 Know My School (UDISE)
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="mt-12 max-w-5xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            {activeShowcase === "dashboard" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Academic Dashboard Overview</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">
                    Active Student: Manar Sufiya (Grade 8)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60">
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Current Average</span>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">94.8%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Target Goal</span>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">96.0%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Highest Mark</span>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">100 / 100</div>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Sequential Performance Growth</span>
                    <span className="text-xs text-gray-500">Unit Test 1 ➔ Mid Term ➔ Term 1</span>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-brand-500/10 via-brand-500/20 to-emerald-500/20 rounded-xl border border-brand-200/40 flex items-center justify-center text-sm font-semibold text-brand-600">
                    📈 Interactive Trend Curve Active (91.2% ➔ 93.5% ➔ 94.8%)
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === "marks" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Exam & Mark Logging Module</h3>
                  <span className="text-xs bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-full">
                    Term 1 Board Exam Marks
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Exam Name</th>
                        <th className="p-3">Marks Scored</th>
                        <th className="p-3">Max Marks</th>
                        <th className="p-3">Percentage</th>
                        <th className="p-3">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">Mathematics</td>
                        <td className="p-3">Term 1 Exam</td>
                        <td className="p-3 font-bold text-brand-600">98</td>
                        <td className="p-3">100</td>
                        <td className="p-3 font-semibold">98.0%</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">A1</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">Physics</td>
                        <td className="p-3">Term 1 Exam</td>
                        <td className="p-3 font-bold text-brand-600">94</td>
                        <td className="p-3">100</td>
                        <td className="p-3 font-semibold">94.0%</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">A1</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">Chemistry</td>
                        <td className="p-3">Term 1 Exam</td>
                        <td className="p-3 font-bold text-brand-600">91</td>
                        <td className="p-3">100</td>
                        <td className="p-3 font-semibold">91.0%</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">A1</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeShowcase === "children" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Multi-Child Family Portal</h3>
                  <span className="text-xs bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full">
                    2 Children Connected
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl border-2 border-brand-500 bg-brand-50/20 dark:bg-brand-950/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">
                        MS
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Manar Sufiya</h4>
                        <span className="text-xs text-gray-500">Grade 8 • Roots & Wings School</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-800">
                      <span className="text-xs font-medium">Average: <strong>94.8%</strong></span>
                      <span className="text-xs font-bold text-brand-600">Selected Active Profile</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center">
                        MR
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Md Rayan</h4>
                        <span className="text-xs text-gray-500">Grade 3 • Roots & Wings School</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-800">
                      <span className="text-xs font-medium">Average: <strong>91.2%</strong></span>
                      <button className="text-xs font-bold text-brand-600 hover:underline">Switch to Profile →</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === "school" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">UDISE School Benchmark Explorer</h3>
                  <span className="text-xs bg-blue-light-100 text-blue-light-700 font-bold px-3 py-1 rounded-full">
                    Verified UDISE Dataset
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-blue-light-50/50 dark:bg-blue-light-950/40 border border-blue-light-200 dark:border-blue-light-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Roots & Wings International School (Belahalli)</h4>
                      <span className="text-xs text-gray-500">UDISE Code: 07090100401 • Bengaluru</span>
                    </div>
                    <span className="text-xs bg-emerald-500 text-white font-bold px-3 py-1 rounded-md">
                      Category: Sr. Secondary
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block uppercase">Student-Teacher Ratio</span>
                      <strong className="text-sm text-gray-900 dark:text-white">22 : 1</strong>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block uppercase">Digital Classrooms</span>
                      <strong className="text-sm text-emerald-600">100% Verified</strong>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block uppercase">State Performance Rank</span>
                      <strong className="text-sm text-brand-600">Top 1%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-gray-900 border-t border-gray-200/70 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              Got Questions? We Have Answers.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: "What is Academic Progress Tracker (APT)?",
                a: "APT is a specialized academic performance tracking platform designed for parents and students to log exam marks, monitor visual progress charts over time, set target goals, and evaluate school stats using official UDISE data."
              },
              {
                q: "Is Academic Progress Tracker (APT) free to use?",
                a: "Yes! APT offers a free-forever tier for parents and students. You can log marks, create student profiles, and access progress analytics with zero hidden fees or credit card requirements."
              },
              {
                q: "Can I manage multiple children under one parent account?",
                a: "Absolutely. APT supports multi-child profile management. You can add all your children under one account and switch between their individual dashboards with one click."
              },
              {
                q: "What is the UDISE School integration feature?",
                a: "UDISE (Unified District Information System for Education) provides verified data regarding school infrastructure, student-teacher ratios, and regional stats. APT connects student performance with UDISE data to offer comprehensive school insights."
              },
              {
                q: "How safe is my child's mark data on APT?",
                a: "Data privacy is our highest priority. APT utilizes strict Row-Level Security (RLS) multi-tenancy architecture, ensuring your children's grades and personal details remain completely private."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex justify-between items-center font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl font-mono text-brand-500">{faqOpen === idx ? "−" : "+"}</span>
                </button>
                {faqOpen === idx && (
                  <div className="p-5 pt-0 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-200/60 dark:border-gray-700/60 mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start for Free CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-blue-light-600 text-white p-10 sm:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Ready to Supercharge Your Child's Academic Success?
              </h2>
              <p className="mt-4 text-base sm:text-xl text-brand-100 leading-relaxed">
                Join thousands of proactive parents and students using Academic Progress Tracker (APT) to turn exam marks into visual progress and top grades.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-9 py-4 rounded-2xl bg-white text-brand-700 font-bold text-lg hover:bg-brand-50 shadow-xl transition-all transform hover:-translate-y-1 text-center"
                >
                  Start for Free Now →
                </Link>
              </div>
              <p className="mt-4 text-xs text-brand-200">
                ⚡ Setup takes under 2 minutes • Free Forever Plan Available • Instant Access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
                  APT
                </div>
                <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                  Academic Progress Tracker
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                Academic Progress Tracker (APT) is the premier student grade & mark tracking platform empowering parents and students with visual analytics, goal setting, and school benchmarks.
              </p>
              <div className="text-xs text-gray-400">
                © {new Date().getFullYear()} Academic Progress Tracker (APT). All rights reserved.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="#benefits" className="hover:text-brand-500 transition-colors">Parent Benefits</a></li>
                <li><a href="#benefits" className="hover:text-brand-500 transition-colors">Student Benefits</a></li>
                <li><a href="#features" className="hover:text-brand-500 transition-colors">Key Features</a></li>
                <li><a href="#how-it-works" className="hover:text-brand-500 transition-colors">How It Works</a></li>
                <li><a href="#showcase" className="hover:text-brand-500 transition-colors">Screenshots</a></li>
              </ul>
            </div>

            {/* Account Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Get Started</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link to="/signup" className="hover:text-brand-500 transition-colors font-semibold text-brand-600 dark:text-brand-400">Create Free Account</Link></li>
                <li><Link to="/signin" className="hover:text-brand-500 transition-colors">Sign In to Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-brand-500 transition-colors">Academic Dashboard</Link></li>
                <li><Link to="/know-my-school" className="hover:text-brand-500 transition-colors">UDISE School Search</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link to="https://www.rootsandwings.co.in/simulations" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Simulation</Link></li>
                <li><Link to="https://www.rootsandwings.co.in/resources/websites" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Useful Websites</Link></li>
                <li><Link to="https://www.rootsandwings.co.in/resources/videos" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Useful Channels & Videos</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
