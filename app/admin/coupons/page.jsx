'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"

export default function AdminCoupons() {
  const { getToken } = useAuth()
  const [coupons, setCoupons] = useState([])

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount: '',
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date()
  })

  const fetchCoupons = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/coupon', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCoupons(data.coupons)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handleAddCoupon = async (e) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const couponToSend = { 
        ...newCoupon, 
        discount: Number(newCoupon.discount), 
        expiresAt: new Date(newCoupon.expiresAt) 
      }

      const { data } = await axios.post('/api/admin/coupon', { coupon: couponToSend }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(data.message)
      setNewCoupon({ code: '', description: '', discount: '', forNewUser: false, forMember: false, isPublic: false, expiresAt: new Date() })
      await fetchCoupons()
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handleChange = (e) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
  }

  const deleteCoupon = async (code) => {
    try {
      if (!window.confirm("Are you sure you want to delete this coupon?")) return
      const token = await getToken()
      await axios.delete(`/api/admin/coupon?code=${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchCoupons()
      toast.success("Coupon deleted successfully")
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-700">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">DreamSaver <span className="text-indigo-600">Admin Panel</span></h1>

        {/* Add Coupon */}
        <form onSubmit={handleAddCoupon} className="bg-white shadow-md rounded-xl p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add <span className="text-indigo-600">Coupon</span></h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Coupon Code" 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              name="code" value={newCoupon.code} onChange={handleChange} required />

            <input type="number" placeholder="Discount (%)" min={1} max={100} 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              name="discount" value={newCoupon.discount} onChange={handleChange} required />
          </div>

          <input type="text" placeholder="Description" 
            className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            name="description" value={newCoupon.description} onChange={handleChange} required />

          <label className="block mt-4">
            <span className="text-gray-700 font-medium">Expiry Date</span>
            <input type="date" className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange} />
          </label>

          <div className="flex flex-col md:flex-row md:gap-6 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="forNewUser" checked={newCoupon.forNewUser} 
                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                className="w-4 h-4 accent-indigo-600" />
              For New User
            </label>
            <label className="flex items-center gap-2 mt-2 md:mt-0">
              <input type="checkbox" name="forMember" checked={newCoupon.forMember} 
                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                className="w-4 h-4 accent-indigo-600" />
              For Member
            </label>
          </div>

          <button className="mt-6 w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition transform active:scale-95">
            Add Coupon
          </button>
        </form>

        {/* List Coupons */}
        <div className="bg-white shadow-md rounded-xl p-6 md:p-8 overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">List <span className="text-indigo-600">Coupons</span></h2>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 rounded-t-xl">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Code</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Description</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Discount</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Expires</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">New User</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Member</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.code} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{coupon.code}</td>
                  <td className="py-3 px-4">{coupon.description}</td>
                  <td className="py-3 px-4">{coupon.discount}%</td>
                  <td className="py-3 px-4">{format(new Date(coupon.expiresAt), 'yyyy-MM-dd')}</td>
                  <td className="py-3 px-4">{coupon.forNewUser ? "Yes" : "No"}</td>
                  <td className="py-3 px-4">{coupon.forMember ? "Yes" : "No"}</td>
                  <td className="py-3 px-4">
                    <DeleteIcon onClick={() => deleteCoupon(coupon.code)} 
                      className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer transition" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
