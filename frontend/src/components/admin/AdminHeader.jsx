"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, UserRound, LogOut, ChevronDown } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => onMenuClick?.() || setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Page Title */}
        <div className="flex-1 lg:hidden">
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100">
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              3
            </span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efedff] text-[#737cff]">
                <UserRound size={18} />
              </div>
              <span className="hidden font-medium text-gray-700 sm:block">
                {user?.name}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                    <p className="mt-1 text-xs font-medium text-purple-600">Administrator</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserRound size={18} />
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4">
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin/dashboard"
              className="rounded-lg bg-[#efedff] px-3 py-2 text-sm font-medium text-[#737cff]"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/courses"
              className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Courses
            </Link>
            <Link
              href="/admin/subjects"
              className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Subjects
            </Link>
            <Link
              href="/admin/resources"
              className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Resources
            </Link>
            <Link
              href="/admin/students"
              className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Students
            </Link>
            <Link
              href="/admin/messages"
              className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Messages
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}