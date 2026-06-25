"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { name: "首頁", path: "/" },
  { name: "產品服務", path: "/products" },
  { name: "作品案例", path: "/showcase" },
  { name: "印製須知", path: "/printing-notes" },
  { name: "製作流程", path: "/process" },
  { name: "成本試算", path: "/calculator" },
  { name: "關於我們", path: "/about" },
  { name: "聯絡我們", path: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-brand-border/60 py-3 shadow-sm"
          : "bg-brand-cream/50 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white border border-brand-border/40 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/logo.png"
                alt="萌點3D Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-wider text-brand-dark bg-gradient-to-r from-brand-dark to-brand-orange bg-clip-text">
              萌點3D
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? "text-brand-orange"
                      : "text-brand-muted hover:text-brand-orange"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Inquiry Button (Desktop) */}
          <div className="hidden md:block">
            <Link
              href="/inquiry"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              開始詢價
            </Link>
          </div>

          {/* Hamburger Menu Icon (Mobile) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brand-dark hover:text-brand-orange focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden absolute left-0 right-0 bg-white border-b border-brand-border/80 shadow-lg transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 max-h-96 py-4 visible"
            : "opacity-0 max-h-0 py-0 invisible overflow-hidden"
        }`}
      >
        <div className="px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-brand-peach-light text-brand-orange"
                    : "text-brand-muted hover:bg-brand-cream hover:text-brand-orange"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-2 px-4">
            <Link
              href="/inquiry"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-full text-base font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md transition-colors"
            >
              開始詢價
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
