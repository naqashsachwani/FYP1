'use client'
import { useEffect, useState, useMemo } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import { Search, MapPin, Truck, Crosshair } from "lucide-react" // Added Crosshair icon
import dynamic from 'next/dynamic'

const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), { ssr: false });

export default function StoreOrders() {
    const [orders, setOrders] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const { getToken } = useAuth()

    const fetchOrders = async () => {
       try {
         const token = await getToken()
         const { data } = await axios.get('/api/store/deliveries', {
            headers: { Authorization: `Bearer ${token}` }
         })
         setOrders(data.deliveries || [])
       } catch (error) {
         toast.error("Failed to fetch orders")
       } finally {
         setLoading(false)
       }
    }    

    const updateOrderStatus = async (deliveryId, status) => {
       try {
         const token = await getToken()
         await axios.post(`/api/delivery/${deliveryId}`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
         })
         
         setOrders(prev => prev.map(o => o.id === deliveryId ? { ...o, status } : o))
         toast.success(`Order marked as ${status}`)
       } catch (error) {
         toast.error("Failed to update status")
       }
    }

    // ✅ FEATURE 1: SIMULATE (Fixed to update map instantly)
    const simulateDriverUpdate = async (deliveryId) => {
        try {
            const token = await getToken()
            // Random point near Karachi
            const randomLat = 24.8607 + (Math.random() * 0.01); 
            const randomLng = 67.0011 + (Math.random() * 0.01);
            
            await updateLocation(deliveryId, randomLat, randomLng, "Simulated Driver");
        } catch (error) {
            toast.error("Simulation failed")
        }
    }

    // ✅ FEATURE 2: USE REAL BROWSER LOCATION
    const useBrowserLocation = (deliveryId) => {
        if (!navigator.geolocation) return toast.error("Geolocation not supported");
        
        toast.loading("Getting your location...", { id: "geo" });
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                toast.dismiss("geo");
                updateLocation(deliveryId, latitude, longitude, "Store Admin Location");
            },
            () => {
                toast.dismiss("geo");
                toast.error("Unable to retrieve location");
            }
        );
    }

    // Helper function to send update and refresh UI
    const updateLocation = async (id, lat, lng, source) => {
        const token = await getToken();
        
        // 1. Send to Backend
        await axios.post(`/api/delivery/${id}`, {
            status: 'IN_TRANSIT',
            latitude: lat,
            longitude: lng,
            location: source
        }, { headers: { Authorization: `Bearer ${token}` } });

        // 2. Create new Tracking Object
        const newTracking = {
            latitude: lat,
            longitude: lng,
            location: source,
            recordedAt: new Date().toISOString()
        };

        // 3. Update Local State (So map updates instantly)
        const updatedOrder = {
            ...selectedOrder,
            status: 'IN_TRANSIT',
            // Prepend new tracking to the existing array
            deliveryTrackings: [newTracking, ...(selectedOrder.deliveryTrackings || [])]
        };

        setSelectedOrder(updatedOrder);
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
        
        toast.success("Location updated successfully");
    }
 
    const stats = useMemo(() => {
        return {
            total: orders.length,
            delivered: orders.filter(o => o.status === 'DELIVERED').length,
            transit: orders.filter(o => o.status === 'IN_TRANSIT').length,
            dispatched: orders.filter(o => o.status === 'DISPATCHED').length, 
            pending: orders.filter(o => o.status === 'PENDING').length,
        }
    }, [orders])

    const filteredOrders = orders.filter(order => 
        order.goal?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const openModal = (order) => { setSelectedOrder(order); setIsModalOpen(true); }
    const closeModal = () => { setSelectedOrder(null); setIsModalOpen(false); }

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
            case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'DISPATCHED': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    useEffect(() => { fetchOrders() }, [])

    if (loading) return <Loading />

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order<span className="text-blue-600"> Management</span></h1>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search Order or Tracking #" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', val: stats.total, icon: '📦', color: 'bg-blue-100' },
                        { label: 'Delivered', val: stats.delivered, icon: '✅', color: 'bg-green-100' },
                        { label: 'In Transit', val: stats.transit, icon: '🚚', color: 'bg-purple-100' },
                        { label: 'Dispatched', val: stats.dispatched, icon: '📤', color: 'bg-orange-100' }, 
                        { label: 'Pending', val: stats.pending, icon: '⏳', color: 'bg-yellow-100' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border flex items-center">
                            <div className={`p-3 rounded-lg ${stat.color} mr-4`}>{stat.icon}</div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {["Tracking #", "Customer", "Product", "Scheduled Date", "Status", "Actions"].map((h, i) => (
                                    <th key={i} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} onClick={() => openModal(order)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600">{order.trackingNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{order.goal?.user?.name || "User"}</div>
                                        <div className="text-xs text-gray-500">{order.goal?.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {order.goal?.product?.images?.[0] && (
                                                <img src={order.goal.product.images[0]} className="w-8 h-8 rounded object-cover border" />
                                            )}
                                            <span className="text-sm text-gray-700">{order.goal?.product?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(order.estimatedDate).toDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={order.status} 
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`text-xs font-bold px-2 py-1 rounded-full border-0 ${getStatusColor(order.status)}`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="DISPATCHED">Dispatched</option>
                                            <option value="IN_TRANSIT">In Transit</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && <div className="p-10 text-center text-gray-500">No orders found.</div>}
                </div>

                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={closeModal}>
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                                <h2 className="text-xl font-bold mb-1">Order Details</h2>
                                <p className="text-xs text-gray-400 font-mono mb-6">ID: {selectedOrder.id}</p>
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h3 className="font-bold text-sm text-gray-700 mb-2">Shipping Address</h3>
                                        <div className="flex gap-2 text-sm text-gray-600">
                                            <MapPin size={16} className="shrink-0 mt-0.5" />
                                            {selectedOrder.shippingAddress}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-700 mb-2">Product</h3>
                                        <div className="flex gap-4 border rounded-xl p-3">
                                            {selectedOrder.goal?.product?.images?.[0] && (
                                                <img src={selectedOrder.goal.product.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-sm">{selectedOrder.goal?.product?.name}</p>
                                                <p className="text-xs text-gray-500">Store: {selectedOrder.goal?.product?.store?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* ✅ DRIVER UPDATE CONTROLS */}
                                    <div className="border-t pt-4">
                                        <h3 className="font-bold text-sm text-gray-700 mb-3">Update Location</h3>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Button 1: Simulate Random */}
                                            <button 
                                                onClick={() => simulateDriverUpdate(selectedOrder.id)}
                                                className="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 flex justify-center items-center gap-2 border border-indigo-200"
                                            >
                                                <Truck size={16} /> Random Sim
                                            </button>

                                            {/* Button 2: Use Real Location */}
                                            <button 
                                                onClick={() => useBrowserLocation(selectedOrder.id)}
                                                className="w-full py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 flex justify-center items-center gap-2 border border-green-200"
                                            >
                                                <Crosshair size={16} /> Use My GPS
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                                            Updates the map instantly for both you and the customer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 bg-gray-100 border-l relative min-h-[300px]">
                                <DeliveryMap delivery={selectedOrder} />
                                <button onClick={closeModal} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-[1000]">✕</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}