"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Filter,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api-errors";

export default function AdminSubjectsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // Redirect handled by layout
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [subjectsRes, coursesRes] = await Promise.all([
          apiRequest("/subjects?limit=100"),
          apiRequest("/courses?limit=100"),
        ]);
        setSubjects(subjectsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  async function handleDelete(subjectId) {
    try {
      setIsDeleting(subjectId);
      await apiRequest(`/subjects/${subjectId}`, { method: "DELETE" });
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(null);
    }
  }

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = !courseFilter || subject.course.id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#737cff]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#211d50]">Subjects</h1>
          <p className="mt-1 text-gray-600">Manage subjects and their courses</p>
        </div>
        <Link
          href="/admin/subjects/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#a5acf3] px-6 py-3 font-semibold text-white transition hover:bg-[#858ff0]"
        >
          <Plus size={20} />
          Add Subject
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
          />
        </div>
        <div className="relative max-w-xs">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-10 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff] appearance-none"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Subjects Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#737cff]" />
            <p className="mt-4 text-gray-500">Loading subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No subjects found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || courseFilter
                ? "Try adjusting your filters"
                : "Get started by creating your first subject"}
            </p>
            {!searchQuery && !courseFilter && (
              <Link
                href="/admin/subjects/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#a5acf3] px-6 py-3 font-semibold text-white transition hover:bg-[#858ff0]"
              >
                <Plus size={20} />
                Create Subject
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resources
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {subject.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#efedff] text-[#737cff]">
                          <FileText size={16} />
                        </div>
                        <span className="text-gray-600">{subject.course.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        {subject.resourceCount} resources
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/subjects/${subject.id}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Edit subject"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(subject)}
                          disabled={isDeleting === subject.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                          aria-label="Delete subject"
                        >
                          {isDeleting === subject.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Subject</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete &apos;{showDeleteConfirm.name}&apos;? This
              will also delete all its resources. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}