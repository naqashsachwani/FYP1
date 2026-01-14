'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
 
    const { getToken } = useAuth()

    const fetchOrders = async () => {
       try {
         const token = await getToken()
         const { data } = await axios.get('/api/store/orders', {
            headers: { Authorization: `Bearer ${token}` }
         })
         setOrders(data.orders || [])
       } catch (error) {
         toast.error(error?.response?.data?.error || error.message)
       } finally {
         setLoading(false)
       }
    }   

    const updateOrderStatus = async (orderId, status) => {
       try {
         const token = await getToken()
         await axios.post('/api/store/orders', { orderId, status }, {
            headers: { Authorization: `Bearer ${token}` }
         })
         setOrders(prev =>
            prev.map(order =>
               order.id === orderId ? { ...order, status } : order
            )
         )
         toast.success('Order status updated!')
       } catch (error) {
         toast.error(error?.response?.data?.error || error.message)
       }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
            case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'PROCESSING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'ORDER_PLACED': return 'bg-purple-100 text-purple-800 border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPaymentColor = (paymentMethod) => {
        return paymentMethod === 'COD' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Dream<span className="text-blue-600">Saver</span>
                    </h1>
                    <p className="text-lg text-gray-600">Store Orders Management</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <span className="text-blue-600 text-xl">📦</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <span className="text-green-600 text-xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {orders.filter(order => order.status === 'DELIVERED').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <span className="text-yellow-600 text-xl">🔄</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Processing</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {orders.filter(order => order.status === 'PROCESSING').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <span className="text-purple-600 text-xl">🚚</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Shipped</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {orders.filter(order => order.status === 'SHIPPED').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Table/Cards */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-3xl">📭</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <tr>
                                            {["Order No.", "Customer", "Total", "Payment", "Coupon", "Status", "Date", "Actions"].map((heading, i) => (
                                                <th key={i} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.map((order, index) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                                                onClick={() => openModal(order)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-blue-600">#{index + 1}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{order.user?.name}</div>
                                                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">${order.total}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.paymentMethod !== 'COD' && (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentColor(order.paymentMethod)}`}>
                                                            {order.paymentMethod}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.isCouponUsed ? (
                                                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                                            {order.coupon?.code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={order.status}
                                                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                        className={`border-0 rounded-full text-sm font-medium px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="ORDER_PLACED">Order Placed</option>
                                                        <option value="PROCESSING">Processing</option>
                                                        <option value="SHIPPED">Shipped</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openModal(order)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4">
                            {orders.map((order, index) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">{order.user?.name}</h3>
                                            <p className="text-sm text-gray-600">{order.user?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-gray-900">${order.total}</div>
                                            {order.paymentMethod !== 'COD' && (
                                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentColor(order.paymentMethod)}`}>
                                                    {order.paymentMethod}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Date:</span>
                                            <div className="font-medium text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Coupon:</span>
                                            <div className="font-medium text-gray-900">
                                                {order.isCouponUsed ? order.coupon?.code : '—'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`border-0 rounded-full text-sm font-medium px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(order.status)}`}
                                        >
                                            <option value="ORDER_PLACED">Order Placed</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openModal(order)
                                            }}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Modal */}
                {isModalOpen && selectedOrder && (
                    <div
                        onClick={closeModal}
                        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            Order Details
                                        </h2>
                                        <p className="text-blue-100">Order #{orders.findIndex(o => o.id === selectedOrder.id) + 1}</p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="text-white hover:text-blue-200 transition-colors text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Customer Details */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                        Customer Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Name:</span>
                                            <p className="font-medium text-gray-900">{selectedOrder.user?.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Email:</span>
                                            <p className="font-medium text-gray-900">{selectedOrder.user?.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Phone:</span>
                                            <p className="font-medium text-gray-900">{selectedOrder.address?.phone || 'N/A'}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="text-gray-600">Address:</span>
                                            <p className="font-medium text-gray-900">
                                                {selectedOrder.address ? 
                                                    `${selectedOrder.address.street}, ${selectedOrder.address.city}, ${selectedOrder.address.state} ${selectedOrder.address.zip}, ${selectedOrder.address.country}`
                                                    : 'N/A'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                        Order Items
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.orderItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                                <img
                                                    src={item.product.images?.[0]?.src || item.product.images?.[0] || '/api/placeholder/80/80'}
                                                    alt={item.product?.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/api/placeholder/80/80'
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{item.product?.name}</p>
                                                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>Price: ${item.price}</span>
                                                        <span className="font-semibold text-gray-900">
                                                            Total: ${(item.quantity * item.price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                                        Order Summary
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment Method:</span>
                                                <span className="font-medium text-gray-900">
                                                    {selectedOrder.paymentMethod !== 'COD' ? selectedOrder.paymentMethod : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment Status:</span>
                                                <span className={`font-medium ${selectedOrder.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Coupon Used:</span>
                                                <span className="font-medium text-gray-900">
                                                    {selectedOrder.isCouponUsed ? 
                                                        `${selectedOrder.coupon.code} (${selectedOrder.coupon.discount}% off)` 
                                                        : 'None'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Order Date:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(selectedOrder.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="font-semibold text-gray-900">Grand Total:</span>
                                            <span className="text-2xl font-bold text-blue-600">${selectedOrder.total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}