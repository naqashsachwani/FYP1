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
    DownloadIcon,
    TrendingUp
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'


export default function Dashboard() {

    // AUTHENTICATION & CONFIG
    // We use Clerk's hook to get the 'getToken' function.
    // getToken retrieve the JWT (JSON Web Token) securely. We must pass this 
    //   token in the Authorization header of our API calls so the backend knows 
    //   EXACTLY which store data to return."
    const { getToken } = useAuth()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rs'
    const router = useRouter() 

    // STATE MANAGEMENT
    const [loading, setLoading] = useState(true)
    
    // Initializing state with "Safe Defaults" (0 or empty arrays).
    // This prevents "Cannot read property of undefined" errors in the UI 
    //   before the API response arrives.
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalGoals: 0,
        ordersDelivered: 0,
        pendingDeliveries: 0,
        allOrders: [] 
    })
    const [chartData, setChartData] = useState([])

    /**
     * Loop to ensure continuity. If a day has 0 sales, the chart should 
     * show a flat line at 0, rather than skipping the day entirely."
     */
    const processChartData = (orders = []) => {
        const days = 7;
        const data = [];
        const today = new Date();
        
        // Loop backwards from 6 days ago to today (0)
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' }); // Label: "Mon", "Tue"
            const dateKey = d.toISOString().split('T')[0]; 
            
            // Filter: Find orders created on this specific date
            const daysOrders = orders.filter(o => {
                const orderDate = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '';
                return orderDate === dateKey;
            });

            // Aggregation: Sum totals 
            const dailyRevenue = daysOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
            
            data.push({
                name: dateStr,
                revenue: dailyRevenue
            });
        }
        return data;
    }

    // API INTEGRATION: fetchDashboardData
     
    const fetchDashboardData = async () => {
        try {
            // 1. Get Security Token
            const token = await getToken()
            
            // 2. Make Request
            const { data } = await axios.get('/api/store/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            // 3. Data Sanitization 
            const safeData = {
                totalProducts: data.dashboardData.totalProducts || 0,
                totalEarnings: data.dashboardData.totalEarnings || 0,
                totalGoals: data.dashboardData.totalGoals || 0,
                ordersDelivered: data.dashboardData.ordersDelivered || 0,
                pendingDeliveries: data.dashboardData.pendingDeliveries || 0,
                allOrders: data.dashboardData.allOrders || [] 
            }

            setDashboardData(safeData)
            
            // 4. Chart Processing immediately after data load
            setChartData(processChartData(safeData.allOrders))

        } catch (error) {
            console.error(error)
            toast.error("Failed to load dashboard data.")
        } finally {
            setLoading(false)
        }
    }

    const GenerateReport = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const today = new Date();
        const brandColor = [30, 41, 59]; // Custom Slate 800 Color

        
        doc.setFillColor(...brandColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("DREAMSAVER", 14, 20);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Store Performance Audit Report", 14, 28);

        // Dynamic Meta Data
        doc.setFontSize(10);
        doc.text(`Report ID: ${Date.now()}`, pageWidth - 14, 18, { align: 'right' });
        doc.text(`Date: ${today.toLocaleDateString()}`, pageWidth - 14, 24, { align: 'right' });
        doc.text(`Generated By: Store Manager`, pageWidth - 14, 30, { align: 'right' });

        let yPos = 55;
        
        doc.setFontSize(14);
        doc.setTextColor(...brandColor);
        doc.text("1. Performance Overview", 14, yPos);
        
        const cardWidth = 45;
        const cardHeight = 25;
        const gap = 5;
        const startX = 14;
        yPos += 5;

        // Data for cards
        const stats = [
            { label: "Total Earnings", value: `${currency}${dashboardData.totalEarnings.toLocaleString()}` },
            { label: "Products", value: dashboardData.totalProducts.toString() },
            { label: "Total Goals", value: dashboardData.totalGoals.toString() },
            { label: "Delivered", value: dashboardData.ordersDelivered.toString() }
        ];

        // Loop to draw rectangles and text for each stat
        stats.forEach((stat, index) => {
            const x = startX + (index * (cardWidth + gap));
            
            // Draw Background Rect
            doc.setFillColor(248, 250, 252); // Slate 50
            doc.setDrawColor(226, 232, 240); // Border color
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'FD'); // FD = Fill & Draw border

            // Draw Labels & Values
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(stat.label, x + 5, yPos + 8);

            doc.setFontSize(14);
            doc.setTextColor(...brandColor);
            doc.setFont("helvetica", "bold");
            doc.text(stat.value, x + 5, yPos + 18);
        });

        yPos += cardHeight + 15;
        doc.setFontSize(14);
        doc.setTextColor(...brandColor);
        doc.text("2. Operational Metrics", 14, yPos);

        yPos += 5;
        doc.setFontSize(10);
        doc.setTextColor(50);
        // Calculation Logic embedded in report generation
        const healthText = `Pending Deliveries: ${dashboardData.pendingDeliveries} | Delivery Completion Rate: ${dashboardData.ordersDelivered > 0 ? ((dashboardData.ordersDelivered / (dashboardData.ordersDelivered + dashboardData.pendingDeliveries)) * 100).toFixed(1) + '%' : 'N/A'}`;
        doc.text(healthText, 14, yPos + 5);

        // --- D. Detailed Revenue Breakdown Table ---
        yPos += 15;
        doc.setFontSize(14);
        doc.setTextColor(...brandColor);
        doc.setFont("helvetica", "bold");
        doc.text("3. Daily Revenue Breakdown (Last 7 Days)", 14, yPos);

        // Map chart data to Table Rows format
        const auditRows = chartData.length > 0 ? chartData.map(day => [
            day.name,
            `${currency}${day.revenue.toLocaleString()}`,
            day.revenue > 0 ? 'Active' : 'No Sales'
        ]) : [['-', '-', '-']];

        // Use autoTable library to render the grid
        autoTable(doc, {
            startY: yPos + 5,
            head: [['Day', 'Revenue', 'Status']],
            body: auditRows,
            theme: 'grid',
            headStyles: { 
                fillColor: brandColor, 
                textColor: 255, 
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: { 
                fontSize: 9, 
                cellPadding: 4,
                textColor: 50
            },
            alternateRowStyles: { 
                fillColor: [241, 245, 249] 
            },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right' }
            },
            // Footer hook: Adds page numbers automatically
            didDrawPage: function (data) {
                doc.setFontSize(8);
                doc.setTextColor(150);
                const footerText = `DreamSaver Store Audit Report - Page ${doc.internal.getNumberOfPages()}`;
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        // Trigger Download in Browser
        doc.save(`DreamSaver_Store_Report_${today.toISOString().split('T')[0]}.pdf`);
    }

    // LIFECYCLE: Run once on component mount
    useEffect(() => {
        fetchDashboardData()
    }, [])

  
    // Storing card data in an array allows us to map() over it in JSX, 
    // keeping the return statement clean and readable.
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

    // LOADING STATE:
    // Show a spinner instead of broken UI while data is fetching.
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
                            onClick={GenerateReport}
                            className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <DownloadIcon size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span className="font-medium text-sm">Download Report</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid: Mapping over configuration array */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {dashboardCardsData.map((card, index) => (
                        <div 
                            key={index} 
                            // Complex styling for hover effects and gradients
                            className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 group"
                        >
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
                            <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${card.gradient} opacity-80`}></div>
                        </div>
                    ))}
                </div>

                {/* --- Chart Section --- */}
                {/* Visualizing the 7-day revenue trend using Recharts */}
                <div className="w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={24} />
                                Revenue Analytics
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Daily earnings for the last 7 days</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748b', fontSize: 12}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748b', fontSize: 12}} 
                                    tickFormatter={(value) => `${currency}${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                    formatter={(value) => [`${currency}${value}`, "Revenue"]}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#4f46e5" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    )
}