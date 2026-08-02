import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { api, Child, ExamMark } from "../../lib/api";

const COMMON_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Physics", "Chemistry", "Biology", "History", "Computer Science", "Geography", "Art"];

export default function MarksPage() {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [marksList, setMarksList] = useState<ExamMark[]>([]);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Record Exam Mark Form
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [subject, setSubject] = useState<string>("Mathematics");
  const [customSubject, setCustomSubject] = useState<string>("");
  const [examName, setExamName] = useState<string>("");
  const [marksScored, setMarksScored] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<string>("100");
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [submittingMark, setSubmittingMark] = useState<boolean>(false);

  // Edit Exam Mark State
  const [editingMark, setEditingMark] = useState<ExamMark | null>(null);
  const [editChildId, setEditChildId] = useState<string>("");
  const [editSubject, setEditSubject] = useState<string>("Mathematics");
  const [editCustomSubject, setEditCustomSubject] = useState<string>("");
  const [editExamName, setEditExamName] = useState<string>("");
  const [editMarksScored, setEditMarksScored] = useState<string>("");
  const [editMaxMarks, setEditMaxMarks] = useState<string>("100");
  const [editExamDate, setEditExamDate] = useState<string>("");
  const [updatingMark, setUpdatingMark] = useState<boolean>(false);

  // Delete Exam Mark State
  const [deletingMark, setDeletingMark] = useState<ExamMark | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [childRes, markRes] = await Promise.all([
        api.getChildren(),
        api.getMarks(selectedChildFilter || undefined),
      ]);

      const loadedChildren = childRes.children || [];
      setChildrenList(loadedChildren);
      setMarksList(markRes.marks || []);

      if (loadedChildren.length > 0 && !selectedChildId) {
        setSelectedChildId(loadedChildren[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load exam marks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChildFilter]);

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
      setError("Please select a child profile first");
      return;
    }

    const finalSubject = subject === "Custom" ? customSubject.trim() : subject;
    if (!finalSubject) {
      setError("Please specify the exam subject");
      return;
    }

    if (!examName.trim() || !marksScored || !maxMarks) {
      setError("Please fill out all required exam details");
      return;
    }

    const scoredNum = parseFloat(marksScored);
    const maxNum = parseFloat(maxMarks);

    if (isNaN(scoredNum) || isNaN(maxNum) || maxNum <= 0) {
      setError("Please enter valid positive numbers for marks");
      return;
    }

    if (scoredNum > maxNum) {
      setError("Marks scored cannot exceed total max marks");
      return;
    }

    try {
      setSubmittingMark(true);
      setError("");
      setSuccessMsg("");

      await api.addMark({
        childId: selectedChildId,
        subject: finalSubject,
        examName: examName.trim(),
        marksScored: scoredNum,
        maxMarks: maxNum,
        date: examDate,
      });

      setExamName("");
      setMarksScored("");
      setSuccessMsg("Exam mark recorded successfully! 📊");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to record exam mark");
    } finally {
      setSubmittingMark(false);
    }
  };

  const handleOpenEditModal = (mark: ExamMark) => {
    setEditingMark(mark);
    setEditChildId(mark.child_id);

    if (COMMON_SUBJECTS.includes(mark.subject)) {
      setEditSubject(mark.subject);
      setEditCustomSubject("");
    } else {
      setEditSubject("Custom");
      setEditCustomSubject(mark.subject);
    }

    setEditExamName(mark.exam_name);
    setEditMarksScored(String(mark.marks_scored));
    setEditMaxMarks(String(mark.max_marks));
    setEditExamDate(mark.date ? mark.date.split("T")[0] : new Date().toISOString().split("T")[0]);
  };

  const handleUpdateMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMark) return;

    if (!editChildId) {
      setError("Please select a child profile");
      return;
    }

    const finalSubject = editSubject === "Custom" ? editCustomSubject.trim() : editSubject;
    if (!finalSubject) {
      setError("Please specify the subject name");
      return;
    }

    if (!editExamName.trim() || !editMarksScored || !editMaxMarks) {
      setError("All fields are required");
      return;
    }

    const scoredNum = parseFloat(editMarksScored);
    const maxNum = parseFloat(editMaxMarks);

    if (isNaN(scoredNum) || isNaN(maxNum) || maxNum <= 0) {
      setError("Please enter valid positive numbers for marks");
      return;
    }

    if (scoredNum > maxNum) {
      setError("Marks scored cannot exceed total max marks");
      return;
    }

    try {
      setUpdatingMark(true);
      setError("");
      setSuccessMsg("");

      await api.updateMark(editingMark.id, {
        childId: editChildId,
        subject: finalSubject,
        examName: editExamName.trim(),
        marksScored: scoredNum,
        maxMarks: maxNum,
        date: editExamDate,
      });

      setEditingMark(null);
      setSuccessMsg("Exam record updated successfully! ✨");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update exam record");
    } finally {
      setUpdatingMark(false);
    }
  };

  const confirmDeleteMark = async () => {
    if (!deletingMark) return;

    try {
      setDeleting(true);
      setError("");
      setSuccessMsg("");

      await api.deleteMark(deletingMark.id);
      setMarksList((prev) => prev.filter((m) => m.id !== deletingMark.id));
      setDeletingMark(null);
      setSuccessMsg("Exam record deleted successfully.");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete exam record");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Exam Marks Management | Student Academic Progress Tracker"
        description="Log, edit, and manage exam results and marks scored by children"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-default dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Exam Marks Management 📊
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Record, edit, view, and organize test results for your children.
            </p>
          </div>

          {/* Child Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Filter Child:</span>
            <select
              value={selectedChildFilter}
              onChange={(e) => setSelectedChildFilter(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All Children ({childrenList.length})</option>
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.grade})
                </option>
              ))}
            </select>
          </div>
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
          {/* Record Exam Mark Form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                ✍️ Record Exam Score
              </h2>

              {childrenList.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
                  ⚠️ Please add a child profile first before recording exam marks.
                </div>
              ) : (
                <form onSubmit={handleAddMark} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Child
                    </label>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      {childrenList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      {COMMON_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                      <option value="Custom">+ Other Custom Subject</option>
                    </select>
                  </div>

                  {subject === "Custom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Custom Subject Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Economics, French"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Exam Name / Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Midterm 1, Final Exam, Quiz 2"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Marks Scored
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        required
                        placeholder="85"
                        value={marksScored}
                        onChange={(e) => setMarksScored(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Marks
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="100"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingMark}
                    className="w-full rounded-xl bg-brand-500 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
                  >
                    {submittingMark ? "Saving Record..." : "Record Exam Score"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Exam Marks List Table */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Exam Marks Records ({marksList.length})
              </h2>

              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading exam records...</div>
              ) : marksList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-gray-500 dark:border-gray-700">
                  <p className="text-base font-medium">No exam marks recorded yet</p>
                  <p className="text-xs mt-1">Use the form on the left to record test marks.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Subject / Exam</th>
                        <th className="px-4 py-3 text-right">Score</th>
                        <th className="px-4 py-3 text-right">%</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {marksList.map((m) => {
                        const pct = Math.round((m.marks_scored / m.max_marks) * 100);
                        const isGood = pct >= 80;
                        const isAvg = pct >= 60 && pct < 80;

                        return (
                          <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                              {m.child_name || "Child"}
                              <span className="block text-xs font-normal text-gray-400">{m.grade}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-gray-800 dark:text-white">{m.subject}</span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                {m.exam_name} • {new Date(m.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white">
                              {m.marks_scored} / {m.max_marks}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  isGood
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                    : isAvg
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(m)}
                                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                                  title="Edit exam record"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => setDeletingMark(m)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                  title="Delete mark record"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Exam Mark Modal */}
      {editingMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit Exam Mark Record</h3>
            
            <form onSubmit={handleUpdateMark} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Child
                </label>
                <select
                  value={editChildId}
                  onChange={(e) => setEditChildId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {COMMON_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="Custom">+ Other Custom Subject</option>
                </select>
              </div>

              {editSubject === "Custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomSubject}
                    onChange={(e) => setEditCustomSubject(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Exam Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={editExamName}
                  onChange={(e) => setEditExamName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Marks Scored
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={editMarksScored}
                    onChange={(e) => setEditMarksScored(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editMaxMarks}
                    onChange={(e) => setEditMaxMarks(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={editExamDate}
                  onChange={(e) => setEditExamDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMark(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingMark}
                  className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {updatingMark ? "Saving..." : "Save Exam Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exam Mark Confirmation Modal */}
      {deletingMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Exam Mark Record</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the <strong>{deletingMark.subject} ({deletingMark.exam_name})</strong> score record?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMark(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteMark}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
