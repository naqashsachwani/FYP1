'use client'
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
  RefreshCcw,
  XCircle,
  CheckCircle,
  Download,
} from "lucide-react"
import { useEffect, useState } from "react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'PKR'

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
  
  const [chartData, setChartData] = useState([])

  // --- Helper: Format Currency nicely (e.g., "PKR 1,234") ---
  const formatCurrency = (amount) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // --- 1. Helper to Process Real Data for Chart ---
  const processChartData = (orders) => {
    const days = 7;
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const dateKey = d.toISOString().split('T')[0];
        
        const daysOrders = orders.filter(o => {
            const orderDate = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '';
            return orderDate === dateKey;
        });

        const dailyRevenue = daysOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        
        data.push({
            name: dateStr,
            revenue: dailyRevenue,
            orders: daysOrders.length
        });
    }
    return data;
  }

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const safeData = {
        products: data.dashboardData.products || 0,
        revenue: data.dashboardData.revenue || 0,
        orders: data.dashboardData.orders || 0,
        stores: data.dashboardData.stores || 0,
        refundPending: data.dashboardData.refundPending || 0,
        orderCancelled: data.dashboardData.orderCancelled || 0,
        refundApproved: data.dashboardData.refundApproved || 0,
        allOrders: data.dashboardData.allOrders || [],
      }

      setDashboardData(safeData)
      setChartData(processChartData(safeData.allOrders))

    } catch (error) {
      console.error(error)
      setDashboardData({
        products: 0, revenue: 0, orders: 0, stores: 0,
        refundPending: 0, orderCancelled: 0, refundApproved: 0, allOrders: []
      })
    } finally {
      setLoading(false)
    }
  }

  // --- 3. REPORT GENERATOR ---
  const GenerateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const today = new Date();
    const brandColor = [15, 23, 42]; // Slate 900
    
    // Metrics
    const totalOrders = dashboardData.orders || 1;
    const aov = dashboardData.revenue / totalOrders;
    const refundRate = ((dashboardData.refundPending + dashboardData.refundApproved) / totalOrders) * 100;

    // --- A. Header ---
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("DREAMSAVER", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Executive Performance Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Date: ${today.toLocaleDateString()}`, pageWidth - 14, 24, { align: 'right' });

    // --- B. KPI Grid ---
    let yPos = 55;
    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    doc.text("1. Performance Overview", 14, yPos);
    
    const cardWidth = 45;
    const cardHeight = 25;
    const gap = 5;
    const startX = 14;
    yPos += 5;

    const stats = [
        { label: "Total Revenue", value: formatCurrency(dashboardData.revenue) },
        { label: "Active Stores", value: dashboardData.stores.toString() },
        { label: "Total Orders", value: dashboardData.orders.toString() },
        { label: "Products", value: dashboardData.products.toString() }
    ];

    stats.forEach((stat, index) => {
        const x = startX + (index * (cardWidth + gap));
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(stat.label, x + 5, yPos + 8);
        doc.setFontSize(12); // Slightly smaller font for values to fit
        doc.setTextColor(...brandColor);
        doc.setFont("helvetica", "bold");
        doc.text(stat.value, x + 5, yPos + 18);
    });

    // --- C. Efficiency Metrics ---
    yPos += cardHeight + 15;
    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    doc.text("2. Operational Efficiency", 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Average Order Value:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(formatCurrency(aov), 60, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Refund Rate:", 100, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${refundRate.toFixed(1)}%`, 130, yPos);

    // --- D. Transaction Logs Table ---
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    doc.setFont("helvetica", "bold");
    doc.text("3. Recent Transaction Logs", 14, yPos);

    const auditRows = dashboardData.allOrders.slice(0, 10).map(order => [
        order.id ? order.id.substring(0, 8) : 'ERR',
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        order.customer || 'Guest',
        'ORDER',
        formatCurrency(order.total || 0),
        order.status || 'PENDING'
    ]);

    autoTable(doc, {
        startY: yPos + 5,
        head: [['Ref ID', 'Date', 'User', 'Type', 'Amount', 'Status']],
        body: auditRows,
        theme: 'grid',
        headStyles: { fillColor: brandColor, textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8, cellPadding: 3, textColor: 50 },
        columnStyles: { 4: { halign: 'right' } }
    });

    // --- E. Daily Revenue Table ---
    let finalY = doc.lastAutoTable.finalY + 15;
    
    if (finalY + 60 > pageHeight) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    doc.setFont("helvetica", "bold");
    doc.text("4. Daily Revenue Breakdown (Last 7 Days)", 14, finalY);

    const revenueRows = chartData.map(day => [
        day.name,
        day.orders,
        formatCurrency(day.revenue)
    ]);

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Date', 'Total Orders', 'Daily Revenue']],
        body: revenueRows,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 
            1: { halign: 'center' },
            2: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
        }
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`DreamSaver_Audit_${today.toISOString().split('T')[0]}.pdf`);
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
      value: formatCurrency(dashboardData.revenue), // Use Helper
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="relative min-h-[85vh] w-full bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-8 mb-24 px-4 sm:px-6 lg:px-8 py-8">
        
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
              onClick={GenerateReport}
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

        {/* Stats Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((card, index) => (
            <div key={index} className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${card.bgLight} ${card.textColor} transition-colors`}>
                    <card.icon size={24} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{card.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

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

        {/* Analytics Chart Section */}
        <div className="w-full">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-slate-800">Revenue Analytics</h2>
                   <p className="text-sm text-slate-500">Real-time performance (Last 7 Days)</p>
                 </div>
              </div>

              <div id="revenue-chart" className="h-[350px] w-full bg-white p-2"> 
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                    {/* ✅ Y-AXIS: Formatted Numbers */}
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}} 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    {/* ✅ TOOLTIP: Formatted Numbers */}
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}