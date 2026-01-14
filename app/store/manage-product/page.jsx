'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { Pencil, Trash2 } from "lucide-react"

export default function StoreManageProducts() {

  const { getToken } = useAuth()
  const { user } = useUser()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({ name: "", price: "", mrp: "", description: "" })

  const fetchProducts = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/store/product', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  const toggleStock = async (productId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/store/stock-toggle',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, inStock: !p.inStock } : p))
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handleEditClick = (product) => {
    setEditingProduct(product.id)
    setFormData({
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      description: product.description,
    })
  }

  const handleEditSubmit = async (id) => {
    try {
      const token = await getToken()
      const { data } = await axios.put(
        '/api/store/product',
        { id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...formData } : p))
      setEditingProduct(null)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = await getToken()
      await axios.delete(`/api/store/product?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Product deleted successfully")
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  useEffect(() => {
    if (user) fetchProducts()
  }, [user])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Manage <span className="text-blue-600">Products</span>
        </h1>
        <p className="text-gray-600 mb-6">Update, edit, or remove items from your <span className="font-medium text-blue-500">DreamSaver</span> store catalog.</p>

        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 hidden md:table-cell">Description</th>
                <th className="px-6 py-4 hidden md:table-cell">MRP</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="border-t hover:bg-blue-50 transition-all">
                  {/* Product Name */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Image
                      width={50}
                      height={50}
                      className="p-1 rounded-xl shadow-md bg-white"
                      src={product.images[0]}
                      alt={product.name}
                    />
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        className="border border-gray-300 p-1.5 rounded-lg text-sm w-36"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <span className="font-semibold">{product.name}</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        className="border border-gray-300 p-1.5 rounded-lg text-sm w-full"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-500">{product.description}</span>
                    )}
                  </td>

                  {/* MRP */}
                  <td className="px-6 py-4 hidden md:table-cell text-gray-500 line-through">
                    {currency}{product.mrp.toLocaleString()}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {currency}{product.price.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating..." })}
                          checked={product.inStock}
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                        <span className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                      </label>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-3 flex-wrap md:flex-nowrap">
                      {editingProduct === product.id ? (
                        <button
                          onClick={() => handleEditSubmit(product.id)}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-md transition-all"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick(product)}
                          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-md transition-all"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
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
