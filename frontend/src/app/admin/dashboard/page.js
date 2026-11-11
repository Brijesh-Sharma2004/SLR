"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  File,
  Users,
  Mail,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const statCards = [
  {
    name: "Total Courses",
    icon: BookOpen,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    href: "/admin/courses",
  },
  {
    name: "Total Subjects",
    icon: FileText,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    href: "/admin/subjects",
  },
  {
    name: "Total Resources",
    icon: File,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    href: "/admin/resources",
  },
  {
    name: "Total Students",
    icon: Users,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    href: "/admin/students",
  },
  {
    name: "Total Messages",
    icon: Mail,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    href: "/admin/messages",
  },
  {
    name: "Unread Messages",
    icon: AlertCircle,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    href: "/admin/messages",
  },
];

export default function AdminDashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      // Redirect non-admins - handled by layout
    }
  }, [isLoading, isAdmin]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await apiRequest("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e2defa] border-t-[#737cff]" />
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#211d50]">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.name}. Here&apos;s an overview of your platform.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const statKey = card.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace("total", "")
            .replace("unread", "unread");
          const value = stats?.[`total${card.name.replace("Total ", "").replace("s", "")}`] ?? 
            stats?.[`total${card.name.replace("Total ", "").replace("Messages", "Messages")}`] ??
            stats?.[`unreadMessages`] ?? 0;

          const Icon = card.icon;
          return (
            <Link key={card.name} href={card.href} className="group">
              <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#e2defa]`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.name}</p>
                    <p className="mt-2 text-3xl font-bold text-[#211d50]">
                      {isLoadingStats ? (
                        <span className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                      ) : (
                        value.toLocaleString()
                      )}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>View details</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/courses/new"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#e2defa]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#211d50]">Add Course</h3>
          <p className="mt-1 text-sm text-gray-500">Create a new course for students</p>
        </Link>

        <Link
          href="/admin/subjects/new"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#e2defa]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <FileText size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#211d50]">Add Subject</h3>
          <p className="mt-1 text-sm text-gray-500">Create a new subject under a course</p>
        </Link>

        <Link
          href="/admin/resources/upload"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#e2defa]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <File size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#211d50]">Upload Resource</h3>
          <p className="mt-1 text-sm text-gray-500">Add learning materials for students</p>
        </Link>

        <Link
          href="/admin/messages"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#e2defa]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Mail size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#211d50]">View Messages</h3>
          <p className="mt-1 text-sm text-gray-500">Check contact form submissions</p>
        </Link>
      </div>
    </div>
  );
}