'use client'
import Loading from "@/components/Loading"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
  TrendingUp,
  RefreshCcw,
  XCircle,
  CheckCircle,
  Download
} from "lucide-react"

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    refundPending: 0,
    orderCancelled: 0,
    refundApproved: 0,
    allOrders: [],
  })

  // 1. Main Key Performance Indicators (Top Row)
  const mainStats = [
    {
      title: 'Total Products',
      value: dashboardData.products,
      icon: ShoppingBasketIcon,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50/50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Revenue',
      value: currency + dashboardData.revenue.toLocaleString(),
      icon: CircleDollarSignIcon,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50/50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Total Goals',
      value: dashboardData.orders,
      icon: TagsIcon,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50/50',
      textColor: 'text-violet-600',
    },
    {
      title: 'Total Stores',
      value: dashboardData.stores,
      icon: StoreIcon,
      gradient: 'from-orange-500 to-amber-600',
      bgLight: 'bg-orange-50/50',
      textColor: 'text-orange-600',
    },
  ]

  // 2. Order Status Stats (Middle Row)
  const orderStatusStats = [
    {
      title: 'Refund Pending',
      value: dashboardData.refundPending,
      icon: RefreshCcw,
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'bg-amber-50/50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Goal Cancelled',
      value: dashboardData.orderCancelled,
      icon: XCircle,
      gradient: 'from-red-500 to-rose-600',
      bgLight: 'bg-red-50/50',
      textColor: 'text-red-600',
    },
    {
      title: 'Refund Approved',
      value: dashboardData.refundApproved,
      icon: CheckCircle,
      gradient: 'from-lime-500 to-green-600',
      bgLight: 'bg-lime-50/50',
      textColor: 'text-lime-600',
    },
  ]

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDashboardData({
        ...data.dashboardData,
        refundPending: data.dashboardData.refundPending || 0,
        orderCancelled: data.dashboardData.orderCancelled || 0,
        refundApproved: data.dashboardData.refundApproved || 0,
      })
    } catch (error) {
      console.error(error)
      setDashboardData(dummyAdminDashboardData)
    } finally {
      setLoading(false)
    }
  }

  // 3. PDF Generation Logic
  const handleGenerateReport = () => {
    const doc = new jsPDF()

    // Title & Date
    doc.setFontSize(20)
    doc.text("DreamSaver Admin Report", 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    // Summary Section
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Executive Summary", 14, 45)
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Revenue', `${currency}${dashboardData.revenue.toLocaleString()}`],
      ['Total Products', dashboardData.products],
      ['Total Orders', dashboardData.orders],
      ['Total Stores', dashboardData.stores],
      ['Refunds Pending', dashboardData.refundPending],
      ['Orders Cancelled', dashboardData.orderCancelled],
      ['Refunds Approved', dashboardData.refundApproved],
    ]

    autoTable(doc, {
      startY: 50,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    })

    // Orders Details Section (if data exists)
    if (dashboardData.allOrders && dashboardData.allOrders.length > 0) {
      doc.text("Recent Order Details", 14, doc.lastAutoTable.finalY + 15)
      
      const orderRows = dashboardData.allOrders.map(order => [
        order.id || '-',
        order.customer || 'Guest',
        `${currency}${order.total || 0}`,
        order.status || 'Completed'
      ])

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Order ID', 'Customer', 'Amount', 'Status']],
        body: orderRows,
        theme: 'striped',
      })
    }

    doc.save(`DreamSaver_Report_${new Date().toISOString().slice(0,10)}.pdf`)
    toast.success("Report generated successfully!")
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="relative min-h-[85vh] w-full bg-slate-50/50">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-purple-100/50 blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 mb-24 px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dream
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Saver
              </span>{' '}
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-lg">
              Performance overview and system status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleGenerateReport}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
            >
              <Download size={16} />
              <span className="text-sm font-medium">Download Report</span>
            </button>
            
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 shadow-sm cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-slate-600 font-medium">System Active</span>
            </div>
          </div>
        </div>

        {/* 1. Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((card, index) => (
            <div key={index} className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${card.bgLight} ${card.textColor} transition-colors`}>
                    <card.icon size={24} />
                  </div>
                  {/* View badge removed */}
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{card.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
                </div>
                
                {/* Arrow icon removed here */}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Order Status Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Order Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orderStatusStats.map((card, index) => (
              <div key={index} className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${card.bgLight} ${card.textColor} group-hover:scale-110 transition-transform`}>
                    <card.icon size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl`}></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}