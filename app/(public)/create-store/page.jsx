'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function CreateStore() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { getToken } = useAuth()

  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    image: ""
  })

  const onChangeHandler = (e) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
  }

  const fetchSellerStatus = async () => {
    const token = await getToken()
    try {
      const { data } = await axios.get("/api/store/create", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (["approved", "rejected", "pending"].includes(data.status)) {
        setStatus(data.status)
        setAlreadySubmitted(true)
        switch (data.status) {
          case "approved":
            setMessage("Your store has been approved, you can now add products to your store from dashboard")
            setTimeout(() => router.push("/store"), 5000)
            break
          case "rejected":
            setMessage("Your store request has been rejected, contact the admin for more details")
            break
          case "pending":
            setMessage("Your store request is pending, please wait for admin to approve your store")
            break
          default:
            break
        }
      } else {
        setAlreadySubmitted(false)
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!user) return toast("Please login to continue")

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append("name", storeInfo.name)
      formData.append("description", storeInfo.description)
      formData.append("username", storeInfo.username)
      formData.append("email", storeInfo.email)
      formData.append("contact", storeInfo.contact)
      formData.append("address", storeInfo.address)
      formData.append("image", storeInfo.image)

      const { data } = await axios.post("/api/store/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(data.message)
      await fetchSellerStatus()
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  // ✅ Wait for Clerk user to load properly
  useEffect(() => {
    if (!isLoaded) return // wait until Clerk is ready
    if (user) {
      fetchSellerStatus()
    } else {
      setLoading(false) // user not logged in, stop loading
    }
  }, [isLoaded, user])

  // ✅ Show loading while Clerk or fetch is in progress
  if (!isLoaded || loading) return <Loading />

  // ✅ If user is not logged in
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-600 bg-gradient-to-br from-indigo-50 to-purple-100 text-center px-6">
        <h1 className="text-3xl sm:text-4xl font-semibold">
          Please <span className="text-indigo-600">Login</span> to continue
        </h1>
      </div>
    )
  }

  // ✅ Main Page Rendering
  return (
    <>
      {!alreadySubmitted ? (
        <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
          {/* Floating Card */}
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-12 border border-slate-200 transition-transform hover:scale-[1.01] duration-300">

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
                Create Your{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent font-bold">
                  DreamSaver
                </span>{" "}
                Store
              </h1>
              <p className="text-slate-500 mt-3 text-base sm:text-lg max-w-2xl mx-auto">
                Showcase your brand to millions! Submit your store details for DreamSaver’s verification. You’ll go live once approved.
              </p>
            </div>

            {/* Upload Section */}
            <div className="flex flex-col items-center gap-3">
              <label className="cursor-pointer flex flex-col items-center">
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 transition-all bg-white w-60 flex flex-col items-center justify-center">
                  <Image
                    src={
                      storeInfo.image
                        ? URL.createObjectURL(storeInfo.image)
                        : assets.upload_area
                    }
                    className="rounded-xl object-contain h-20 w-auto"
                    alt="Store logo"
                    width={150}
                    height={100}
                  />
                  <p className="mt-2 text-sm text-slate-500 font-medium">
                    Click to upload store logo
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                  }
                  hidden
                />
              </label>
            </div>

            {/* Form Fields */}
            <form
              onSubmit={(e) =>
                toast.promise(onSubmitHandler(e), { loading: "Submitting..." })
              }
              className="mt-10 space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    onChange={onChangeHandler}
                    value={storeInfo.username}
                    type="text"
                    placeholder="Enter your store username"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Store Name
                  </label>
                  <input
                    name="name"
                    onChange={onChangeHandler}
                    value={storeInfo.name}
                    type="text"
                    placeholder="Enter your store name"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    onChange={onChangeHandler}
                    value={storeInfo.description}
                    rows={4}
                    placeholder="Describe your store..."
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    onChange={onChangeHandler}
                    value={storeInfo.email}
                    type="email"
                    placeholder="Enter your store email"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Contact Number
                  </label>
                  <input
                    name="contact"
                    onChange={onChangeHandler}
                    value={storeInfo.contact}
                    type="text"
                    placeholder="Enter your contact number"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    onChange={onChangeHandler}
                    value={storeInfo.address}
                    rows={3}
                    placeholder="Enter your store address"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-10">
                <button className="relative bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-slate-800 px-12 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-indigo-300/50 hover:scale-105 transition-all duration-300 border border-indigo-300">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-indigo-50 to-purple-100">
          <p className="sm:text-2xl lg:text-3xl font-semibold text-slate-700 max-w-2xl">
            {message}
          </p>
          {status === "approved" && (
            <p className="mt-5 text-slate-500">
              Redirecting to dashboard in{" "}
              <span className="font-semibold text-indigo-600">5 seconds</span>
            </p>
          )}
        </div>
      )}
    </>
  )
}
