'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon, ChevronRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function AdminSidebar({ isOpen, onClose }) {
  const { user } = useUser()
  const pathname = usePathname()

  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
    { name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full bg-white/90 backdrop-blur-md border-r border-slate-200/60 shadow-lg lg:shadow-sm transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 w-64`}
      >
        {/* Profile Section */}
        <div className="flex flex-col items-center py-8 border-b border-slate-200">
          <div className="relative">
            <Image
              className="w-16 h-16 rounded-2xl border-2 border-white shadow-md"
              src={user?.imageUrl || "/default-avatar.png"}
              alt="Admin profile"
              width={80}
              height={80}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-slate-800 font-semibold">{user?.fullName || "Admin"}</p>
            <p className="text-slate-500 text-sm">Administrator</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {sidebarLinks.map((link, i) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={i}
                  href={link.href}
                  className={`relative flex items-center justify-between group rounded-xl p-3 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-blue-600 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <link.icon
                      size={20}
                      className={
                        isActive
                          ? "text-blue-500"
                          : "text-slate-400 group-hover:text-slate-600"
                      }
                    />
                    <span className={`font-medium ${isActive ? "text-blue-600" : "group-hover:text-slate-800"}`}>
                      {link.name}
                    </span>
                  </div>
                  {isActive && <ChevronRightIcon size={16} className="text-blue-500" />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 text-center text-xs text-slate-500">
          DreamSaver Admin v2.1.0
        </div>
      </aside>
    </>
  )
}
