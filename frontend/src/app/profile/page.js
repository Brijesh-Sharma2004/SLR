"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  GraduationCap,
  CalendarDays,
  Pencil,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

function formatJoinedDate(createdAt) {
  if (!createdAt) {
    return "—";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e2defa] border-t-[#737cff]" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#211d50] sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your personal information and account details.
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-[#e2defa] bg-white shadow-sm">
          <div className="bg-[#a5acf3] px-8 py-10 text-center sm:text-left">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#efedff] text-[#737cff]">
                <UserRound size={48} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>

                <p className="mt-2 text-sm text-white/90">
                  Smart Learning Resource Member
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-7 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#29245e]">
                Personal Information
              </h3>

              <button
                type="button"
                disabled
                title="Profile editing will be enabled later"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-400"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 text-[#737cff]" size={22} />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="mt-1 font-medium text-[#29245e]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <GraduationCap className="mt-1 text-[#737cff]" size={22} />
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="mt-1 font-medium text-[#29245e]">
                    {user.course ? "Course linked" : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 text-[#737cff]" size={22} />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="mt-1 font-medium text-[#29245e]">
                    {formatJoinedDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-100 pt-7">
              <h3 className="text-lg font-bold text-[#29245e]">
                Account Actions
              </h3>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-6 py-3 font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogOut size={18} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-7 text-center">
          <Link
            href="/explore"
            className="font-medium text-[#737cff] hover:text-[#454cff]"
          >
            ← Continue Exploring Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
