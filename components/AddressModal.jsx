'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { addAddress } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal }) => {
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const token = await getToken()
            const { data } = await axios.post(
                '/api/address',
                { address },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            dispatch(addAddress(data.newAddress))
            toast.success(data.message || 'Address added successfully!')
            setShowAddressModal(false)
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 sm:px-0">
            <form
                onSubmit={(e) => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-fadeIn"
            >
                {/* Close Icon */}
                <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition"
                >
                    <XIcon size={28} />
                </button>

                {/* Header */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6">
                    Add New <span className="text-slate-800">Address</span>
                </h2>

                {/* Inputs */}
                <div className="flex flex-col gap-4">
                    <input name="name" onChange={handleAddressChange} value={address.name}
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                        type="text" placeholder="Enter your full name" required />

                    <input name="email" onChange={handleAddressChange} value={address.email}
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                        type="email" placeholder="Email address" required />

                    <input name="street" onChange={handleAddressChange} value={address.street}
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                        type="text" placeholder="Street / Apartment / Building" required />

                    {/* City & State */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input name="city" onChange={handleAddressChange} value={address.city}
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                            type="text" placeholder="City" required />
                        <input name="state" onChange={handleAddressChange} value={address.state}
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                            type="text" placeholder="State / Province" required />
                    </div>

                    {/* Zip & Country */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input name="zip" onChange={handleAddressChange} value={address.zip}
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                            type="number" placeholder="Zip Code" required />
                        <input name="country" onChange={handleAddressChange} value={address.country}
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                            type="text" placeholder="Country" required />
                    </div>

                    <input name="phone" onChange={handleAddressChange} value={address.phone}
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full transition"
                        type="text" placeholder="Phone Number" required />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 active:scale-95 shadow-md transition-all duration-300"
                >
                    SAVE ADDRESS
                </button>

                {/* Branding */}
                <p className="text-center text-xs sm:text-sm text-slate-400 mt-4">
                    Powered by <span className="font-semibold text-blue-700">DreamSaver</span>
                </p>
            </form>
        </div>
    )
}

export default AddressModal
