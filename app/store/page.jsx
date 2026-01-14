'use client'
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon, EyeIcon, TrendingUpIcon, UsersIcon, PackageIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function Dashboard() {

    const {getToken} = useAuth()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { 
            title: 'Total Products', 
            value: dashboardData.totalProducts, 
            icon: ShoppingBasketIcon,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        { 
            title: 'Total Earnings', 
            value: currency + dashboardData.totalEarnings, 
            icon: CircleDollarSignIcon,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        { 
            title: 'Total Orders', 
            value: dashboardData.totalOrders, 
            icon: PackageIcon,
            color: 'from-purple-500 to-violet-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        { 
            title: 'Customer Reviews', 
            value: dashboardData.ratings.length, 
            icon: StarIcon,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setDashboardData(data.dashboardData)
        } catch (error) {
            toast.error(error?.response?.error || error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return (
        <div className="min-h-96 flex items-center justify-center">
            <div className="text-center">
                <Loading />
                <p className="mt-4 text-slate-600 font-medium">Loading your DreamSaver dashboard...</p>
            </div>
        </div>
    )

    return (
        <div className="text-slate-600 mb-12">
            {/* Header Section */}
            <div className="mb-8">
               <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                    Store <span className="text-blue-600">Dashboard</span>
                </h1>
                <p className="text-slate-500 text-lg">Welcome to your DreamSaver store management center</p>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {dashboardCardsData.map((card, index) => (
                    <div 
                        key={index} 
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium mb-2">{card.title}</p>
                                <p className="text-2xl lg:text-3xl font-bold text-slate-800">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon 
                                    size={28} 
                                    className={`${card.textColor}`} 
                                />
                            </div>
                        </div>
                        <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${card.color} transition-all duration-500 group-hover:w-full`}></div>
                    </div>
                ))}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200/40 bg-gradient-to-r from-slate-50 to-green-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <StarIcon className="text-amber-500" size={24} />
                                Customer Reviews
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">What customers are saying about your products</p>
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {dashboardData.ratings.length} Reviews
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-200/40">
                    {dashboardData.ratings.length > 0 ? (
                        dashboardData.ratings.map((review, index) => (
                            <div 
                                key={index} 
                                className="p-6 hover:bg-slate-50/50 transition-colors duration-200"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                    {/* User Info & Review */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <Image 
                                                src={review.user.image} 
                                                alt={review.user.name} 
                                                className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
                                                width={48}
                                                height={48}
                                            />
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{review.user.name}</p>
                                                        <p className="text-slate-500 text-sm mt-1">
                                                            {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric' 
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <StarIcon 
                                                                key={i} 
                                                                size={18} 
                                                                className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-slate-600 leading-relaxed">{review.review}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="lg:w-48 flex-shrink-0">
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                                            <p className="text-slate-500 text-sm font-medium mb-1">{review.product?.category}</p>
                                            <p className="font-semibold text-slate-800 text-lg mb-3 line-clamp-2">{review.product?.name}</p>
                                            <button 
                                                onClick={() => router.push(`/product/${review.product.id}`)}
                                                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-2.5 px-4 rounded-xl transition-all duration-200 font-medium text-sm"
                                            >
                                                <EyeIcon size={16} />
                                                View Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-slate-100 rounded-2xl">
                                    <StarIcon size={32} className="text-slate-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">No reviews yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Customer reviews will appear here once customers start rating your products on DreamSaver.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}