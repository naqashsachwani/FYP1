'use client'
import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function StoreAddProduct() {
  const categories = [
    'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health',
    'Toys & Games', 'Sports & Outdoors', 'Books & Media',
    'Food & Drink', 'Hobbies & Crafts', 'Others'
  ]

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    mrp: 0,
    price: 0,
    category: "",
  })
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const onChangeHandler = (e) => {
    const { name, value } = e.target
    setProductInfo(prev => ({ ...prev, [name]: value }))
  }

  // Simplified image handler: just store the File object (no AI)
  const handleImageUpload = (key, file) => {
    setImages(prev => ({ ...prev, [key]: file }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      if (!images[1] && !images[2] && !images[3] && !images[4]) {
        return toast.error('Please upload at least one image')
      }
      setLoading(true)

      const formData = new FormData()
      formData.append('name', productInfo.name)
      formData.append('description', productInfo.description)
      formData.append('mrp', productInfo.mrp)
      formData.append('price', productInfo.price)
      formData.append('category', productInfo.category)

      Object.keys(images).forEach((key) => {
        if (images[key]) formData.append('images', images[key])
      })

      const token = await getToken()
      const { data } = await axios.post('/api/store/product', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      })

      toast.success(data?.message || "Product added")
      setProductInfo({ name: "", description: "", mrp: 0, price: 0, category: "" })
      setImages({ 1: null, 2: null, 3: null, 4: null })
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center px-5 py-10 md:px-16 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <h1 className="text-3xl font-semibold text-slate-800 mb-6 text-center">
        DreamSaver <span className="text-blue-600">Product Upload</span>
      </h1>

      <form
        onSubmit={(e) =>
          toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })
        }
        className="bg-white w-full max-w-2xl shadow-md rounded-2xl p-6 sm:p-8 border border-slate-100"
      >
        {/* Product Images */}
        <div>
          <p className="text-slate-700 font-medium mb-2">Product Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(images).map((key) => (
              <label
                key={key}
                htmlFor={`images${key}`}
                className="cursor-pointer hover:scale-[1.03] transition-transform"
              >
                <div className="relative">
                  <Image
                    width={200}
                    height={200}
                    className="h-24 w-full object-cover border border-slate-200 rounded-lg bg-slate-50"
                    src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
                    alt={`upload-${key}`}
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  id={`images${key}`}
                  onChange={e => handleImageUpload(key, e.target.files[0])}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <label className="flex flex-col gap-2 my-5">
          <span className="font-medium text-slate-700">Product Name</span>
          <input
            type="text"
            name="name"
            onChange={onChangeHandler}
            value={productInfo.name}
            placeholder="Enter product name"
            className="p-3 outline-none border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>

        {/* Description */}
        <label className="flex flex-col gap-2 my-5">
          <span className="font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            onChange={onChangeHandler}
            value={productInfo.description}
            placeholder="Enter product description"
            rows={4}
            className="p-3 outline-none border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none"
            required
          />
        </label>

        {/* Price Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="font-medium text-slate-700">Actual Price (PKR)</span>
            <input
              type="number"
              name="mrp"
              onChange={onChangeHandler}
              value={productInfo.mrp}
              placeholder="0"
              className="p-3 outline-none border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-medium text-slate-700">Offer Price (PKR)</span>
            <input
              type="number"
              name="price"
              onChange={onChangeHandler}
              value={productInfo.price}
              placeholder="0"
              className="p-3 outline-none border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        </div>

        {/* Category */}
        <div className="mt-5">
          <label className="font-medium text-slate-700 mb-2 block">
            Category
          </label>
          <select
            onChange={(e) =>
              setProductInfo({ ...productInfo, category: e.target.value })
            }
            value={productInfo.category}
            className="p-3 w-full border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          className={`mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all ${loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  )
}
