'use client'
import { useState } from "react"
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const StoreSidebar = ({ storeInfo }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: HomeIcon },
    { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
    { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
    { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
  ]

  return (
    <>
      {/* Mobile Navbar */}
      <div className="sm:hidden flex justify-between items-center p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-700">DreamSaver</h1>
        <div className="w-8 h-8"></div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed sm:static top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"} 
          sm:min-w-60 w-64`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Image
                src={storeInfo?.logo || '/default-store.png'}
                alt="Store Logo"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-blue-100 shadow-sm"
              />
              <p className="text-base font-semibold text-gray-700 hidden sm:block">
                {storeInfo?.name || "DreamSaver Store"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="sm:hidden p-2 text-gray-500 hover:text-blue-500 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 py-6">
            {sidebarLinks.map((link, index) => {
              const isActive = pathname === link.href
              const Icon = link.icon

              return (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? "bg-blue-100 text-blue-600 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-500"
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{link.name}</span>
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-blue-500"></span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="text-center py-4 border-t border-gray-100 text-xs text-gray-400">
          <p>
            Powered by <span className="font-semibold text-blue-500">DreamSaver</span>
          </p>
        </div>
      </aside>
    </>
  )
}

export default StoreSidebar
