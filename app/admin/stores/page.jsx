'use client'
import { storesDummyData } from "@/assets/assets"
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useUser, useAuth } from "@clerk/nextjs"
import axios from "axios"
import { Store, Activity, Search, Filter, Users, TrendingUp, ToggleLeft, ToggleRight, Eye, Edit } from "lucide-react"

export default function AdminStores() {
    
    const { user } = useUser()
    const { getToken } = useAuth()

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const fetchStores = async () => {
        try{
            const token = await getToken()
            const { data } = await axios.get('/api/admin/stores', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStores(data.stores)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const toggleIsActive = async (storeId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/admin/toggle-store', {storeId},
                {headers: { Authorization: `Bearer ${token}` }})
            await fetchStores()
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        if(user){
            fetchStores()
        }
    }, [user])

    // Filter stores based on search and status
    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            store.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || 
                            (statusFilter === "active" && store.isActive) ||
                            (statusFilter === "inactive" && !store.isActive)
        return matchesSearch && matchesStatus
    })

    // Calculate stats
    const totalStores = stores.length
    const activeStores = stores.filter(store => store.isActive).length
    const inactiveStores = stores.filter(store => !store.isActive).length

    return !loading ? (
        <div className="space-y-6 mb-28">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Store Management</h1>
                    <p className="text-slate-600 mt-2">Manage all DreamSaver stores and their activity status</p>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-2xl border border-blue-100">
                    <Store size={18} className="text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Live Store Management</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm">Total Stores</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">{totalStores}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Store className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm">Active Stores</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{activeStores}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm">Inactive Stores</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">{inactiveStores}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search stores by name or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-3">
                            <span className="text-slate-700 text-sm font-medium">Filter by:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                            >
                                <option value="all">All Stores</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                        Showing {filteredStores.length} of {totalStores} stores
                    </div>
                </div>
            </div>

            {/* Stores List */}
            {filteredStores.length ? (
                <div className="space-y-4">
                    {filteredStores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                            <div className="p-6 flex flex-col lg:flex-row lg:items-start gap-6">
                                {/* Store Info */}
                                <div className="flex-1">
                                    <StoreInfo store={store} />
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 pt-4 lg:pt-0 lg:border-l lg:border-slate-200 lg:pl-6">
                                    <div className="flex flex-col gap-4">
                                        {/* Status Toggle */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-slate-700">Store Status</span>
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        onChange={() => toast.promise(
                                                            toggleIsActive(store.id), 
                                                            { 
                                                                loading: "Updating store status...", 
                                                                success: "Store status updated!",
                                                                error: "Failed to update status"
                                                            }
                                                        )} 
                                                        checked={store.isActive} 
                                                    />
                                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                                <span className={`text-sm font-medium ${store.isActive ? 'text-green-600' : 'text-slate-500'}`}>
                                                    {store.isActive ? (
                                                        <span className="flex items-center gap-1">
                                                            <Activity size={14} />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <ToggleLeft size={14} />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Additional Actions */}
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Store Footer */}
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-4">
                                        <span>Store ID: <strong>{store.id}</strong></span>
                                        <span>•</span>
                                        <span>Last Updated: {new Date(store.updatedAt || store.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${store.isActive ? 'text-green-600' : 'text-orange-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${store.isActive ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                        <span>{store.isActive ? 'Currently Active' : 'Currently Inactive'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <Store className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        {searchTerm || statusFilter !== "all" ? "No stores found" : "No stores available"}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        {searchTerm || statusFilter !== "all" 
                            ? "Try adjusting your search or filter to find what you're looking for."
                            : "There are no stores registered on DreamSaver yet. Stores will appear here once they register and get approved."
                        }
                    </p>
                    {(searchTerm || statusFilter !== "all") && (
                        <button 
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                            }}
                            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    ) : (
        <div className="flex items-center justify-center min-h-96">
            <Loading />
        </div>
    )
}