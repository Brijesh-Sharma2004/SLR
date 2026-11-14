"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Save, File as FileIcon, X } from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api-errors";

const resourceTypes = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "DOCUMENT", label: "Document" },
  { value: "OTHER", label: "Other" },
];

export default function ResourceForm() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const pathname = useRouter().pathname || "";

  const isEditing = !!params.id;
  const resourceId = params.id;
  const isUpload = !isEditing && pathname.includes("upload");

  const [formData, setFormData] = useState({
    title: "",
    type: "PDF",
    description: "",
    url: "",
    subjectId: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = false;
  const [isLoading, setIsLoading] = isEditing;
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // Redirect handled by layout
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await apiRequest("/subjects?limit=100");
        setSubjects(response.data);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (isEditing && isAdmin) {
      async function fetchResource() {
        try {
          setIsLoading(true);
          const response = await apiRequest(`/resources/${resourceId}`);
          setFormData({
            title: response.data.title,
            type: response.data.type,
            description: response.data.description,
            url: response.data.url || "",
            subjectId: response.data.subject.id,
          });
          if (response.data.filePath) {
            setFilePreview({
              name: response.data.originalFileName || "Uploaded file",
              size: response.data.fileSize,
              type: response.data.mimeType,
              url: `/uploads/${response.data.filePath}`,
            });
          }
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      }
      fetchResource();
    }
  }, [isEditing, resourceId, isAdmin, setIsLoading]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  }

  function removeFile() {
    setSelectedFile(null);
    setFilePreview(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("subjectId", formData.subjectId);
      if (formData.url) {
        formDataToSend.append("url", formData.url);
      }

      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      const endpoint = isEditing
        ? `/resources/${resourceId}/upload`
        : "/resources/upload";
      const method = isEditing ? "PATCH" : "POST";

      // Use fetch directly for file upload with progress
      const response = await fetch(`/api/v1${endpoint}`, {
        method,
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message || "Something went wrong. Please try again.";
        throw new Error(message);
      }

      router.push("/admin/resources");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  if (authLoading || isLoading) {
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
          <p className="mt-2 text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/resources"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#211d50]">
            {isEditing
              ? "Edit Resource"
              : isUpload
                ? "Upload New Resource"
                : "Create Resource"}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEditing
              ? "Update the resource details below"
              : isUpload
                ? "Upload a file and fill in the details"
                : "Fill in the details to create a new resource (external URL)"}
          </p>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Upload Progress */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-700">Uploading...</span>
            <span className="text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Resource Information
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="subjectId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subjectId"
                name="subjectId"
                required
                value={formData.subjectId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.course.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={120}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., DBMS Unit 1 Notes"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Resource Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                maxLength={2000}
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this resource..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff] resize-none"
              />
            </div>

            {(!isEditing || isUpload) && (
              <div>
                <label
                  htmlFor="file"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  File Upload{" "}
                  {isUpload ? '<span className="text-red-500">*</span>' : ""}
                </label>
                <div className="relative">
                  <input
                    id="file"
                    name="file"
                    type="file"
                    required={isUpload && !filePreview}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif,.webp"
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  {filePreview ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-4">
                          <FileIcon className="h-10 w-10 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-md">
                              {filePreview.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(filePreview.size / (1024 * 1024)).toFixed(2)} MB
                              • {filePreview.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
                          aria-label="Remove file"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <label
                      htmlFor="file"
                      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-8 transition hover:border-[#858ff0] hover:bg-[#f8f9ff] cursor-pointer"
                    >
                      <FileIcon className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">
                        Drag and drop a file here, or click to select
                      </p>
                      <p className="text-xs text-gray-400">
                        Max size: 100MB • PDF, Video, Documents, Images
                      </p>
                    </label>
                  )}
                </div>
              </div>
            )}

            {!isUpload && (
              <div>
                <label
                  htmlFor="url"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  External URL (optional)
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  maxLength={500}
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/resource.pdf"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/resources"
            className="rounded-lg px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-[#a5acf3] px-6 py-3 font-semibold text-white transition hover:bg-[#858ff0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isUpload ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing
                  ? "Update Resource"
                  : isUpload
                    ? "Upload Resource"
                    : "Create Resource"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
