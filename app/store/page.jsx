'use client'
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { 
    CircleDollarSignIcon, 
    ShoppingBasketIcon, 
    TargetIcon, 
    TruckIcon, 
    ClockIcon,
    DownloadIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Dashboard() {

    const { getToken } = useAuth()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalGoals: 0,
        ordersDelivered: 0,
        pendingDeliveries: 0,
    })

    // Configuration for the stats cards
    const dashboardCardsData = [
        { 
            title: 'Total Earnings', 
            value: currency + dashboardData.totalEarnings.toLocaleString(), 
            icon: CircleDollarSignIcon,
            gradient: 'from-emerald-500 to-green-600',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        { 
            title: 'Total Products', 
            value: dashboardData.totalProducts, 
            icon: ShoppingBasketIcon,
            gradient: 'from-blue-500 to-indigo-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        { 
            title: 'Total Goals', 
            value: dashboardData.totalGoals, 
            icon: TargetIcon,
            gradient: 'from-violet-500 to-purple-600',
            bgLight: 'bg-violet-50',
            textColor: 'text-violet-600'
        },
        { 
            title: 'Orders Delivered', 
            value: dashboardData.ordersDelivered, 
            icon: TruckIcon,
            gradient: 'from-cyan-500 to-teal-600',
            bgLight: 'bg-cyan-50',
            textColor: 'text-cyan-600'
        },
        { 
            title: 'Pending Deliveries', 
            value: dashboardData.pendingDeliveries, 
            icon: ClockIcon,
            gradient: 'from-amber-400 to-orange-500',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Merging API data with safe defaults
            setDashboardData({
                totalProducts: data.dashboardData.totalProducts || 0,
                totalEarnings: data.dashboardData.totalEarnings || 0,
                totalGoals: data.dashboardData.totalGoals || 0,
                ordersDelivered: data.dashboardData.ordersDelivered || 0,
                pendingDeliveries: data.dashboardData.pendingDeliveries || 0,
            })
        } catch (error) {
            console.error(error)
            toast.error("Failed to load dashboard data.")
        } finally {
            setLoading(false)
        }
    }

    const handleGeneratePDF = () => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.setTextColor(40)
        doc.text("DreamSaver Store Report", 14, 20)
        
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)

        // Summary Table
        const tableData = [
            ['Metric', 'Value'],
            ['Total Earnings', `${currency}${dashboardData.totalEarnings.toLocaleString()}`],
            ['Total Products', dashboardData.totalProducts],
            ['Total Goals', dashboardData.totalGoals],
            ['Orders Delivered', dashboardData.ordersDelivered],
            ['Pending Deliveries', dashboardData.pendingDeliveries],
        ]

        autoTable(doc, {
            startY: 35,
            head: [tableData[0]],
            body: tableData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo color
            styles: { fontSize: 12, cellPadding: 3 },
        })

        // Footer
        const finalY = doc.lastAutoTable.finalY + 10
        
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text("Generated automatically by DreamSaver System.", 14, finalY)

        doc.save(`DreamSaver_Report_${new Date().toISOString().split('T')[0]}.pdf`)
        toast.success("Report downloaded successfully!")
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return (
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50">
            <div className="text-center space-y-3">
                <Loading />
                <p className="text-slate-500 animate-pulse">Syncing store data...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50/30 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Overview</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-base lg:text-lg">
                            Track your performance, goals, and delivery status.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleGeneratePDF}
                            className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <DownloadIcon size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span className="font-medium text-sm">Download Report</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {dashboardCardsData.map((card, index) => (
                        <div 
                            key={index} 
                            className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 group"
                        >
                            {/* Decorative Background Blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>

                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl ${card.bgLight} ${card.textColor} flex items-center justify-center`}>
                                        <card.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{card.title}</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{card.value}</h3>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom colored line */}
                            <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${card.gradient} opacity-80`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}