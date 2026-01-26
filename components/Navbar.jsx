'use client';

import { PackageIcon, Search, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";

const Navbar = () => {
  const { user } = useUser(); // Clerk's current user info
  const { openSignIn } = useClerk(); // Function to trigger sign-in modal
  const router = useRouter(); // Next.js router
  const [search, setSearch] = useState(""); // Search input state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu toggle
  const cartCount = useSelector((state) => state.cart.total); // Total items in cart from Redux

  // Handles search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search)}`);
      setSearch(""); // Clear input after search
    }
  };

  // Navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ===== Logo Section ===== */}
          <Link href="/" className="flex items-center gap-1 relative group">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 group-hover:text-green-600 transition-colors">
              <span className="text-green-600">Dream</span>Saver
            </h1>

            {/* Protected "plus" badge */}
            <Protect plan='plus'>
              <p className="absolute top-0 -right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
                plus
              </p>
            </Protect>
