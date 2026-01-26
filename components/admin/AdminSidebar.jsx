'use client'
import { usePathname } from "next/navigation"
import { 
  ShieldCheckIcon, 
  StoreIcon, 
  TicketPercentIcon, 
  LogOutIcon,
  LayoutGrid
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useUser, SignOutButton } from "@clerk/nextjs"

/**
 * - isOpen: Boolean controlling visibility on mobile.
 * - onClose: Function to close the sidebar when a link is clicked (UX best practice).
 */
export default function AdminSidebar({ isOpen, onClose }) {
  // HOOK: useUser
  // Fetches authenticated user details.
  const { user } = useUser()

  // * use the 'usePathname' hook from Next.js to get the current URL. 
  //   compares it against the link's 'href'. If they match, apply the active CSS classes."
  const pathname = usePathname()

  // CONFIGURATION: Sidebar Links
  // Storing links in an array makes the code cleaner and easier to maintain/scale
  // than writing out multiple <Link> components manually.
  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
    { name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
  ]

  return (
    <>
      {/*  FEATURE: MOBILE OVERLAY (Backdrop)
          * This dark layer appears only on mobile (lg:hidden) when the sidebar is open.
          * Clicking this background closes the sidebar (onClose).
      */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* FEATURE: RESPONSIVE SIDEBAR DRAWER
          * CSS EXPLANATION:
          * fixed lg:sticky -> On mobile, it floats over content (fixed). On desktop, it sticks to the side (sticky).
          * translate-x -> Handles the slide-in/slide-out animation.
      */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-white border-r border-slate-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        
        {/* SECTION 1: User Profile Header */}
        <div className="relative pt-8 pb-6 px-6 flex flex-col items-center border-b border-slate-50">
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
          
          {/* Avatar with Status Indicator */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-200 blur-[2px]"></div>
            
            {/* Dynamic Image from Clerk Auth */}
            <Image
              className="relative w-16 h-16 rounded-2xl border-2 border-white object-cover"
              src={user?.imageUrl || "/default-avatar.png"}
              alt="Admin profile"
              width={64}
              height={64}
            />
            {/* Online Status Dot */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-slate-900 font-bold text-lg tracking-tight">
              {user?.fullName || "Administrator"}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mt-1">
              Admin
            </span>
          </div>
        </div>

        {/* SECTION 2: Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          
          {/* MAPPING: Iterate through the config array to render links */}
          {sidebarLinks.map((link, i) => {
            // Check if this specific link is the one currently being viewed
            const isActive = pathname === link.href

            return (
              <Link
                key={i}
                href={link.href}
                // Close sidebar on mobile when a link is clicked
                onClick={onClose} 
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Icon Component */}
                <link.icon
                  size={20}
                  className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span>{link.name}</span>
                
                {/* Visual Indicator for Active State */}
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}