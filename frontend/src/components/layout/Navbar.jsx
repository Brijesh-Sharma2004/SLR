"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, isAdmin } = useAuth();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "RESOURCES", href: "/explore" },
    { name: "HOW IT WORKS", href: "/how-it-works" },
    { name: "CONTACT US", href: "/contact" },
  ];

  return (
    <header className="relative z-50 w-full bg-[#a5acf3]">
      <nav className="mx-auto flex min-h-20 items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <div className="relative flex h-14 w-18 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-16 sm:w-20">
            <Image
              src="/unilogo.jpeg"
              alt="University Logo"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
        </Link>

        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium text-white transition hover:text-[#454cff]"
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="font-medium text-white transition hover:text-[#454cff]"
            >
              ADMIN DASHBOARD
            </Link>
          )}
        </div>

        <div className="hidden items-center lg:flex">
          {!isLoading &&
            (user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  aria-label="Profile"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#737cff] transition hover:scale-105"
                >
                  <ProfileIcon size={30} />
                </Link>
              </>
            ) : (
              <Link
                href="/register"
                className="font-medium text-white transition hover:text-[#454cff]"
              >
                REGISTER / LOGIN
              </Link>
            ))}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {!isLoading &&
            (user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  aria-label="Profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#737cff]"
                >
                  <ProfileIcon size={26} />
                </Link>
              </>
            ) : (
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="font-medium text-white"
              >
                REGISTER / LOGIN
              </Link>
            ))}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-[#454cff]"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full border-t border-white/30 bg-[#a5acf3] px-6 py-5 shadow-lg lg:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-medium text-white transition hover:text-[#454cff]"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="font-medium text-white transition hover:text-[#454cff]"
              >
                ADMIN DASHBOARD
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function ProfileIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2z" />
    </svg>
  );
}
