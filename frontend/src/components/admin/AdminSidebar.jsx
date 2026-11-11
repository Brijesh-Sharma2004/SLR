"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Upload,
  Users,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Subjects", href: "/admin/subjects", icon: FileText },
  { name: "Resources", href: "/admin/resources", icon: Upload },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-[#29245e] text-white transition-all duration-300 ${
        isMobile
          ? isCollapsed
            ? "w-0"
            : "w-64"
          : isCollapsed
          ? "w-20"
          : "w-64"
      } lg:translate-x-0`}
      style={{ transform: isMobile && isCollapsed ? "translateX(-100%)" : "translateX(0)" }}
    >
      <div className="flex h-full flex-col">
        {/* Logo / Brand */}
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-4">
          {isCollapsed && !isMobile ? (
            <span className="text-xl font-bold text-white">SLR</span>
          ) : (
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <BookOpen size={24} />
              </div>
              {!isCollapsed && <span className="text-xl font-bold">SLR Admin</span>}
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => isMobile && setIsCollapsed(true)}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Collapse Toggle */}
        <div className="border-t border-white/10 p-4">
          {!isCollapsed && user && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <span className="font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-white/60">Administrator</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                {!isMobile && <span>Collapse</span>}
              </>
            )}
          </button>

          {!isCollapsed && (
            <button
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 hover:text-red-300"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}