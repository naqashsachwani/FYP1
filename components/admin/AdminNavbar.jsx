'use client' 
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { CrownIcon, MenuIcon, XIcon } from "lucide-react"


export default function AdminNavbar({ onToggleSidebar, isSidebarOpen }) {
  // HOOK: useUser
  // Fetches the current logged-in user's data (name, email, image) from Clerk.
  const { user } = useUser()

  return (
   
    <header className="flex items-center justify-between px-4 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
      
      {/* --- Mobile Toggle & Logo --- */}
      <div className="flex items-center gap-3">
        
        {/* MOBILE TOGGLE BUTTON
            * lg:hidden -> This button disappears on Large screens (Desktop) because 
              the sidebar is always visible there. It only shows on mobile/tablet.
        */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          aria-label="Toggle Sidebar" // Accessibility improvement
        >
          {isSidebarOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          {/* LOGO TEXT */}
          <span className="text-2xl lg:text-3xl font-bold text-slate-800 group-hover:scale-105 transition-transform duration-200 ease-in-out inline-block">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dream
            </span>
            Saver
          </span>

          {/* ADMIN BADGE
              * hidden md:flex -> Hides on mobile to save space, shows on medium+ screens.
              * This adds visual hierarchy, indicating this is the "Admin" view, not the "Store" view.
          */}
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md group-hover:scale-105 transition-transform duration-200 ease-in-out">
            <CrownIcon size={10} />
            Admin
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 rounded-full pl-2 pr-4 py-1.5 shadow-sm hover:shadow-md hover:bg-slate-100 transition-all">
        
        
        <UserButton afterSignOutUrl="/" />

       
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-700">
            {/*Fallback to 'Admin' if user data hasn't loaded yet */}
            Hi, {user?.firstName || 'Admin'}
          </p>
          <p className="text-xs text-slate-500">Administrator</p>
        </div>
      </div>
    </header>
  )
}