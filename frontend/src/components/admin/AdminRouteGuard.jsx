"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function AdminRouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAdmin, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e2defa] border-t-[#737cff]" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}