'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, CrownIcon, Shield, Users, Settings, BarChart3 } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"

export default function AdminLayout({ children }) {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchIsAdmin = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIsAdmin(data?.isAdmin === true)
    } catch (err) {
      console.error("Admin check failed:", err)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchIsAdmin()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <Loading />
          <p className="mt-4 text-slate-600 font-medium">Checking admin privileges...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto border border-white/60 relative z-10 transform transition-all duration-300 hover:shadow-2xl">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
            <CrownIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Access Restricted
          </h1>
          <p className="text-slate-700 mb-3 text-lg font-medium">Administrator Access Required</p>
          <p className="text-slate-500 mb-8 leading-relaxed">
            This area is reserved for authorized administrators only. Please contact your system administrator if you believe this is an error.
          </p>
          <Link
            href="/"
            className="group bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white flex items-center justify-center gap-3 mt-4 p-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            <span className="font-semibold">Return to Home</span>
            <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decorative elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-0"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -z-0"></div>
      
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex flex-1 h-full overflow-hidden relative z-10">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 transition-all duration-300">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/60 min-h-full p-6 lg:p-8 transition-all duration-300 hover:shadow-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}