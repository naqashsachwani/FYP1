'use client'
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { CrownIcon, MenuIcon, XIcon } from "lucide-react"

export default function AdminNavbar({ onToggleSidebar, isSidebarOpen }) {
  const { user } = useUser()

  return (
    // The "glassmorphism" header is great, kept as-is.
    <header className="flex items-center justify-between px-4 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
      {/* Left: Mobile Sidebar Toggle + Logo */}
      <div className="flex items-center gap-3">
        {/* Changed to rounded-full for consistency, added text color transition */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          {isSidebarOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        {/* Refactored Logo to use flex instead of absolute positioning for the badge */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          {/* Logo Text */}
          <span className="text-2xl lg:text-3xl font-bold text-slate-800 group-hover:scale-105 transition-transform duration-200 ease-in-out inline-block">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dream
            </span>
            Saver
          </span>

          {/* Admin Badge: Now a flex item, hidden on small screens for a cleaner look */}
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md group-hover:scale-105 transition-transform duration-200 ease-in-out">
            <CrownIcon size={10} />
            Admin
          </span>
        </Link>
      </div>

      {/* Right: User Info - Simplified to a cleaner "pill" */}
      <div className="flex items-center gap-3 bg-slate-50 rounded-full pl-2 pr-4 py-1.5 shadow-sm hover:shadow-md hover:bg-slate-100 transition-all">
        {/* UserButton is now the avatar, no more redundant initial div */}
        <UserButton afterSignOutUrl="/" />

        {/* User name and role */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-700">
            Hi, {user?.firstName || 'Admin'}
          </p>
          <p className="text-xs text-slate-500">Administrator</p>
        </div>
      </div>
    </header>
  )
}