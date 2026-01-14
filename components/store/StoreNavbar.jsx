'use client'
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Menu } from "lucide-react"

const StoreNavbar = ({ onMenuClick }) => {
  const { user } = useUser()

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3">
        
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="sm:hidden p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
        >
          <Menu size={22} />
        </button>

        {/* Brand / Logo */}
        <Link
          href="/"
          className="relative text-3xl sm:text-4xl font-extrabold text-gray-800 select-none"
        >
          <span className="text-blue-600">Dream</span>
          Saver
          <span className="text-blue-600 text-5xl leading-0">.</span>

          <span className="absolute text-[10px] font-semibold -top-1 -right-10 px-2.5 py-[1px] rounded-full flex items-center gap-1 text-white bg-blue-500">
            Store
          </span>
        </Link>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <p className="hidden sm:block text-gray-700 text-sm font-medium">
            Hi, <span className="text-blue-600">{user?.firstName}</span>
          </p>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

export default StoreNavbar
