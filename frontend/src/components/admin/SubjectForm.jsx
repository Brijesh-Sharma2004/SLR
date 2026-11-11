"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Save } from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api-errors";

export default function SubjectForm() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const isEditing = !!params.id;
  const subjectId = params.id;

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    courseId: "",
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = false;
  const [isLoading, setIsLoading] = isEditing;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // Redirect handled by layout
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await apiRequest("/courses?limit=100");
        setCourses(response.data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (isEditing && isAdmin) {
      async function fetchSubject() {
        try {
          setIsLoading(true);
          const response = await apiRequest(`/subjects/${subjectId}`);
          setFormData({
            name: response.data.name,
            code: response.data.code,
            description: response.data.description,
            courseId: response.data.course.id,
          });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      }
      fetchSubject();
    }
  }, [isEditing, subjectId, isAdmin, setIsLoading]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await apiRequest(`/subjects/${subjectId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest("/subjects", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      router.push("/admin/subjects");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/subjects"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#211d50]">
            {isEditing ? "Edit Subject" : "Create New Subject"}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEditing
              ? "Update the subject details below"
              : "Fill in the details to create a new subject"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Subject Information</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="courseId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Course <span className="text-red-500">*</span>
              </label>
              <select
                id="courseId"
                name="courseId"
                required
                value={formData.courseId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={120}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Database Management Systems"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
              />
            </div>

            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={12}
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., CS301"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 uppercase outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
              />
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
                placeholder="Describe what this subject covers..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/subjects"
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
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? "Update Subject" : "Create Subject"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}