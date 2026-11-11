"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  File,
  Filter,
  Download,
  Eye,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api-errors";

const resourceTypeLabels = {
  PDF: "PDF",
  VIDEO: "Video",
  DOCUMENT: "Document",
  OTHER: "Other",
};

const resourceTypeColors = {
  PDF: "bg-red-100 text-red-700",
  VIDEO: "bg-blue-100 text-blue-700",
  DOCUMENT: "bg-green-100 text-green-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default function AdminResourcesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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
        const [resourcesRes, subjectsRes] = await Promise.all([
          apiRequest("/resources?limit=100"),
          apiRequest("/subjects?limit=100"),
        ]);
        setResources(resourcesRes.data);
        setSubjects(subjectsRes.data);
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

  async function handleDelete(resourceId) {
    try {
      setIsDeleting(resourceId);
      await apiRequest(`/resources/${resourceId}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(null);
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !subjectFilter || resource.subject.id === subjectFilter;
    const matchesType = !typeFilter || resource.type === typeFilter;
    return matchesSearch && matchesSubject && matchesType;
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
          <h1 className="text-3xl font-bold text-[#211d50]">Resources</h1>
          <p className="mt-1 text-gray-600">Manage learning resources and file uploads</p>
        </div>
        <Link
          href="/admin/resources/upload"
          className="inline-flex items-center gap-2 rounded-full bg-[#a5acf3] px-6 py-3 font-semibold text-white transition hover:bg-[#858ff0]"
        >
          <Plus size={20} />
          Upload Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
          />
        </div>
        <div className="relative max-w-xs">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-10 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff] appearance-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.course.name})
              </option>
            ))}
          </select>
        </div>
        <div className="relative max-w-xs">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-10 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff] appearance-none"
          >
            <option value="">All Types</option>
            <option value="PDF">PDF</option>
            <option value="VIDEO">Video</option>
            <option value="DOCUMENT">Document</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Resources Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#737cff]" />
            <p className="mt-4 text-gray-500">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-8 text-center">
            <File className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No resources found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || subjectFilter || typeFilter
                ? "Try adjusting your filters"
                : "Get started by uploading your first resource"}
            </p>
            {!searchQuery && !subjectFilter && !typeFilter && (
              <Link
                href="/admin/resources/upload"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#a5acf3] px-6 py-3 font-semibold text-white transition hover:bg-[#858ff0]"
              >
                <Plus size={20} />
                Upload Resource
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subject / Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {resource.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${resourceTypeColors[resource.type] || resourceTypeColors.OTHER}`}>
                        {resourceTypeLabels[resource.type] || resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#efedff] text-[#737cff]">
                          <File size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resource.subject.name}</p>
                          <p className="text-xs text-gray-500">{resource.subject.course?.name || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {resource.filePath ? (
                        <div className="flex items-center gap-2">
                          {resource.fileSize && (
                            <span className="text-sm text-gray-500">
                              {(resource.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          )}
                          {resource.mimeType && (
                            <span className="text-xs text-gray-400">{resource.mimeType}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">External URL</span>
                      )}
                    </td>
<td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/resources/${resource.id}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Edit resource"
                        >
                          <Edit size={18} />
                        </Link>
                        {resource.filePath ? (
                          <a
                            href={`/uploads/${resource.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
                            aria-label="Download file"
                          >
                            <Download size={18} />
                          </a>
                        ) : null}
                        <button
                          onClick={() => setShowDeleteConfirm(resource)}
                          disabled={isDeleting === resource.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                          aria-label="Delete resource"
                        >
                          {isDeleting === resource.id ? (
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
            <h3 className="text-lg font-semibold text-gray-900">Delete Resource</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete &apos;{showDeleteConfirm.title}&apos;? This
              action cannot be undone.
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