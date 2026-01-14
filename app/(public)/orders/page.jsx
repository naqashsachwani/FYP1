'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { toast } from "react-hot-toast";
import { Package, ShoppingBag, Calendar, MapPin, CreditCard, Target, Trophy, Star, Award } from "lucide-react";

export default function Goals() {

    const {getToken} = useAuth()
    const {user, isLoaded} = useUser()
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchGoals = async () => {
            try{
                const token = await getToken()
                const { data } = await axios.get('/api/orders', { 
                    headers: {
                        Authorization: `Bearer ${token}` 
                    } 
                })
                setGoals(data.orders)
                setLoading(false)
            } catch (error) {
                toast.error(error?.response?.data?.error || error.message)
                setLoading(false)
            }
        }
        if(isLoaded){
          if(user){
            fetchGoals()
          }else{
            router.push('/')
          }
        }
    }, [isLoaded, user, getToken, router]);

    if(!isLoaded || loading){
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                            <Target className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        My Goals
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        {goals.length > 0 
                            ? `You have ${goals.length} goal${goals.length !== 1 ? 's' : ''} with DreamSaver`
                            : 'Your goal achievements will appear here'
                        }
                    </p>
                </div>

                {goals.length > 0 ? (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Trophy className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{goals.length}</p>
                                        <p className="text-slate-600 text-sm">Goals Set</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {new Date(Math.max(...goals.map(o => new Date(o.createdAt)))).toLocaleDateString()}
                                        </p>
                                        <p className="text-slate-600 text-sm">Latest Goal</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Star className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">
                                            ${goals.reduce((sum, goal) => sum + goal.total, 0).toFixed(2)}
                                        </p>
                                        <p className="text-slate-600 text-sm">Total Saved</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-800">Goal Achievements</h2>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="text-left p-6 font-semibold text-slate-700">Goal Details</th>
                                        <th className="text-center p-6 font-semibold text-slate-700">Amount Saved</th>
                                        <th className="text-left p-6 font-semibold text-slate-700">Delivery Info</th>
                                        <th className="text-left p-6 font-semibold text-slate-700">Goal Status</th>
                                        <th className="text-left p-6 font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {goals.map((goal) => (
                                        <OrderItem order={goal} key={goal.id} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4">
                            {goals.map((goal) => (
                                <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">Goal #{goal.id.slice(-8)}</h3>
                                            <p className="text-slate-600 text-sm mt-1">
                                                {new Date(goal.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-slate-800">
                                                ${goal.total.toFixed(2)}
                                            </p>
                                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                                                goal.status === 'delivered' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : goal.status === 'shipped'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {goal.status === 'delivered' ? 'Achieved' : goal.status === 'shipped' ? 'In Progress' : 'Planning'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>
                                                {goal.address.city}, {goal.address.state}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <CreditCard className="w-4 h-4" />
                                            <span className="capitalize">
                                                {goal.paymentMethod}
                                            </span>
                                        </div>

                                        <div className="pt-3 border-t border-slate-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-600">
                                                    {goal.orderItems.length} item{goal.orderItems.length !== 1 ? 's' : ''}
                                                </span>
                                                <button 
                                                    onClick={() => router.push(`/orders/${goal.id}`)}
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
                            <Target className="w-16 h-16 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-700 mb-4">
                            No Goals Set Yet
                        </h2>
                        <p className="text-slate-600 text-lg mb-8 max-w-md">
                            Start setting your financial goals with DreamSaver and track your progress here. Achieve your dreams with our exclusive savings plans!
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            Set First Goal
                        </button>
                    </div>
                )}

                {/* Achievement Badges */}
                {goals.length > 0 && (
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="font-semibold text-slate-800">Goal Tracking</p>
                            <p className="text-slate-600 text-sm">Real-time Progress</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="font-semibold text-slate-800">Achievement</p>
                            <p className="text-slate-600 text-sm">Milestone Rewards</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <p className="font-semibold text-slate-800">Smart Planning</p>
                            <p className="text-slate-600 text-sm">Optimized Savings</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <Trophy className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                            <p className="font-semibold text-slate-800">Member Benefits</p>
                            <p className="text-slate-600 text-sm">Exclusive</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}